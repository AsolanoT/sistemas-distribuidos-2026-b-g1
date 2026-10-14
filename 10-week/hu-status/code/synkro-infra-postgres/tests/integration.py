"""Real PostgreSQL acceptance subset; exclusive disposable Compose resources only."""
import json
import os
import sys
import tempfile
import uuid
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import operations as ops
from local_owner import execution_id

ROOT = Path(__file__).resolve().parents[1]


def check(value, message):
    if not value:
        raise ops.Failure(message)


def execute():
    owner = execution_id()
    project = 'synkro-test-' + owner
    network = project + '-network'
    labels = {'synkro.execution': owner, 'synkro.disposable': 'true'}
    with tempfile.TemporaryDirectory(prefix='synkro-pg-test-') as folder:
        folder = Path(folder)
        values = {'COMPOSE_PROJECT_NAME': project, 'PLATFORM_NETWORK': network, 'DB_ADMIN_USER': 'postgres',
                  'FLYWAY_URL': 'jdbc:postgresql://synkro-db:5432/synkro?connectTimeout=5&socketTimeout=60',
                  'FLYWAY_USER': 'postgres'}
        for role in ['DB_ADMIN', 'AUTH_APP', 'CUSTOMERS_APP', 'PRODUCTS_APP', 'WORKFLOW_APP']:
            path = folder / (role.lower() + '.secret')
            # Apostrophe, dollar, semicolon, backslash, whitespace and Unicode.
            path.write_text("sentinel-'$;\\ pass-Ã±-" + role, encoding='utf-8')
            if role == 'AUTH_APP':
                path.write_bytes(path.read_bytes() + b'\r\n')
            os.chmod(path, 0o600)
            if role == 'WORKFLOW_APP' and os.name != 'nt':
                # The published Alpine Workflow image runs as synkro uid 100.
                os.chown(path, 100, 100)
            values[role + '_PASSWORD_PATH'] = path.as_posix()
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        public = folder / 'public.pem'
        public.write_bytes(key.public_key().public_bytes(serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo))
        os.chmod(public, 0o600)
        if os.name != 'nt': os.chown(public, 100, 100)
        values.update(JWT_PUBLIC_KEY_PATH=public.as_posix(), WORKFLOW_SERVICE_TOKEN='disposable-no-participant-calls', WORKFLOW_DATABASE_URL='jdbc:postgresql://synkro-db:5432/synkro?connectTimeout=3&socketTimeout=10')
        values['FLYWAY_PASSWORD'] = Path(values['DB_ADMIN_PASSWORD_PATH']).read_text(encoding='utf-8')
        envfile = folder / 'test.env'
        envfile.write_text('\n'.join(k + '=' + v for k, v in values.items() if k != 'FLYWAY_PASSWORD'))
        override = folder / 'override.json'
        override.write_text(json.dumps({'services': {'synkro-db': {'labels': labels}, 'synkro-workflow': {'labels': labels, 'image': project + ':workflow'}},
                                       'volumes': {'postgres-data': {'labels': labels}}}))
        env = ops.Environment.__new__(ops.Environment)
        env.name, env.project, env.mode, env.root, env.values = 'dev', project, 'postgres-migrations', ROOT, values
        env.env = dict(os.environ, **values)
        env.command = ['docker', 'compose', '--project-directory', str(ROOT), '-p', project,
                       '--env-file', str(envfile), '-f', str(ROOT / 'compose.pg-migrations.yml'), '-f', str(override)]
        ops.run(['docker', 'network', 'create', '--label', 'synkro.execution=' + owner,
                 '--label', 'synkro.disposable=true', network])
        second = None
        try:
            model = json.loads(env.compose('--profile', 'tooling', 'config', '--format', 'json'))
            ops.validate_model(model, project)
            check(Path(model['services']['auth-db-migrate']['volumes'][0]['source']).resolve() == ROOT.parent / 'synkro-auth-db', 'Auth include relative mount is incorrect')
            check(model['services']['synkro-db']['secrets'][1]['source'] == 'postgres_auth_password', 'Secret mapping failed')
            print('PASS include resolution, project naming, tooling profiles and no database exposure')
            env.compose('up', '-d', '--wait', '--wait-timeout', '150', 'synkro-db', timeout=300)
            env.ready()
            check(env.sql("SELECT count(*) FROM pg_roles WHERE rolname LIKE '%_app' AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole") == '4', 'Restricted login users missing')
            check(env.sql("SELECT count(*) FROM pg_namespace WHERE nspname IN ('auth_schema','products_schema','customers_schema','workflow_schema')") == '0', 'Bootstrap created domain schemas')
            check(env.sql("SELECT count(*) FROM pg_extension WHERE extname='pgcrypto'") == '0', 'Unneeded extension installed')
            print('PASS INF-PG-01 PostgreSQL initial bootstrap')
            # Simulate an existing instance that needs a newly introduced login.
            env.sql('DROP ROLE workflow_app')
            try:
                env.compose('exec', '-T', 'synkro-db', 'sh', '/usr/local/bin/synkro-health.sh')
            except ops.Failure:
                pass
            else:
                raise ops.Failure('Instance with a missing required login was reported healthy')
            env.server_ready()
            env.compose('exec', '-T', 'synkro-db', 'bash', '/docker-entrypoint-initdb.d/01-instance.sh')
            env.ready()
            check(env.sql("SELECT count(*) FROM pg_roles WHERE rolname LIKE '%_app'") == '4', 'Manual bootstrap could not add a missing login')
            print('PASS existing incomplete instance accepts manual bootstrap after server-only readiness')
            env.sql("CREATE ROLE preservation_probe; GRANT preservation_probe TO auth_app; ALTER ROLE customers_app SET search_path TO custom_preserved; CREATE TABLE public.persistence_probe (id int); INSERT INTO public.persistence_probe VALUES (42)")
            snapshot = "SELECT rolname,rolpassword,(SELECT array_agg(setconfig) FROM pg_db_role_setting WHERE setrole=pg_authid.oid) FROM pg_authid WHERE rolname LIKE '%_app' ORDER BY rolname"
            before = env.sql(snapshot)
            env.compose('exec', '-T', 'synkro-db', 'bash', '/docker-entrypoint-initdb.d/01-instance.sh')
            check(before == env.sql(snapshot), 'Bootstrap modified existing users')
            check(env.sql("SELECT pg_has_role('auth_app','preservation_probe','MEMBER')") == 't', 'Membership lost')
            print('PASS INF-PG-02 passwords, configuration and memberships preserved')
            try:
                env.compose('exec', '-T', '-e', 'AUTH_APP_PASSWORD_FILE=/missing-secret', 'synkro-db', 'bash', '/docker-entrypoint-initdb.d/01-instance.sh')
            except ops.Failure:
                pass
            else:
                raise ops.Failure('Missing bootstrap secret was accepted')
            try:
                env.compose('exec', '-T', '-e', 'POSTGRES_USER=auth_app', 'synkro-db', 'bash', '/docker-entrypoint-initdb.d/01-instance.sh')
            except ops.Failure:
                pass
            else:
                raise ops.Failure('Bootstrap SQL failure was suppressed')
            check(before == env.sql(snapshot), 'Failed bootstrap changed existing credentials/configuration')
            print('PASS INF-PG-03 missing bootstrap secret and SQL failure propagate without changing users')
            def migrate(domain):
                command = env.command + ['--profile', 'tooling', 'run', '--rm', '--no-deps', domain + '-db-migrate']
                result = ops.subprocess.run(command, capture_output=True, env=env.env, timeout=300)
                if result.returncode:
                    diagnostic = (result.stdout + result.stderr).decode(errors='replace')
                    for key, value in values.items():
                        if key.endswith('_PASSWORD_PATH'):
                            diagnostic = diagnostic.replace(Path(value).read_text(encoding='utf-8'), '[REDACTED]')
                    print(diagnostic[-6000:], file=sys.stderr)
                    raise ops.Failure(f'{domain} supported runner failed; sentinel diagnostics redacted')
            for domain in ops.DOMAINS:
                ops.history_guard(env)
                migrate(domain)
                owner_source = ROOT.parent / ('synkro-workflow' if domain == 'workflow' else 'synkro-' + domain + '-db')
                if domain == 'workflow': owner_source = owner_source / 'db'
                expected = len(list(owner_source.glob('0[1-4]_*/**/V*.sql')))
                query = f"SELECT count(*) FROM {domain}_schema.flyway_schema_history WHERE success AND version IS NOT NULL"
                count = env.sql(query)
                check(count == str(expected) and expected > 0, f'{domain} applied migration count does not match source')
                migrate(domain)
                check(env.sql(query) == count, f'{domain} second migration changed history')
                print(f'PASS INF-PG-05 {domain}: {count} versions; repeat 0 additional versions')
            check(env.sql("SELECT to_regclass('public.flyway_schema_history') IS NULL") == 't', 'Shared public history detected')

            def application(domain, sql, accepted=True):
                command = env.command + ['exec', '-T', 'synkro-db', 'bash', '-c',
                    'password=$(cat /run/secrets/postgres_' + domain + '_password); while [[ "$password" == *$\'\\r\' || "$password" == *$\'\\n\' ]]; do password=${password%?}; done; export PGPASSWORD="$password"; exec psql -X -h 127.0.0.1 -U ' + domain + '_app -d synkro -q -v ON_ERROR_STOP=1 -v VERBOSITY=verbose -At']
                result = ops.subprocess.run(command, input=sql.encode(), capture_output=True, env=env.env, timeout=30)
                if accepted:
                    check(result.returncode == 0, f'{domain} authorized operation failed')
                    return result.stdout.decode().strip()
                check(result.returncode != 0 and b'42501' in result.stderr, f'{domain} operation did not fail with insufficient privilege')

            application('auth', "INSERT INTO auth_schema.system_user(name,email,password_hash,role) VALUES ('Infrastructure Probe','infra-probe@synkro.test','sentinel-not-real','SALESPERSON')")
            application('auth', "INSERT INTO auth_schema.user_creation_audit(audit_id,operation,actor_kind,operator_identity,created_user_id,outcome,occurred_at,correlation_id) SELECT gen_random_uuid(),'INITIAL_ADMIN_CREATED','OPERATOR','disposable-test',user_id,'SUCCESS',now(),'infra-probe' FROM auth_schema.system_user WHERE email='infra-probe@synkro.test'")
            application('auth', 'UPDATE auth_schema.user_creation_audit SET correlation_id=correlation_id', False)
            application('auth', 'DELETE FROM auth_schema.user_creation_audit', False)
            application('auth', 'TRUNCATE auth_schema.user_creation_audit', False)
            application('auth', 'DELETE FROM auth_schema.system_user', False)
            application('auth', 'INSERT INTO products_schema.category(name) VALUES (\'Cross Domain\')', False)
            application('products', "INSERT INTO products_schema.category(category_id,name) VALUES (gen_random_uuid(),'Infra Category')")
            application('products', 'DELETE FROM products_schema.category', False)
            application('products', "UPDATE auth_schema.system_user SET name='Cross Domain'", False)
            print('PASS INF-PG-07 Auth/Products real users; cross-domain writes/business deletions denied; audit append-only')
            tables = {'auth': 'system_user', 'products': 'category', 'customers': 'customer', 'workflow': 'saga_instance'}
            application('customers', "INSERT INTO customers_schema.customer(name,identity_document) VALUES ('Disposable customer','infra-test-customer')")
            application('customers', "UPDATE customers_schema.customer SET active=false WHERE identity_document='infra-test-customer'")
            application('workflow', "INSERT INTO workflow_schema.saga_instance(saga_type,idempotency_key,initiated_by,input) VALUES ('register-sale','infra-test-saga',gen_random_uuid(),'{}')")
            application('workflow', "UPDATE workflow_schema.saga_instance SET status='FAILED' WHERE idempotency_key='infra-test-saga'")
            for domain, table in tables.items():
                application(domain, f'SELECT count(*) FROM {domain}_schema.{table}')
                for other, target in tables.items():
                    if other != domain:
                        application(domain, f'SELECT count(*) FROM {other}_schema.{target}', False)
                        application(domain, f'UPDATE {other}_schema.{target} SET {"name=name" if other != "workflow" else "status=status"}', False)
                application(domain, f'DELETE FROM {domain}_schema.{table}', False)
                application(domain, f'TRUNCATE {domain}_schema.{table}', False)
                application(domain, f'CREATE TABLE {domain}_schema.unapproved_ddl(id int)', False)
            ops.privileges(env)
            print('PASS all four real application users: own operations, cross-domain SELECT/UPDATE, DELETE/TRUNCATE/DDL denial')
            workflow = model['services']['synkro-workflow']
            check(not workflow.get('ports') and 'platform' in workflow['networks'], 'Workflow exposure/network contract failed')
            check(not any(k.startswith('FLYWAY_') for k in workflow['environment']), 'Workflow received administrator tooling credentials')
            check(workflow['environment']['WORKFLOW_APP_PASSWORD_FILE'] == '/run/secrets/workflow_app_password', 'Workflow app secret contract failed')
            env.compose('build', 'synkro-workflow', timeout=900)
            env.compose('up', '-d', '--no-deps', 'synkro-workflow', timeout=120)
            probe = "import json,time,urllib.request; deadline=time.monotonic()+60\nwhile True:\n try:\n  data=json.load(urllib.request.urlopen('http://synkro-workflow:8080/health',timeout=3)); assert data['dependencies']['database']=='ok'; break\n except Exception:\n  if time.monotonic()>deadline: raise\n  time.sleep(1)"
            ops.run(['docker','run','--rm','--label','synkro.execution='+owner,'--label','synkro.disposable=true','--network',network,'python:3.13.7-alpine3.22','python','-c',probe],timeout=90)
            print('PASS owning Workflow image health against real restricted shared PostgreSQL; no participants required or saga acceptance claimed')
            env.compose('stop','synkro-workflow',timeout=45)
            wrong = env.command + ['exec', '-T', '-e', 'PGPASSWORD=wrong-sentinel', 'synkro-db', 'psql', '-X', '-h', '127.0.0.1', '-U', 'auth_app', '-d', 'synkro', '-c', 'SELECT 1']
            try:
                ops.run(wrong, env=env.env, timeout=15)
            except ops.Failure:
                pass
            else:
                raise ops.Failure('Incorrect password was accepted')
            print('PASS INF-PG-08 PostgreSQL rejects wrong credentials within timeout')
            env.sql('CREATE TABLE public.flyway_schema_history (id int)')
            try:
                ops.history_guard(env)
            except ops.Failure:
                pass
            else:
                raise ops.Failure('Legacy public history was accepted')
            env.sql('DROP TABLE public.flyway_schema_history')
            # Alter only this disposable ledger, never source files or real histories.
            checksum = env.sql("SELECT checksum FROM auth_schema.flyway_schema_history WHERE version='001'")
            if not checksum:
                checksum = env.sql("SELECT checksum FROM auth_schema.flyway_schema_history WHERE version='1'")
            env.sql("UPDATE auth_schema.flyway_schema_history SET checksum=0 WHERE version::int=1")
            try:
                env.compose('--profile', 'tooling', 'run', '--rm', '--no-deps', 'auth-db-migrate', timeout=120)
            except ops.Failure:
                pass
            else:
                raise ops.Failure('Checksum drift was accepted')
            check(env.sql("SELECT checksum FROM auth_schema.flyway_schema_history WHERE version::int=1") == '0', 'Runner repaired drift automatically')
            # Reconstruction of the test-only mutation is deliberate and recorded.
            env.sql(f'UPDATE auth_schema.flyway_schema_history SET checksum={int(checksum)} WHERE version::int=1')
            print('PASS INF-PG-06 legacy history and checksum drift fail without repair')
            env.compose('down', '--timeout', '20')
            started = ops.time.monotonic()
            try:
                env.ready(seconds=3)
            except ops.Failure:
                pass
            else:
                raise ops.Failure('Unavailable PostgreSQL was reported ready')
            check(ops.time.monotonic() - started < 12, 'Unavailable PostgreSQL readiness was unbounded')
            print('PASS INF-PG-08 stopped PostgreSQL fails within bounded readiness wait')
            # Same DNS network, sequential projects and distinct scoped volumes.
            second = ops.Environment.__new__(ops.Environment)
            second.__dict__.update(env.__dict__)
            second.project = project + '-second'
            second.command = list(env.command)
            second.command[second.command.index('-p') + 1] = second.project
            second.compose('up', '-d', '--wait', '--wait-timeout', '150', 'synkro-db', timeout=240)
            check(second.sql("SELECT to_regclass('public.persistence_probe') IS NULL") == 't', 'Sequential environment leaked data')
            check(second.sql("SELECT count(*) FROM pg_roles WHERE rolname LIKE '%_app'") == '4', 'Second environment bootstrap failed')
            second.compose('down', '--timeout', '20')
            env.compose('up', '-d', '--wait', '--wait-timeout', '150', 'synkro-db', timeout=240)
            check(env.sql('SELECT id FROM public.persistence_probe') == '42', 'Restart lost data')
            check(application('auth', 'SELECT count(*) FROM auth_schema.user_creation_audit') == '1', 'Restart lost application data/permissions')
            print('PASS INF-PG-04 PostgreSQL persistence and sequential environment volume/data isolation')
            bundle = ops.backup(env, folder / 'backups')
            # Source metadata uses explicit dev for invoking a restore test.
            metadata = json.loads((bundle / 'complete.json').read_text())
            metadata['project'] = 'synkro-dev'
            (bundle / 'complete.json').write_text(json.dumps(metadata))
            from restore import restore
            def verify_restore(target, administrator):
                query = "SELECT id FROM public.persistence_probe; SELECT count(*) FROM auth_schema.user_creation_audit; SELECT has_table_privilege('auth_app','auth_schema.user_creation_audit','UPDATE,DELETE,TRUNCATE'); SELECT pg_has_role('auth_app','preservation_probe','MEMBER');"
                result = ops.run(['docker', 'exec', target, 'psql', '-X', '-U', administrator, '-d', 'synkro', '-Atqc', query])
                check(result.strip().splitlines() == ['42', '1', 'f', 't'], 'Restored data, memberships or audit permissions differ')
            restore('dev', bundle, verify_restore)
            print('PASS INF-PG-11 PostgreSQL roles/data backed up and restored in separate disposable target')
        except Exception as error:
            if hasattr(error, 'diagnostics'):
                diagnostic = error.diagnostics
                diagnostic = diagnostic.decode(errors='replace') if isinstance(diagnostic, bytes) else diagnostic
                for key, value in values.items():
                    if key.endswith('_PASSWORD_PATH'):
                        diagnostic = diagnostic.replace(Path(value).read_text(encoding='utf-8').rstrip('\r\n'), '[REDACTED]')
                print(diagnostic[-2500:], file=sys.stderr)
            try:
                diagnostic = env.compose('logs', '--no-color', '--tail', '30', 'synkro-db')
                for key, value in values.items():
                    if key.endswith('_PASSWORD_PATH'):
                        diagnostic = diagnostic.replace(Path(value).read_text(encoding='utf-8'), '[REDACTED]')
                print(diagnostic, file=sys.stderr)
            except ops.Failure:
                print('Database diagnostics unavailable', file=sys.stderr)
            raise
        finally:
            projects = [project] + ([second.project] if second else [])
            containers = [item for name in projects for item in ops.run(['docker', 'ps', '-aq', '--filter', 'label=com.docker.compose.project=' + name]).split()]
            volumes = [item for name in projects for item in ops.run(['docker', 'volume', 'ls', '-q', '--filter', 'label=com.docker.compose.project=' + name]).split()]
            for target in containers:
                item = json.loads(ops.run(['docker', 'inspect', target]))[0]
                check(item['Config']['Labels'].get('synkro.execution') == owner, 'Cleanup refuses an unowned container')
                for mount in item['Mounts']:
                    if mount['Type'] == 'volume':
                        check(mount['Name'] in volumes, 'Cleanup refuses an external volume')
            for volume in volumes:
                item = json.loads(ops.run(['docker', 'volume', 'inspect', volume]))[0]
                check(item['Labels'].get('synkro.execution') == owner and item['Labels'].get('synkro.disposable') == 'true', 'Cleanup refuses an unowned volume')
            env.compose('down', '--volumes', '--timeout', '20', timeout=180)
            if second:
                second.compose('down', '--volumes', '--timeout', '20', timeout=180)
            item = json.loads(ops.run(['docker', 'network', 'inspect', network]))[0]
            check(item['Labels'].get('synkro.execution') == owner and not item['Containers'], 'Cleanup refuses a shared or attached network')
            ops.run(['docker', 'network', 'rm', network])
            print('PASS owned disposable resources removed; shared platform untouched')


if __name__ == '__main__':
    try:
        execute()
    except ops.Failure as error:
        print('FAIL ' + str(error), file=sys.stderr)
        sys.exit(1)
