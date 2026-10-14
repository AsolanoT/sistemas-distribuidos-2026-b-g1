"""Explicit-environment operations. Python 3.11+, Docker Compose 2.20.3+."""
import argparse
import contextlib
import json
import os
import re
import subprocess
import sys
import time
import uuid
from pathlib import Path
from urllib.parse import quote, urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
DOMAINS = ('auth', 'products', 'customers', 'workflow')
MODES = {'full': 'compose.yml', 'postgres': 'compose.postgres.yml',
         'postgres-migrations': 'compose.pg-migrations.yml', 'mongo-migrations': 'compose.mongo-migrations.yml',
         'observability': 'compose.observability.yml'}


class Failure(Exception):
    pass


def run(command, *, env=None, data=None, timeout=180, output=None):
    try:
        result = subprocess.run(command, input=data, stdout=output or subprocess.PIPE,
                                stderr=subprocess.PIPE, env=env, timeout=timeout, check=False)
    except (OSError, subprocess.TimeoutExpired):
        raise Failure('Subprocess unavailable or timed out; diagnostics suppressed') from None
    if result.returncode:
        error = Failure(f'Subprocess failed with exit code {result.returncode}; diagnostics suppressed')
        error.diagnostics = result.stderr
        raise error
    value = result.stdout
    return value.decode() if isinstance(value, bytes) else value


def read_env(path):
    if not path.is_file():
        raise Failure(f'Missing environment file: {path.name}')
    values = {}
    for line in path.read_text(encoding='utf-8-sig').splitlines():
        if not line.strip() or line.lstrip().startswith('#'):
            continue
        match = re.fullmatch(r'([A-Z][A-Z0-9_]*)=(.*)', line)
        if not match or match[1] in values:
            raise Failure('Invalid or duplicate environment assignment; contents suppressed')
        value = match[2].strip()
        if value[:1] in ('"', "'"):
            if len(value) < 2 or value[-1] != value[0]:
                raise Failure('Unclosed environment value')
            value = value[1:-1]
        values[match[1]] = value
    return values


def protected_file(path, label):
    if not path.is_absolute() or not path.is_file() or path.stat().st_size == 0:
        raise Failure(f'Missing nonempty absolute protected file: {label}')
    if os.name != 'nt' and path.stat().st_mode & 0o077:
        raise Failure(f'Protected file permits group/other access: {label}')
    if os.name == 'nt':
        script = """$ErrorActionPreference='Stop'
$allowed=@([Security.Principal.WindowsIdentity]::GetCurrent().User.Value,'S-1-5-18','S-1-5-32-544')
foreach($rule in (Get-Acl -LiteralPath $env:SYNKRO_PROTECTED_FILE).Access) {
 if($rule.AccessControlType -eq 'Allow' -and $rule.IdentityReference.Translate([Security.Principal.SecurityIdentifier]).Value -notin $allowed) {exit 1}
}
"""
        try:
            run(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', script],
                env=dict({k: v for k, v in os.environ.items() if k.lower() != 'psmodulepath'}, SYNKRO_PROTECTED_FILE=str(path)), timeout=15)
        except Failure:
            raise Failure(f'Cannot verify owner-only protected file ACL: {label}') from None


def protect_created(path):
    """Restrict only a newly created secret artifact, never a sibling source."""
    if os.name != 'nt':
        os.chmod(path, 0o600)
        return
    script = """$ErrorActionPreference='Stop'
$user=[Security.Principal.WindowsIdentity]::GetCurrent().User
$acl=New-Object Security.AccessControl.FileSecurity
$acl.SetOwner($user)
$acl.SetAccessRuleProtection($true,$false)
$rule=New-Object Security.AccessControl.FileSystemAccessRule($user,'FullControl','Allow')
$acl.AddAccessRule($rule)
Set-Acl -LiteralPath $env:SYNKRO_PROTECTED_FILE -AclObject $acl
"""
    run(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', script],
        env=dict({k: v for k, v in os.environ.items() if k.lower() != 'psmodulepath'}, SYNKRO_PROTECTED_FILE=str(path)), timeout=15)
    protected_file(path, 'GENERATED_SECRET')


def validate_model(model, project, values=None):
    values = values or {}
    if model.get('name', project) != project:
        raise Failure('Included composition redirected the project')
    allowed_ports = {'host', 'synkro-api-gateway', 'grafana', 'prometheus', 'otel-collector'}
    for name, service in model.get('services', {}).items():
        if service.get('container_name'):
            raise Failure(f'Global container name: {name}')
        if service.get('ports') and name not in allowed_ports:
            raise Failure(f'Unauthorized published ports: {name}')
        if name.endswith('migrate') and 'tooling' not in service.get('profiles', []):
            raise Failure(f'Migration runner starts ordinarily: {name}')
        application = name not in {'synkro-db', 'synkro-mongo', 'grafana', 'prometheus', 'otel-collector'} and not name.endswith('migrate')
        if application:
            variables = service.get('environment', {})
            if any('ADMIN' in key or key.startswith('FLYWAY_') for key in variables):
                raise Failure(f'Administrator credentials exposed to {name}')
            for value in variables.values():
                if isinstance(value, str) and '://' in value:
                    username = unquote(urlsplit(value).username or '')
                    if username and username in {values.get('DB_ADMIN_USER'), values.get('MONGO_ADMIN_USER')}:
                        raise Failure(f'Administrator connection exposed to {name}')
            secrets = [v.get('source', '') if isinstance(v, dict) else v for v in service.get('secrets', [])]
            if any('admin' in value for value in secrets):
                raise Failure(f'Administrator secret mounted in {name}')
            if name != 'synkro-auth-api' and 'jwt_private_key' in secrets:
                raise Failure(f'Private signing key exposed to {name}')


@contextlib.contextmanager
def lock(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError:
        raise Failure('Rejecting overlapping orchestration; inspect stale lock manually') from None
    try:
        os.write(fd, str(os.getpid()).encode())
        os.close(fd)
        yield
    finally:
        path.unlink()


def backup_directory(path, workspace):
    path = path.resolve()
    if path == workspace.resolve() or workspace.resolve() in path.parents:
        raise Failure('Backups must be outside the repository workspace')
    path.mkdir(parents=True, exist_ok=True, mode=0o700)
    if os.name != 'nt' and path.stat().st_mode & 0o077:
        raise Failure('Backup directory must permit owner access only')
    return path


class Environment:
    def __init__(self, name, mode, root=ROOT):
        if name not in ('dev', 'qa', 'main') or mode not in MODES:
            raise Failure('Select dev, qa or main explicitly and a supported mode')
        self.name, self.mode, self.root = name, mode, root.resolve()
        self.values = read_env(self.root / f'env/{name}.env')
        if any(key.startswith('COMPOSE_') and key != 'COMPOSE_PROJECT_NAME' for key in self.values):
            raise Failure('Reserved Compose controls are managed by operations; tooling is deliberate only')
        self.project = f'synkro-{name}'
        if self.values.get('COMPOSE_PROJECT_NAME') != self.project:
            raise Failure('COMPOSE_PROJECT_NAME must match the explicitly selected environment')
        if name != 'dev' and self.values.get('VITE_DEV_SIGN_IN', 'false') != 'false':
            raise Failure('Development sign-in is forbidden in qa and main')
        self.env = {k: v for k, v in os.environ.items() if not k.startswith(('COMPOSE_', 'FLYWAY_'))}
        self.env.update(self.values)
        self.env['COMPOSE_PROJECT_NAME'] = self.project
        self.env['COMPOSE_DISABLE_ENV_FILE'] = '1'
        self.env['COMPOSE_PROFILES'] = ''
        self.command = ['docker', 'compose', '--project-directory', str(self.root), '-p', self.project,
                        '--env-file', str(self.root / f'env/{name}.env'), '-f', str(self.root / MODES[mode])]

    def prepare(self):
        if self.mode == 'full':
            from importlib.util import spec_from_file_location, module_from_spec
            spec = spec_from_file_location('dependencies', self.root / 'tests/dependencies.py')
            dependency = module_from_spec(spec)
            spec.loader.exec_module(dependency)
            if dependency.verify():
                raise Failure('Full composition prerequisites missing; see docs/dependencies.md')
        if self.mode in ('full', 'observability'):
            protected_file(Path(self.values.get('GRAFANA_ADMIN_PASSWORD_PATH', '')), 'GRAFANA_ADMIN_PASSWORD_PATH')
        if self.mode in ('postgres', 'postgres-migrations', 'full'):
            if not self.values.get('DB_ADMIN_USER') or self.values['DB_ADMIN_USER'] in {domain + '_app' for domain in DOMAINS}:
                raise Failure('PostgreSQL administrator must differ from all application users')
            contents = []
            for variable in ('DB_ADMIN', 'AUTH_APP', 'CUSTOMERS_APP', 'PRODUCTS_APP', 'WORKFLOW_APP'):
                key = variable + '_PASSWORD_PATH'
                protected_file(Path(self.values.get(key, '')), key)
                content = Path(self.values[key]).read_bytes().rstrip(b'\r\n')
                if not content or content in contents:
                    raise Failure('Administrator and each application password must be nonempty and distinct')
                contents.append(content)
            administrator = Path(self.values['DB_ADMIN_PASSWORD_PATH']).read_bytes().decode('utf-8')
            if '\r' in administrator or '\0' in administrator:
                raise Failure('DB_ADMIN_PASSWORD_PATH must use UTF-8 with LF line endings')
            if self.mode in ('full', 'postgres-migrations'):
                self.env['FLYWAY_URL'] = 'jdbc:postgresql://synkro-db:5432/synkro?connectTimeout=5&socketTimeout=60'
                self.env['FLYWAY_USER'] = self.values.get('DB_ADMIN_USER', '')
                self.env['FLYWAY_PASSWORD'] = administrator.rstrip('\n')
        if self.mode in ('full', 'mongo-migrations'):
            owner = self.root.parent / 'synkro-infra-mongo'
            sales = self.root.parent / 'synkro-sales-db/deploy/migrate.sh'
            if not (owner / 'scripts/mongo.mjs').is_file() or not sales.is_file() or re.search(r'mongosh\s+"\$LIQUIBASE_COMMAND_URL"', sales.read_text()):
                raise Failure('Mongo infrastructure / supported Sales credential protection not delivered at selected revisions')
            protected_file(self.root / f'env/{self.name}.env', 'MONGO_ENVIRONMENT_FILE')
            self.mongo('prepare')
            self.env['MONGO_SECRET_DIR'] = (owner / '.runtime' / self.project).as_posix()
            self.env['MONGODB_URI'] = 'mongodb://' + quote(self.values['MONGO_ADMIN_USER'], safe='') + ':' + quote(self.values['MONGO_ADMIN_PASSWORD'], safe='') + '@synkro-mongo:27017'
            self.env['MONGODB_OPTIONS'] = 'authSource=admin&replicaSet=rs0&connectTimeoutMS=2000&serverSelectionTimeoutMS=5000&socketTimeoutMS=10000'
        if self.mode == 'full':
            for repo in ('infra-mongo', 'auth-db', 'products-db', 'customers-db', 'sales-db', 'auth-api',
                         'customers-api', 'products-api', 'sales-api', 'workflow', 'worker', 'api-gateway',
                         'front', 'auth-portal', 'customers-portal', 'products-portal', 'sales-portal'):
                suffix = 'compose.yml' if repo == 'infra-mongo' else 'deploy/compose.yml'
                if not (self.root.parent / f'synkro-{repo}' / suffix).is_file():
                    raise Failure(f'Missing required sibling: synkro-{repo}/{suffix}')
            protected_file(Path(self.values.get('JWT_PRIVATE_KEY_PATH', '')), 'JWT_PRIVATE_KEY_PATH')
        model = json.loads(self.compose('--profile', 'tooling', 'config', '--format', 'json'))
        validate_model(model, self.project, self.values)
        if self.mode == 'full':
            expected = {'synkro-db', 'synkro-mongo', 'auth-db-migrate', 'products-db-migrate', 'customers-db-migrate',
                        'sales-db-migrate', 'workflow-db-migrate', 'synkro-auth-api', 'synkro-products-api',
                        'synkro-customers-api', 'synkro-sales-api', 'synkro-workflow', 'synkro-worker',
                        'synkro-api-gateway', 'host', 'auth-portal', 'synkro-products-portal',
                        'synkro-customers-portal', 'synkro-sales-portal', 'otel-collector', 'prometheus', 'grafana'}
            if expected - set(model['services']):
                raise Failure('Full composition is missing required services/runners')
        return model

    def compose(self, *args, **kwargs):
        return run(self.command + list(args), env=self.env, **kwargs)

    def mongo(self, operation, *args):
        return run([os.environ.get('SYNKRO_NODE', 'node'), str(self.root.parent / 'synkro-infra-mongo/scripts/mongo.mjs'),
                    operation, '--env-file', str(self.root / f'env/{self.name}.env'), *args], env=self.env, timeout=330)

    def network_guard(self):
        for identifier in run(['docker', 'ps', '-q', '--filter', 'network=platform']).split():
            item = json.loads(run(['docker', 'inspect', identifier]))[0]
            if item['Config']['Labels'].get('com.docker.compose.project') != self.project:
                if any(set(value.get('Aliases') or []) & {'synkro-db', 'synkro-mongo'} for value in item['NetworkSettings']['Networks'].values()):
                    raise Failure('Another environment owns engine DNS on platform; operate environments sequentially')

    def sql(self, sql):
        return self.compose('exec', '-T', 'synkro-db', 'sh', '-c',
                            'export PGPASSWORD="$(cat "$DB_ADMIN_PASSWORD_FILE")"; exec psql -X -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -At',
                            data=sql.encode(), timeout=90).strip()

    def ready(self, engine='synkro-db', seconds=150):
        deadline = time.monotonic() + seconds
        while time.monotonic() < deadline:
            rows = json.loads(self.compose('ps', '--format', 'json', engine) or '[]')
            rows = rows if isinstance(rows, list) else [rows]
            if rows and all(row.get('Health') == 'healthy' for row in rows):
                return
            time.sleep(2)
        raise Failure(f'{engine} readiness timed out; migrations were not started')

    def server_ready(self, seconds=90):
        """Bootstrap must work before the required login set is complete."""
        deadline = time.monotonic() + seconds
        while time.monotonic() < deadline:
            try:
                value = self.compose('exec', '-T', 'synkro-db', 'sh', '-c',
                    'export PGPASSWORD="$(cat "$DB_ADMIN_PASSWORD_FILE")"; export PGCONNECT_TIMEOUT=3 PGOPTIONS="-c statement_timeout=3000"; exec psql -X -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc "SELECT 1"', timeout=8)
                if value.strip() == '1':
                    return
            except Failure:
                pass
            time.sleep(2)
        raise Failure('PostgreSQL authenticated server readiness timed out; bootstrap was not started')


def backup(env, destination):
    destination = backup_directory(Path(destination), env.root.parent)
    bundle = destination / f'{env.project}-{uuid.uuid4().hex}'
    bundle.mkdir(mode=0o700)
    try:
        for name, command in [('roles.sql', 'pg_dumpall --globals-only --quote-all-identifiers'), ('database.dump', 'pg_dump -Fc -d "$POSTGRES_DB"')]:
            with (bundle / name).open('xb') as output:
                os.chmod(bundle / name, 0o600)
                env.compose('exec', '-T', 'synkro-db', 'sh', '-c',
                            'export PGPASSWORD="$(cat "$DB_ADMIN_PASSWORD_FILE")"; ' + command + ' -U "$POSTGRES_USER"',
                            output=output, timeout=300)
            protect_created(bundle / name)
        administrator = env.sql('SELECT rolname FROM pg_roles WHERE oid=10')
        if not administrator:
            raise Failure('Bootstrap administrator identity unavailable')
        (bundle / 'complete.json').write_text(json.dumps({'project': env.project, 'format': 2, 'bootstrap_role': administrator}))
    except Exception:
        # Incomplete bundles remain clearly incomplete; never selected as backups.
        raise Failure('Backup failed; migration prevented; incomplete bundle retained') from None
    return bundle


def history_guard(env):
    if env.sql("SELECT to_regclass('public.flyway_schema_history') IS NOT NULL;") == 't':
        raise Failure('Legacy public Flyway history: backed-up reviewed reconciliation required')


def mongo_backup(env, destination):
    destination = backup_directory(Path(destination), env.root.parent)
    bundle = destination / f'{env.project}-mongo-{uuid.uuid4().hex}'
    bundle.mkdir(mode=0o700)
    try:
        env.mongo('backup', '--database', 'sales', '--archive', str(bundle / 'sales.archive.gz'))
        (bundle / 'complete.json').write_text(json.dumps({'project': env.project, 'engine': 'mongo', 'format': 1}))
    except Failure:
        raise Failure('Mongo backup failed; migration prevented; incomplete bundle retained') from None
    return bundle


def privileges(env):
    defects = env.sql("""WITH users(name, schema_name) AS (VALUES
      ('auth_app','auth_schema'),('products_app','products_schema'),
      ('customers_app','customers_schema'),('workflow_app','workflow_schema'))
    SELECT count(*) FROM users u JOIN pg_roles r ON r.rolname=u.name
    WHERE r.rolsuper OR r.rolcreatedb OR r.rolcreaterole OR EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE c.relkind IN ('r','p') AND n.nspname IN ('auth_schema','products_schema','customers_schema','workflow_schema')
      AND ((n.nspname<>u.schema_name AND (has_table_privilege(u.name,c.oid,'SELECT,INSERT,UPDATE,DELETE')))
        OR has_table_privilege(u.name,c.oid,'DELETE,TRUNCATE')));
    """)
    if defects != '0':
        raise Failure('Application privilege isolation verification failed')
    for domain in DOMAINS:
        if env.sql(f"SELECT to_regnamespace('{domain}_schema') IS NOT NULL;") != 't':
            raise Failure(f'{domain} migrations unavailable: full privilege acceptance blocked')
    if env.sql("SELECT has_table_privilege('auth_app','auth_schema.user_creation_audit','UPDATE,DELETE,TRUNCATE');") != 'f':
        raise Failure('Auth audit is not append-only')


def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument('operation', choices=['up', 'status', 'down', 'bootstrap', 'migrate', 'privileges', 'backup', 'restore', 'dev-identity'])
    parser.add_argument('environment', choices=['dev', 'qa', 'main'])
    parser.add_argument('--mode', choices=MODES, default='full')
    parser.add_argument('--domain', choices=(*DOMAINS, 'sales'))
    parser.add_argument('--destination')
    parser.add_argument('--backup')
    parser.add_argument('--engine', choices=['postgres', 'mongo'], default='postgres')
    parser.add_argument('--target-env-file')
    parser.add_argument('--manifest')
    try:
        args = parser.parse_args(argv)
        if args.operation == 'dev-identity':
            if args.environment != 'dev':
                raise Failure('Development identity is available only in dev')
            from dev_identity import generate
            generate(Path(args.destination or ROOT / 'keys/dev'))
            return 0
        if args.operation == 'restore':
            if args.engine == 'mongo':
                if not args.backup or not args.target_env_file or not args.manifest:
                    raise Failure('Select a completed Mongo bundle, an owned migrated disposable target and its owner manifest')
                bundle = Path(args.backup).resolve()
                if json.loads((bundle / 'complete.json').read_text()) != {'project': 'synkro-' + args.environment, 'engine': 'mongo', 'format': 1}:
                    raise Failure('Mongo backup metadata does not match the selected source environment')
                target = Path(args.target_env_file).resolve()
                protected_file(target, 'DISPOSABLE_TARGET_ENVIRONMENT')
                values = read_env(target)
                if values.get('MONGO_DISPOSABLE') != 'true' or not re.fullmatch(r'synkro-infra-test-[a-z0-9-]+-restore', values.get('COMPOSE_PROJECT_NAME', '')):
                    raise Failure('Mongo restore refuses a persistent target')
                manifest = Path(args.manifest).resolve()
                protected_file(manifest, 'DISPOSABLE_TARGET_MANIFEST')
                run([os.environ.get('SYNKRO_NODE', 'node'), str(ROOT.parent / 'synkro-infra-mongo/scripts/mongo.mjs'), 'restore-sales-disposable',
                     '--env-file', str(target), '--database', 'sales', '--archive', str(bundle / 'sales.archive.gz'),
                     '--test-run', values.get('MONGO_TEST_RUN', ''), '--manifest', str(manifest),
                     '--sales-checkout', str(ROOT.parent / 'synkro-sales-db')], timeout=180)
                print('Sales documents restored through the owner procedure; target users, schema, grants and fresh history retained')
                return 0
            from restore import restore
            restore(args.environment, args.backup)
            return 0
        env = Environment(args.environment, args.mode)
        env.prepare()
        if args.operation == 'up':
            # Only create a shared network if it is absent. Never delete it.
            result = subprocess.run(['docker', 'network', 'inspect', 'platform'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=30)
            if result.returncode:
                run(['docker', 'network', 'create', 'platform'])
            env.network_guard()
            targets = ['synkro-db'] if env.mode == 'postgres-migrations' else []
            env.compose('up', '-d', '--build', '--wait', '--wait-timeout', '180', *targets, timeout=900)
        elif args.operation == 'status':
            env.ready('prometheus' if args.mode == 'observability' else 'synkro-mongo' if args.mode == 'mongo-migrations' else 'synkro-db')
            print(f'{env.project}: selected engine ready ({args.mode}); full service readiness requires integration checks')
        elif args.operation == 'down':
            env.compose('down', '--timeout', '30', timeout=180)
        elif args.operation == 'bootstrap':
            if args.engine == 'mongo':
                env.ready('synkro-mongo')
                env.mongo('bootstrap')
            else:
                env.server_ready()
                env.compose('exec', '-T', 'synkro-db', 'bash', '/docker-entrypoint-initdb.d/01-instance.sh')
                env.ready()
        elif args.operation == 'backup':
            env.ready('synkro-mongo' if args.engine == 'mongo' else 'synkro-db')
            print((mongo_backup if args.engine == 'mongo' else backup)(env, args.destination or env.values.get('BACKUP_DIRECTORY', '')))
        elif args.operation == 'privileges':
            env.ready()
            privileges(env)
        elif args.operation == 'migrate':
            if not args.domain:
                raise Failure('Select one migration domain explicitly')
            if env.mode != 'full' and not ((env.mode == 'postgres-migrations' and args.domain in DOMAINS) or (env.mode == 'mongo-migrations' and args.domain == 'sales')):
                raise Failure('Selected preparation mode does not include this migration runner')
            with lock(Path.home() / '.synkro-operations' / f'{env.project}.lock'):
                engine = 'synkro-mongo' if args.domain == 'sales' else 'synkro-db'
                env.ready(engine)
                if args.domain == 'sales':
                    if env.mode not in ('full', 'mongo-migrations'):
                        raise Failure('Select full or mongo-migrations mode for Sales')
                    if env.name != 'dev':
                        mongo_backup(env, args.destination or env.values.get('BACKUP_DIRECTORY', ''))
                else:
                    history_guard(env)
                    if env.name != 'dev':
                        backup(env, args.destination or env.values.get('BACKUP_DIRECTORY', ''))
                env.compose('--profile', 'tooling', 'run', '--rm', '--no-deps', f'{args.domain}-db-migrate', timeout=300)
        print('Operation completed; volumes preserved')
        return 0
    except SystemExit as error:
        return int(error.code)
    except (Failure, OSError, ValueError) as error:
        print('ERROR: ' + (str(error) if isinstance(error, Failure) else 'Configuration or filesystem error; contents suppressed'), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
