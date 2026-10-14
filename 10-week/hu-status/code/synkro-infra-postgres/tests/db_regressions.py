"""Run the existing DB CI regression shell steps on guarded disposable engines."""
import json
import os
import subprocess
import sys
import tempfile
import uuid
from pathlib import Path
import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import operations as ops
from local_owner import execution_id
ROOT = Path(__file__).resolve().parents[1]


def execute(domain):
    owner = execution_id()
    project = 'synkro-regression-' + owner
    network = project + '-network'
    repo = ROOT.parent / ('synkro-' + domain + '-db')
    labels = {'synkro.execution': owner, 'synkro.disposable': 'true'}
    image = project + ':regressions'
    ops.run(['docker', 'build', '-t', image, '-f', str(ROOT / 'tests/fixtures/regressions.Dockerfile'), str(ROOT / 'tests/fixtures')], timeout=600)
    workflow = yaml.safe_load((repo / '.github/workflows/db-ci.yml').read_text())
    steps = workflow['jobs']['migration-rebuild']['steps']
    with tempfile.TemporaryDirectory(prefix='synkro-regression-') as folder:
        folder = Path(folder)
        secret = folder / 'password'
        secret.write_text('regression-sentinel')
        os.chmod(secret, 0o600)
        values = {'DB_ADMIN_USER': 'postgres', 'COMPOSE_PROJECT_NAME': project, 'PLATFORM_NETWORK': network}
        for role in ['DB_ADMIN','AUTH_APP','CUSTOMERS_APP','PRODUCTS_APP','WORKFLOW_APP']:
            values[role + '_PASSWORD_PATH'] = secret.as_posix()
        app_secret = folder / 'app-password'
        app_secret.write_text('ci_app_pw')
        os.chmod(app_secret, 0o600)
        values[domain.upper() + '_APP_PASSWORD_PATH'] = app_secret.as_posix()
        envfile = folder / 'compose.env'
        envfile.write_text('\n'.join(key + '=' + value for key, value in values.items()))
        credentials = folder / 'regression.env'
        credentials.write_text('FLYWAY_URL=jdbc:postgresql://synkro-db:5432/postgres\nFLYWAY_USER=postgres\nFLYWAY_PASSWORD=regression-sentinel\nPGPASSWORD=regression-sentinel\nSYNKRO_TEST_NETWORK=' + network + '\nSYNKRO_EXECUTION=' + owner + '\n')
        os.chmod(credentials, 0o600)
        config = folder / 'labels.json'
        config.write_text(json.dumps({'services': {'synkro-db': {'labels': labels}}, 'volumes': {'postgres-data': {'labels': labels}}}))
        command = ['docker','compose','-p',project,'--env-file',str(envfile),'-f',str(ROOT / 'compose.postgres.yml'),'-f',str(config)]
        def compose(*args):
            return ops.run(command + list(args), env=dict(os.environ, **values), timeout=300)
        wrapper = folder / 'flyway'
        wrapper.write_text('''#!/usr/bin/env bash
set -euo pipefail
cid=$(docker create --network "$SYNKRO_TEST_NETWORK" --label "synkro.execution=$SYNKRO_EXECUTION" --label synkro.disposable=true -e FLYWAY_URL -e FLYWAY_USER -e FLYWAY_PASSWORD flyway/flyway:11.20.3-alpine -workingDirectory=/workspace "$@")
trap 'docker rm -f "$cid" >/dev/null' EXIT
docker cp -q /workspace/. "$cid:/workspace"
docker start -a "$cid"
exit "$(docker inspect -f '{{.State.ExitCode}}' "$cid")"
''', newline='\n')
        os.chmod(wrapper, 0o755)
        script = 'set -euo pipefail\n'
        started = False
        count = 0
        for step in steps:
            if step.get('name','').startswith('Migrate from empty'):
                started = True
            if started and 'run' in step:
                script += '\nprintf "Running owning repository regression step %s\\n" ' + str(count+1) + '\n'
                script += step['run'].replace('-h localhost', '-h synkro-db') + '\n'
                count += 1
        if count < 3:
            raise ops.Failure('Regression retrieval failed; no passing skipped suite')
        path = folder / 'suite.sh'
        path.write_text(script, newline='\n')
        ops.run(['docker','network','create','--label','synkro.execution='+owner,'--label','synkro.disposable=true',network])
        try:
            compose('up','-d','--wait','--wait-timeout','150','synkro-db')
            result = subprocess.run(['docker','run','--rm','--label','synkro.execution='+owner,'--label','synkro.disposable=true',
                '--network',network,'--env-file',str(credentials),
                '--mount',f'type=bind,source={repo},target=/workspace,readonly',
                '--mount',f'type=bind,source={path},target=/suite.sh,readonly',
                '--mount',f'type=bind,source={wrapper},target=/usr/local/bin/flyway,readonly',
                '--mount','type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock',
                image,'/suite.sh'], capture_output=True, timeout=600)
            if result.returncode:
                print((result.stdout+result.stderr).decode(errors='replace').replace('regression-sentinel','[REDACTED]')[-8000:], file=sys.stderr)
                raise ops.Failure(domain + ' existing DB regression failed')
            print(f'PASS {domain}: all {count} existing DB CI regression steps, including disposable rollback/rebuild, passed')
        finally:
            for identifier in ops.run(['docker','ps','-aq','--filter','label=com.docker.compose.project='+project]).split():
                item=json.loads(ops.run(['docker','inspect',identifier]))[0]
                if item['Config']['Labels'].get('synkro.execution') != owner:
                    raise ops.Failure('Regression cleanup refused unowned container')
            for identifier in ops.run(['docker','volume','ls','-q','--filter','label=com.docker.compose.project='+project]).split():
                item=json.loads(ops.run(['docker','volume','inspect',identifier]))[0]
                if item['Labels'].get('synkro.execution') != owner:
                    raise ops.Failure('Regression cleanup refused unowned volume')
            compose('down','--volumes','--timeout','20')
            item=json.loads(ops.run(['docker','network','inspect',network]))[0]
            if item['Labels'].get('synkro.execution') != owner or item['Containers']:
                raise ops.Failure('Regression cleanup refused shared network')
            ops.run(['docker','network','rm',network])
            print('PASS regression disposable resources removed')


if __name__ == '__main__':
    try:
        if len(sys.argv) != 2 or sys.argv[1] not in ['auth','products']:
            raise ops.Failure('Select auth or products regression explicitly')
        execute(sys.argv[1])
    except ops.Failure as error:
        print('FAIL '+str(error), file=sys.stderr)
        sys.exit(1)
