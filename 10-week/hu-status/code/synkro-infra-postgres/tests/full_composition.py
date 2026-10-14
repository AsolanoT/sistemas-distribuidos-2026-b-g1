"""Real complete-root acceptance; owned snapshots and disposable resources only."""
import base64
import json
import os
from pathlib import Path
import re
import secrets
import sys
import tempfile
import time
import urllib.request
import uuid
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import operations as ops
import verify_local as local
from local_owner import execution_id


def owner_guard(root):
    marker = os.environ.get('SYNKRO_LOCAL_OWNER_FILE')
    if not marker:
        raise ops.Failure('Complete acceptance requires an owned isolated execution')
    run = Path(marker).parent
    if (not re.fullmatch(r'run-[0-9a-f]{32}', run.name) or
            (run / '.local-owner').read_text() != run.name):
        raise ops.Failure('Complete acceptance owner marker invalid')
    ordinary = root.parent.resolve() == (run / 'layout').resolve()
    isolated = root.parent / '.isolated-copy-owner'
    if not ordinary and (not isolated.is_file() or isolated.read_text() != run.name):
        raise ops.Failure('Complete acceptance refuses original/unrelated checkouts')
    return run


def execute():
    run = owner_guard(ROOT)
    lock = json.loads((ROOT / 'dependencies.lock.json').read_text())
    for entry in local.validate_lock(lock):
        local.verify_snapshot(ROOT.parent / entry['name'], entry['revision'])
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.primitives import serialization
    owner = execution_id()
    project = 'synkro-infra-test-' + owner + '-source'
    labels = {'synkro.execution': owner, 'synkro.disposable': 'true'}
    result = {'suite': 'full-root', 'root_sha': local.git(ROOT, 'rev-parse', 'HEAD'),
              'project': project, 'steps': [], 'status': 'FAILED', 'cleanup': 'NOT RUN'}
    env = None
    model = None
    network_created = False
    phase = 'protected-fixture-preparation'
    envfile = ROOT / 'env/dev.env'
    if envfile.exists():
        raise ops.Failure('Refusing overwrite of an existing runtime environment')
    folder = Path(tempfile.mkdtemp(prefix='full-root-'))
    (folder / '.fixture-owner').write_text(owner)
    try:
        values = {'COMPOSE_PROJECT_NAME': project, 'PLATFORM_NETWORK': project,
                  'DB_ADMIN_USER': 'postgres', 'MONGO_ADMIN_USER': 'fixture-admin',
                  'MONGO_ADMIN_PASSWORD': secrets.token_hex(24), 'SALES_APP_PASSWORD': secrets.token_hex(24),
                  'MONGO_INTERNAL_KEY': base64.b64encode(os.urandom(64)).decode(), 'MONGO_NETWORK': project,
                  'MONGO_REPLICA_SET': 'rs0', 'MONGO_STARTUP_TIMEOUT_SECONDS': '60',
                  'MONGO_CONNECT_TIMEOUT_MS': '2000', 'MONGO_DISPOSABLE': 'true', 'MONGO_TEST_RUN': owner,
                  'MONGODB_NETWORK': project, 'MONGODB_DATABASE': 'sales',
                  'WORKFLOW_SERVICE_TOKEN': 'model-only-not-started-before-auth',
                  'WORKER_SERVICE_TOKEN': 'model-only-not-started-before-auth',
                  'WORKFLOW_DATABASE_URL': 'jdbc:postgresql://synkro-db:5432/synkro?connectTimeout=3&socketTimeout=10',
                  'AUTH_DATABASE_URL': 'jdbc:postgresql://synkro-db:5432/synkro?currentSchema=auth_schema&connectTimeout=5&socketTimeout=60',
                  'CUSTOMERS_DATABASE_URL': 'jdbc:postgresql://synkro-db:5432/synkro?currentSchema=customers_schema&connectTimeout=5&socketTimeout=60',
                  'SPRING_DATASOURCE_URL': 'jdbc:postgresql://synkro-db:5432/synkro?currentSchema=auth_schema',
                  'CORS_ALLOWED_ORIGINS': 'http://localhost:5173', 'RATE_LIMIT_PER_SECOND': '20', 'VITE_DEV_SIGN_IN': 'false',
                  'VITE_API_BASE_URL': '', 'VITE_CUSTOMERS_PORTAL_ENTRY': '/remotes/customers/remoteEntry.js',
                  'GRAFANA_ADMIN_USER': 'fixture-operator'}
        passwords = {}
        for role in ['DB_ADMIN', 'AUTH_APP', 'CUSTOMERS_APP', 'PRODUCTS_APP', 'WORKFLOW_APP', 'GRAFANA_ADMIN', 'INITIAL_ADMIN']:
            path = folder / (role + '.secret')
            passwords[role] = secrets.token_hex(24)
            path.write_text(passwords[role]); os.chmod(path, 0o600)
            # Auth/Customers images run as uid 100; PG sources must support
            # the real production secret contract, not world-readable files.
            if os.name != 'nt': os.chown(path, 100, 100)
            values[role + '_PASSWORD_PATH'] = str(path)
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        for name, contents in [('private', key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption())),
                               ('public', key.public_key().public_bytes(serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo))]:
            path = folder / (name + '.pem'); path.write_bytes(contents); os.chmod(path, 0o600)
            if os.name != 'nt': os.chown(path, 100, 100)
            values['JWT_' + name.upper() + '_KEY_PATH'] = str(path)
        values['JWT_PUBLIC_KEY'] = (folder / 'public.pem').read_text().replace('\n', '\\n')
        values['DATABASE_URL'] = 'postgres://products_app:' + passwords['PRODUCTS_APP'] + '@synkro-db:5432/synkro?search_path=products_schema&connect_timeout=5'
        values['SALES_APP_MONGODB_URI'] = 'mongodb://sales_app:' + values['SALES_APP_PASSWORD'] + '@synkro-mongo:27017/sales?authSource=admin&replicaSet=rs0&connectTimeoutMS=5000&serverSelectionTimeoutMS=10000'
        envfile.write_text('\n'.join(k + '=' + v for k, v in values.items())); os.chmod(envfile, 0o600)
        env = ops.Environment.__new__(ops.Environment)
        env.name, env.mode, env.root, env.project, env.values = 'dev', 'full', ROOT, project, values
        env.env = dict(os.environ, **values, COMPOSE_DISABLE_ENV_FILE='1', COMPOSE_PROFILES='')
        env.command = ['docker', 'compose', '-p', project, '--env-file', str(envfile), '-f', str(ROOT / 'compose.yml')]
        phase = 'root-model-preparation'
        model = env.prepare()
        result['steps'].append({'name': 'all-required-root-model-exposure-secrets', 'status': 'PASSED', 'services': len(model['services'])})
        override = folder / 'ownership.json'
        override.write_text(json.dumps({'services': {name: {'labels': labels} for name in model['services']},
                                       'volumes': {name: {'labels': labels} for name in model.get('volumes', {})}}))
        env.command += ['-f', str(override)]
        ops.run(['docker', 'network', 'create', '--label', 'synkro.execution=' + owner, '--label', 'synkro.disposable=true', project])
        network_created = True
        phase = 'empty-engine-startup'
        env.compose('up', '-d', '--wait', '--wait-timeout', '150', 'synkro-db', 'synkro-mongo', timeout=300)
        env.ready(); env.ready('synkro-mongo')
        result['steps'].append({'name': 'root-empty-engines-bootstrap-primary', 'status': 'PASSED'})
        histories = {}
        for domain in ops.DOMAINS:
            phase = domain + '-initial-repeat-migration'
            env.compose('--profile', 'tooling', 'run', '--rm', '--no-deps', domain + '-db-migrate', timeout=300)
            count = env.sql(f"SELECT count(*) FROM {domain}_schema.flyway_schema_history WHERE success AND version IS NOT NULL")
            env.compose('--profile', 'tooling', 'run', '--rm', '--no-deps', domain + '-db-migrate', timeout=300)
            if count != env.sql(f"SELECT count(*) FROM {domain}_schema.flyway_schema_history WHERE success AND version IS NOT NULL"):
                raise ops.Failure('Repeated migration changed history')
            histories[domain] = int(count)
        phase = 'sales-initial-repeat-migration'
        env.compose('--profile', 'tooling', 'run', '--rm', '--no-deps', 'sales-db-migrate', timeout=300)
        env.compose('--profile', 'tooling', 'run', '--rm', '--no-deps', 'sales-db-migrate', timeout=300)
        ops.privileges(env)
        result['steps'].append({'name': 'owning-runners-initial-repeat-histories-permissions', 'status': 'PASSED', 'histories': histories})
        phase = 'complete-root-build'
        env.compose('build', timeout=900)
        phase = 'auth-gateway-startup'
        env.compose('up', '-d', 'synkro-auth-api', 'synkro-api-gateway', timeout=180)
        def health(service):
            return env.compose('exec', '-T', 'synkro-api-gateway', 'wget', '-qO-', 'http://' + service + ':8080/health', timeout=8)
        def wait_health(service):
            deadline = time.monotonic() + 150
            while time.monotonic() < deadline:
                try:
                    if health(service): return
                except ops.Failure: pass
                time.sleep(1)
            raise ops.Failure('Root application health deadline exceeded: ' + service)
        wait_health('synkro-auth-api')
        phase = 'real-admin-initialization-and-service-identities'
        image = json.loads(env.compose('config', '--format', 'json'))['services']['synkro-auth-api'].get('image', project + '-synkro-auth-api')
        cli_env = dict(env.env, SPRING_DATASOURCE_URL=values['AUTH_DATABASE_URL'], SPRING_DATASOURCE_USERNAME='auth_app',
                       SPRING_DATASOURCE_PASSWORD_FILE='/run/auth.password', SYNKRO_INIT_OPERATOR='disposable-root/' + owner)
        ops.run(['docker', 'run', '--rm', '--network', project, '--label', 'synkro.execution=' + owner,
                 '-e', 'SPRING_DATASOURCE_URL', '-e', 'SPRING_DATASOURCE_USERNAME', '-e', 'SPRING_DATASOURCE_PASSWORD_FILE', '-e', 'SYNKRO_INIT_OPERATOR',
                 '--mount', f'type=bind,source={values["AUTH_APP_PASSWORD_PATH"]},target=/run/auth.password,readonly',
                 '--mount', f'type=bind,source={values["INITIAL_ADMIN_PASSWORD_PATH"]},target=/run/initial.password,readonly',
                 '--entrypoint', 'java', image, '-cp', '/app/auth-app.jar', '-Dloader.main=co.edu.corhuila.synkro.auth.app.InitialAdminCli',
                 'org.springframework.boot.loader.launch.PropertiesLauncher', '--name', 'Disposable Root Admin', '--email', 'root-admin@example.test',
                 '--password-file', '/run/initial.password'], env=cli_env, timeout=180)
        def request(path, body, token=None):
            headers = {'Content-Type': 'application/json'}
            if token: headers['Authorization'] = 'Bearer ' + token
            headers['Idempotency-Key'] = uuid.uuid4().hex
            req = urllib.request.Request('http://127.0.0.1:8000' + path, data=json.dumps(body).encode(), headers=headers)
            with urllib.request.urlopen(req, timeout=15) as response: return json.loads(response.read())
        human = request('/api/v1/auth/login', {'email': 'root-admin@example.test', 'password': passwords['INITIAL_ADMIN']})['accessToken']
        for service, variable in [('synkro-workflow', 'WORKFLOW_SERVICE_TOKEN'), ('synkro-worker', 'WORKER_SERVICE_TOKEN')]:
            env.env[variable] = request('/api/v1/auth/service-tokens', {'service': service}, human)['token']
        phase = 'complete-mesh-startup-and-health'
        env.compose('up', '-d', '--wait', '--wait-timeout', '180', timeout=900)
        services = []
        for line in env.compose('ps', '--format', 'json').splitlines():
            row = json.loads(line)
            services.extend(row if isinstance(row, list) else [row])
        if not all(x['State'] == 'running' for x in services): raise ops.Failure('Root mandatory service not running')
        if any(x['Service'].endswith('migrate') for x in services): raise ops.Failure('Runner started implicitly')
        for service in ['synkro-customers-api', 'synkro-products-api', 'synkro-sales-api', 'synkro-workflow']: wait_health(service)
        with urllib.request.urlopen('http://127.0.0.1:5173/customers/new', timeout=15) as response:
            if response.status != 200: raise ops.Failure('Root portal deep link unavailable')
        phase = 'complete-engine-restart-and-persistence'
        env.sql('CREATE TABLE public.full_persistence_probe (id int); INSERT INTO public.full_persistence_probe VALUES (42)')
        env.compose('restart', 'synkro-db', 'synkro-mongo', timeout=180); env.ready(); env.ready('synkro-mongo')
        if env.sql('SELECT id FROM public.full_persistence_probe') != '42': raise ops.Failure('Root restart lost data')
        for service in ['synkro-auth-api', 'synkro-customers-api', 'synkro-products-api', 'synkro-sales-api', 'synkro-workflow']: wait_health(service)
        result['steps'].append({'name': 'complete-up-real-identity-all-services-explicit-runners-restart', 'status': 'PASSED'})
        result['status'] = 'PASSED'
    except ops.Failure as error:
        result['failure'] = str(error)
        result['failed_phase'] = phase
        diagnostics = getattr(error, 'diagnostics', b'')
        if isinstance(diagnostics, bytes): diagnostics = diagnostics.decode(errors='replace')
        # Publish categories only, never expanded Compose output or raw errors.
        result['failure_categories'] = [label for label, needle in [
            ('mount-source-missing', 'bind source path does not exist'),
            ('image-retrieval', 'failed to resolve reference'),
            ('permission-denied', 'Permission denied'),
            ('unhealthy-container', 'unhealthy'),
            ('port-already-allocated', 'port is already allocated'),
        ] if needle in diagnostics]
        if env is not None:
            try:
                engine_states = []
                for service in ('synkro-db', 'synkro-mongo'):
                    ids = env.compose('ps', '-aq', service).split()
                    for identifier in ids:
                        state = json.loads(ops.run(['docker', 'inspect', identifier]))[0]['State']
                        logs = env.compose('logs', '--tail', '60', service)
                        categories = [label for label, needle in [
                            ('permission-denied', 'Permission denied'),
                            ('authentication-failed', 'authentication failed'),
                            ('bootstrap-secret-unreadable', 'bootstrap: missing readable'),
                            ('bootstrap-file-missing', 'No such file or directory'),
                            ('not-primary', 'not primary'),
                        ] if needle.lower() in logs.lower()]
                        engine_states.append({'service': service, 'status': state['Status'],
                                              'exit_code': state['ExitCode'],
                                              'health': state.get('Health', {}).get('Status'),
                                              'log_categories': categories})
                result['engine_states'] = engine_states
                logs = env.compose('logs', '--tail', '40', 'synkro-db', 'synkro-mongo', 'synkro-auth-api')
                result['safe_diagnostic'] = {'permission_denied': 'Permission denied' in logs or 'permission denied' in logs,
                                            'unreadable_secret': '/run/secrets/' in logs and 'Permission denied' in logs}
            except ops.Failure: pass
        raise
    finally:
        if network_created:
            # No persistent resource is eligible: inspect every object before down -v.
            for kind, command in [('container', ['ps', '-aq']), ('volume', ['volume', 'ls', '-q'])]:
                ids = ops.run(['docker'] + command + ['--filter', 'label=com.docker.compose.project=' + project]).split()
                for identifier in ids:
                    item = json.loads(ops.run(['docker', kind, 'inspect', identifier]))[0]
                    fields = item['Config']['Labels'] if kind == 'container' else item['Labels']
                    if fields.get('synkro.execution') != owner: raise ops.Failure('Full cleanup refuses unrelated resource')
            env.compose('down', '--volumes', '--timeout', '30', timeout=180)
            item = json.loads(ops.run(['docker', 'network', 'inspect', project]))[0]
            if item['Labels'].get('synkro.execution') != owner or item['Containers']: raise ops.Failure('Full cleanup refuses shared network')
            ops.run(['docker', 'network', 'rm', project])
        envfile.unlink(missing_ok=True)
        if (folder / '.fixture-owner').read_text() != owner or folder.parent != Path(tempfile.gettempdir()):
            raise ops.Failure('Full fixture cleanup refuses unrelated storage')
        local.remove_tree(folder)
        result['cleanup'] = 'PASSED'
        (run / 'full-root-result.json').write_text(json.dumps(result, indent=2))
        print('PASS full-root owned cleanup' if result['cleanup'] == 'PASSED' else 'FAIL full-root cleanup')


if __name__ == '__main__':
    try: execute()
    except ops.Failure as error:
        print('FAIL full root: ' + str(error), file=sys.stderr)
        raise SystemExit(1)

