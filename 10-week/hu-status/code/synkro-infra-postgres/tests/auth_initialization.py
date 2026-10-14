"""Run the shipped Auth CLI and its owner integration suite on an owned database."""
import json
import os
import subprocess
import sys
import tempfile
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import operations as ops
from local_owner import execution_id

ROOT = Path(__file__).resolve().parents[1]


def composition_file(directory):
    # This owning Auth fixture deliberately needs only the instance and Auth runner.
    file = directory / 'auth-compose.json'
    file.write_text(json.dumps({'include': [str(ROOT / 'compose.postgres.yml'),
                                          str(ROOT.parent / 'synkro-auth-db/deploy/compose.yml')]}))
    return file


def execute():
    owner = execution_id()
    project = 'synkro-auth-test-' + owner
    network = project + '-network'
    database = 'synkro_auth_disposable_' + owner
    labels = {'synkro.execution': owner, 'synkro.disposable': 'true'}
    source = ROOT.parent / 'synkro-auth-api'
    image, build = project + ':runtime', project + ':build'
    input_volume = project + '-inputs'
    inputs_created = False
    secrets = [uuid.uuid4().hex + '$:@!', uuid.uuid4().hex + '$:@!', uuid.uuid4().hex + '$:@!']

    def checked(command, *, env=None, data=None, timeout=900):
        result = subprocess.run(command, env=env, input=data, capture_output=True, timeout=timeout)
        output = (result.stdout + result.stderr).decode(errors='replace')
        if any(value in output for value in secrets):
            raise ops.Failure('Auth check disclosed a disposable credential; output withheld')
        if result.returncode:
            print(output[-5000:], file=sys.stderr)
            raise ops.Failure('Auth owning image/suite failed with exit ' + str(result.returncode))
        return output

    with tempfile.TemporaryDirectory(prefix='synkro-auth-init-') as directory:
        directory = Path(directory)
        admin, app, initial = [directory / name for name in ('admin-password', 'app-password', 'initial-password')]
        for path, secret in zip((admin, app, initial), secrets):
            path.write_text(secret, encoding='utf-8')
            ops.protect_created(path)
        values = {'COMPOSE_PROJECT_NAME': project, 'PLATFORM_NETWORK': network, 'DB_ADMIN_USER': 'postgres',
                  'FLYWAY_URL': f'jdbc:postgresql://synkro-db:5432/{database}?connectTimeout=5&socketTimeout=60',
                  'FLYWAY_USER': 'postgres', 'FLYWAY_PASSWORD': secrets[0]}
        for role in ('DB_ADMIN', 'AUTH_APP', 'CUSTOMERS_APP', 'PRODUCTS_APP', 'WORKFLOW_APP'):
            values[role + '_PASSWORD_PATH'] = (admin if role == 'DB_ADMIN' else app).as_posix()
        override = directory / 'ownership.json'
        override.write_text(json.dumps({'services': {'synkro-db': {'labels': labels, 'environment': {'POSTGRES_DB': database}}},
                                        'volumes': {'postgres-data': {'labels': labels}}}))
        environment = dict(os.environ, **values)
        command = ['docker', 'compose', '-p', project, '-f', str(composition_file(directory)), '-f', str(override)]
        def compose(*args): return ops.run(command + list(args), env=environment, timeout=300)
        def sql(query):
            return compose('exec', '-T', 'synkro-db', 'sh', '-c',
                'export PGPASSWORD="$(cat "$DB_ADMIN_PASSWORD_FILE")"; exec psql -X -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc ' + "'" + query.replace("'", "'\\''") + "'").strip()
        ops.run(['docker', 'network', 'create', '--label', 'synkro.execution=' + owner, '--label', 'synkro.disposable=true', network])
        try:
            compose('up', '-d', '--wait', '--wait-timeout', '150', 'synkro-db')
            compose('--profile', 'tooling', 'run', '--rm', '--no-deps', 'auth-db-migrate')
            checked(['docker', 'build', '--target', 'build', '-t', build, '-f', str(source / 'deploy/Dockerfile'), str(source)])
            checked(['docker', 'build', '-t', image, '-f', str(source / 'deploy/Dockerfile'), str(source)])
            metadata = json.loads(ops.run(['docker', 'image', 'inspect', image]))[0]
            if metadata['Config']['User'] != 'synkro':
                raise ops.Failure('Auth initializer must use the shipped non-root image user')
            ops.run(['docker', 'volume', 'create', '--label', 'synkro.execution=' + owner,
                     '--label', 'synkro.disposable=true', input_volume])
            inputs_created = True
            # Provision only this test-owned secret volume to the shipped Linux UID.
            # CLI mounts it read-only; host secrets remain owner-only on either OS.
            for name, path in [('auth_app_password', app), ('initial_admin_password', initial)]:
                checked(['docker', 'run', '--rm', '-i', '--label', 'synkro.execution=' + owner,
                         '--mount', f'type=volume,source={input_volume},target=/secret-inputs', '--user', '0',
                         '--entrypoint', 'sh', image, '-c',
                         f'umask 077; cat > /secret-inputs/{name}; chown synkro:synkro /secret-inputs/{name}; chmod 400 /secret-inputs/{name}'],
                        data=path.read_bytes())
            db_url = f'jdbc:postgresql://synkro-db:5432/{database}?currentSchema=auth_schema'
            cli_env = dict(os.environ, SPRING_DATASOURCE_URL=db_url, SPRING_DATASOURCE_USERNAME='auth_app',
                           SPRING_DATASOURCE_PASSWORD_FILE='/run/secrets/auth_app_password',
                           SYNKRO_INIT_OPERATOR='controlled-disposable-deployment/' + owner)
            cli = ['docker', 'run', '--rm', '--network', network, '--label', 'synkro.execution=' + owner,
                   '--label', 'synkro.disposable=true', '-e', 'SPRING_DATASOURCE_URL', '-e', 'SPRING_DATASOURCE_USERNAME',
                   '-e', 'SPRING_DATASOURCE_PASSWORD_FILE', '-e', 'SYNKRO_INIT_OPERATOR',
                   '--mount', f'type=volume,source={input_volume},target=/run/secrets,readonly',
                   '--entrypoint', 'java', image, '-cp', '/app/auth-app.jar',
                   '-Dloader.main=co.edu.corhuila.synkro.auth.app.InitialAdminCli',
                   'org.springframework.boot.loader.launch.PropertiesLauncher', '--name', 'Disposable Admin',
                   '--email', 'init-' + owner + '@synkro.test', '--password-file', '/run/secrets/initial_admin_password']
            first = checked(cli + ['--correlation-id', 'infra-init-first'], env=cli_env)
            if 'result=created' not in first:
                raise ops.Failure('Packaged Auth CLI did not create the initial ADMIN')
            snapshot = sql("SELECT count(*) || ':' || (SELECT count(*) FROM auth_schema.user_creation_audit WHERE operation='INITIAL_ADMIN_CREATED') FROM auth_schema.system_user WHERE role='ADMIN'")
            if snapshot != '1:1':
                raise ops.Failure('ADMIN and creation audit were not both committed')
            attribution = sql("SELECT actor_kind || ':' || operator_identity || ':' || correlation_id FROM auth_schema.user_creation_audit WHERE operation='INITIAL_ADMIN_CREATED'")
            if attribution != 'OPERATOR:' + cli_env['SYNKRO_INIT_OPERATOR'] + ':infra-init-first':
                raise ops.Failure('Initial ADMIN operator/correlation attribution is incorrect')
            second = checked(cli + ['--correlation-id', 'infra-init-repeat'], env=cli_env)
            if 'result=already_initialized' not in second or sql("SELECT count(*) || ':' || (SELECT count(*) FROM auth_schema.user_creation_audit) FROM auth_schema.system_user WHERE role='ADMIN'") != snapshot:
                raise ops.Failure('Initial ADMIN second invocation was not the documented no-op')
            print('PASS packaged Auth image CLI: auth_app, protected inputs, operator/correlation, atomic ADMIN/audit and repeat no-op; no key, HTTP initializer or SQL seed')
            test_env = dict(os.environ, TEST_DATABASE_URL=db_url, TEST_DATABASE_USER='auth_app', TEST_DATABASE_PASSWORD=secrets[1],
                            TEST_DATABASE_DISPOSABLE='true', TEST_DISPOSABLE_DATABASE_NAME=database,
                            TEST_ADMIN_DATABASE_USER='postgres', TEST_ADMIN_DATABASE_PASSWORD=secrets[0])
            tests = ['docker', 'run', '--rm', '--network', network, '--label', 'synkro.execution=' + owner,
                     '--label', 'synkro.disposable=true']
            for name in ('TEST_DATABASE_URL', 'TEST_DATABASE_USER', 'TEST_DATABASE_PASSWORD', 'TEST_DATABASE_DISPOSABLE',
                         'TEST_DISPOSABLE_DATABASE_NAME', 'TEST_ADMIN_DATABASE_USER', 'TEST_ADMIN_DATABASE_PASSWORD'):
                tests += ['-e', name]
            # The image's copied source is writable only inside this disposable container.
            output = checked(tests + [build, 'mvn', '-B', 'verify'], env=test_env, timeout=1800)
            if 'BUILD SUCCESS' not in output:
                raise ops.Failure('Auth owner verification did not finish successfully')
            print('PASS Auth existing full Maven verification and real disposable initialization suites, including atomic rollback/concurrency and coverage gates')
        finally:
            if inputs_created:
                item = json.loads(ops.run(['docker', 'volume', 'inspect', input_volume]))[0]
                if item['Labels'].get('synkro.execution') != owner:
                    raise ops.Failure('Auth cleanup refuses an unrelated input volume')
                ops.run(['docker', 'volume', 'rm', input_volume])
            for identifier in ops.run(['docker', 'ps', '-aq', '--filter', 'label=com.docker.compose.project=' + project]).split():
                item = json.loads(ops.run(['docker', 'inspect', identifier]))[0]
                if item['Config']['Labels'].get('synkro.execution') != owner:
                    raise ops.Failure('Auth cleanup refuses an unrelated container')
            for identifier in ops.run(['docker', 'volume', 'ls', '-q', '--filter', 'label=com.docker.compose.project=' + project]).split():
                item = json.loads(ops.run(['docker', 'volume', 'inspect', identifier]))[0]
                if item['Labels'].get('synkro.execution') != owner:
                    raise ops.Failure('Auth cleanup refuses an unrelated volume')
            compose('down', '--volumes', '--timeout', '20')
            item = json.loads(ops.run(['docker', 'network', 'inspect', network]))[0]
            if item['Labels'].get('synkro.execution') != owner or item['Containers']:
                raise ops.Failure('Auth cleanup refuses a shared/nonempty network')
            ops.run(['docker', 'network', 'rm', network])
            print('PASS only owned Auth initialization database, volume and network removed')


if __name__ == '__main__':
    try:
        execute()
    except (ops.Failure, subprocess.TimeoutExpired) as error:
        print('FAIL Auth initialization: ' + (str(error) if isinstance(error, ops.Failure) else 'bounded command timeout'), file=sys.stderr)
        sys.exit(1)
