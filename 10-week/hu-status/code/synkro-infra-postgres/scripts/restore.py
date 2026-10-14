"""Restore into an exclusively owned new target, never an existing environment."""
import json
import os
import secrets
import tempfile
import uuid
from local_owner import execution_id
from pathlib import Path
from operations import Failure, run, protect_created


def restore(environment, source, verify=None):
    if not source:
        raise Failure('Select a completed PostgreSQL backup bundle explicitly')
    bundle = Path(source).resolve()
    metadata = json.loads((bundle / 'complete.json').read_text())
    administrator = metadata.get('bootstrap_role', '')
    if set(metadata) != {'project', 'format', 'bootstrap_role'} or metadata.get('project') != 'synkro-' + environment or metadata.get('format') != 2 or not administrator or '\n' in administrator or '\r' in administrator:
        raise Failure('Backup metadata does not match the explicitly selected environment')
    quoted = '"' + administrator.replace('"', '""') + '"'
    roles = (bundle / 'roles.sql').read_text(encoding='utf-8')
    creation = 'CREATE ROLE ' + quoted + ';'
    if roles.splitlines().count(creation) != 1:
        raise Failure('Backup bootstrap role statement is not unambiguous')
    roles = '\n'.join(line for line in roles.splitlines() if line != creation) + '\n'
    owner = execution_id()
    project = 'synkro-restore-' + owner
    label = ['--label', 'synkro.disposable=true', '--label', 'synkro.execution=' + owner]
    volume = run(['docker', 'volume', 'create', *label, project + '-data']).strip()
    target = project + '-db'
    with tempfile.TemporaryDirectory(prefix='synkro-restore-') as folder:
        password = Path(folder) / 'password'
        password.write_text(secrets.token_urlsafe(40))
        os.chmod(password, 0o600)
        protect_created(password)
        try:
            run(['docker', 'run', '-d', '--name', target, *label,
                 '-e', 'POSTGRES_USER=' + administrator, '-e', 'POSTGRES_DB=synkro',
                 '-e', 'POSTGRES_INITDB_ARGS=--auth-host=scram-sha-256',
                 '-e', 'POSTGRES_PASSWORD_FILE=/run/secrets/password',
                 '--mount', f'type=volume,source={volume},target=/var/lib/postgresql/data',
                 '--mount', f'type=bind,source={password},target=/run/secrets/password,readonly',
                 'postgres:16.15-alpine3.23'])
            import time
            for attempt in range(60):
                try:
                    run(['docker', 'exec', target, 'sh', '-c', 'export PGPASSWORD="$(cat /run/secrets/password)"; psql -X -h 127.0.0.1 -U "$POSTGRES_USER" -d synkro -Atqc "SELECT 1"'], timeout=5)
                    break
                except Failure:
                    time.sleep(2)
            else:
                raise Failure('Disposable restore target readiness timed out')
            # Preserve bootstrap-superuser OID 10: PG16 GRANTED BY semantics
            # depend on it. Only omit its duplicate CREATE; replay its ALTERs.
            run(['docker', 'exec', '-i', target, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', administrator, '-d', 'synkro'],
                data=roles.encode())
            run(['docker', 'exec', '-i', target, 'pg_restore', '--exit-on-error', '-U', administrator, '-d', 'synkro'],
                data=(bundle / 'database.dump').read_bytes(), timeout=300)
            count = run(['docker', 'exec', target, 'psql', '-X', '-U', administrator, '-d', 'synkro', '-Atqc',
                 "SELECT count(*) FROM pg_roles WHERE rolname IN ('auth_app','products_app','customers_app','workflow_app')"])
            if count.strip() != '4':
                raise Failure('Restoration did not preserve the four application users')
            if verify:
                verify(target, administrator)
            print('PostgreSQL backup restored successfully into a separate disposable target')
        finally:
            cleanup(target, volume, owner)


def cleanup(target, volume, owner):
    # Inspect every resource before deleting any; ownership alone is insufficient.
    if target != 'synkro-restore-' + owner + '-db' or volume != 'synkro-restore-' + owner + '-data':
        raise Failure('Cleanup refuses an unrelated target')
    container = json.loads(run(['docker', 'inspect', target]))[0]
    storage = json.loads(run(['docker', 'volume', 'inspect', volume]))[0]
    for labels in [container['Config']['Labels'], storage['Labels']]:
        if labels.get('synkro.execution') != owner or labels.get('synkro.disposable') != 'true':
            raise Failure('Cleanup ownership verification failed; resources retained')
    mounts = [mount['Name'] for mount in container['Mounts'] if mount['Type'] == 'volume']
    if mounts != [volume]:
        raise Failure('Cleanup refuses unexpected volumes')
    run(['docker', 'rm', '-f', target])
    run(['docker', 'volume', 'rm', volume])
