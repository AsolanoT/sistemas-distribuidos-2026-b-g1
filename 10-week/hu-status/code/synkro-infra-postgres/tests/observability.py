"""Actual collector/Prometheus/Grafana startup and datasource connection."""
import base64
import json
import os
import sys
import tempfile
import urllib.request
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import operations as ops
from local_owner import execution_id

ROOT = Path(__file__).resolve().parents[1]


def execute():
    owner = execution_id()
    project = 'synkro-obstest-' + owner
    network = project + '-network'
    labels = {'synkro.execution': owner, 'synkro.disposable': 'true'}
    with tempfile.TemporaryDirectory(prefix='synkro-obs-') as folder:
        folder = Path(folder)
        password = folder / 'password'
        password.write_text('observability-sentinel')
        os.chmod(password, 0o600)
        env = dict(os.environ, PLATFORM_NETWORK=network, GRAFANA_ADMIN_USER='test-operator', GRAFANA_ADMIN_PASSWORD_PATH=password.as_posix())
        override = folder / 'override.yml'
        override.write_text('services:\n  prometheus:\n    ports: !override ["127.0.0.1::9090"]\n  grafana:\n    ports: !override ["127.0.0.1::3000"]\n')
        ownership = folder / 'ownership.json'
        ownership.write_text(json.dumps({'services': {service: {'labels': labels} for service in ['otel-collector', 'prometheus', 'grafana']},
                                        'volumes': {name: {'labels': labels} for name in ['prometheus-data', 'grafana-data']}}))
        command = ['docker', 'compose', '-p', project, '-f', str(ROOT / 'compose.observability.yml'), '-f', str(override), '-f', str(ownership)]
        def compose(*args, **kwargs):
            return ops.run(command + list(args), env=env, **kwargs)
        ops.run(['docker', 'network', 'create', '--label', 'synkro.execution=' + owner, '--label', 'synkro.disposable=true', network])
        try:
            model = json.loads(compose('config', '--format', 'json'))
            ops.validate_model(model, project)
            compose('run', '--rm', '--no-deps', 'otel-collector', 'validate', '--config=/etc/otelcol/config.yaml', timeout=300)
            compose('run', '--rm', '--no-deps', '--entrypoint', 'promtool', 'prometheus', 'check', 'config', '/etc/prometheus/prometheus.yml', timeout=300)
            compose('up', '-d', '--wait', '--wait-timeout', '180', timeout=500)
            port = compose('port', 'grafana', '3000').strip()
            req = urllib.request.Request('http://' + port + '/api/datasources/uid/synkro-prometheus/health')
            req.add_header('Authorization', 'Basic ' + base64.b64encode(b'test-operator:observability-sentinel').decode())
            with urllib.request.urlopen(req, timeout=15) as response:
                result = json.load(response)
            if result.get('status') != 'OK':
                raise ops.Failure('Grafana datasource connection failed')
            output = compose('exec', '-T', 'prometheus', 'wget', '-qO-', 'http://otel-collector:13133/')
            if 'Server available' not in output:
                raise ops.Failure('Collector health endpoint unavailable')
            print('PASS real collector validation, promtool, healthy containers and Grafana-to-Prometheus datasource connectivity')
            print('Service instrumentation and end-to-end traces remain external deliverables')
        finally:
            for identifier in ops.run(['docker', 'ps', '-aq', '--filter', 'label=com.docker.compose.project=' + project]).split():
                item = json.loads(ops.run(['docker', 'inspect', identifier]))[0]
                if item['Config']['Labels'].get('synkro.execution') != owner:
                    raise ops.Failure('Cleanup refused unowned container')
            for identifier in ops.run(['docker', 'volume', 'ls', '-q', '--filter', 'label=com.docker.compose.project=' + project]).split():
                item = json.loads(ops.run(['docker', 'volume', 'inspect', identifier]))[0]
                if item['Labels'].get('synkro.execution') != owner:
                    raise ops.Failure('Cleanup refused unowned volume')
            compose('down', '--volumes', '--timeout', '20')
            item = json.loads(ops.run(['docker', 'network', 'inspect', network]))[0]
            if item['Labels'].get('synkro.execution') != owner or item['Containers']:
                raise ops.Failure('Cleanup refused shared network')
            ops.run(['docker', 'network', 'rm', network])
            print('PASS observability disposable resources removed')


if __name__ == '__main__':
    try:
        execute()
    except ops.Failure as error:
        print('FAIL ' + str(error), file=sys.stderr)
        sys.exit(1)
