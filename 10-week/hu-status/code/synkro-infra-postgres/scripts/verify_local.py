"""Exact committed sibling integration, independent of repository administration.

Child diagnostics are discarded, not published: arbitrary owner output may contain
credentials. Evidence consists only of fixed classifications and trusted metadata.
"""
import argparse
from contextlib import nullcontext
import csv
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import platform
import re
import signal
import shutil
import stat
import subprocess
import sys
import tempfile
import time
import uuid
from datetime import datetime, timezone


class Invalid(RuntimeError):
    pass


class Blocked(RuntimeError):
    pass


def now():
    return datetime.now(timezone.utc).isoformat()


def child_environment(tmp):
    env = {k: v for k, v in os.environ.items()
           if not k.startswith(('COMPOSE_', 'FLYWAY_', 'SYNKRO_DEPENDENCY_', 'GITHUB_', 'GH_'))}
    env.update(PYTHONDONTWRITEBYTECODE='1', PYTHONIOENCODING='utf-8', PYTHON=sys.executable,
               TEMP=str(tmp), TMP=str(tmp), TMPDIR=str(tmp), GIT_TERMINAL_PROMPT='0')
    return env


def create_fixture_tmp(run):
    # Native short paths support both Python fixture IO and Git for Windows.
    # This directory is exclusively created, protected and tied to this run.
    tmp = Path(tempfile.mkdtemp(prefix='sk-'))
    protect(tmp)
    (tmp / '.fixture-owner').write_text(run.name, encoding='utf-8')
    (run / '.fixture-tmp').write_text(str(tmp), encoding='utf-8')
    return tmp


def git(repository, *args):
    cmd = ['git', '-c', 'core.longpaths=true', '-c', 'gc.auto=0', '-c', 'maintenance.auto=false']
    if repository is not None:
        cmd += ['-C', str(repository)]
    try:
        result = subprocess.run(cmd + list(args), capture_output=True, check=True,
                                timeout=180, env=child_environment(tempfile.gettempdir()))
        return result.stdout.decode('utf-8', errors='replace').strip()
    except (subprocess.SubprocessError, OSError):
        raise Blocked('Git operation unavailable; raw diagnostics suppressed') from None


def validate_lock(lock):
    entries = lock.get('repositories')
    if not isinstance(entries, list) or not entries:
        raise Invalid('Invalid dependency lock')
    names = {'synkro-infra-postgres'}
    for entry in entries:
        if not isinstance(entry, dict):
            raise Invalid('Invalid dependency entry')
        name, revision = entry.get('name', ''), entry.get('revision', '')
        if not isinstance(name, str) or not re.fullmatch(r'synkro-[a-z0-9]+(?:-[a-z0-9]+)*', name) or name in names:
            raise Invalid('Invalid or duplicate dependency name')
        if not isinstance(revision, str) or not re.fullmatch(r'[0-9a-f]{40}', revision):
            raise Invalid('Malformed immutable dependency SHA')
        names.add(name)
    return entries


def overlaps(a, b):
    a, b = Path(a).resolve(), Path(b).resolve()
    return a == b or a in b.parents or b in a.parents


def remove_tree(path):
    path = Path(path)
    if os.name == 'nt':
        # Filesystem-only extended syntax handles deep committed Java/npm trees.
        # Git and child TEMP paths retain their native syntax.
        absolute = str(path.absolute())
        if not absolute.startswith('\\\\?\\'):
            absolute = ('\\\\?\\UNC\\' + absolute[2:]) if absolute.startswith('\\\\') else ('\\\\?\\' + absolute)
        path = Path(absolute)
    if not path.exists():
        return
    if path.is_symlink() or (hasattr(path, 'is_junction') and path.is_junction()):
        raise Invalid('Cleanup refuses a linked directory')
    root = path.resolve()
    def writable(function, target, error):
        item = Path(target).resolve()
        if root not in item.parents:
            raise Invalid('Cleanup target escaped owned directory')
        os.chmod(item, stat.S_IWRITE | stat.S_IREAD)
        function(target)
    shutil.rmtree(path, onerror=writable)


def verify_snapshot(repository, revision):
    if git(repository, 'rev-parse', 'HEAD') != revision or git(repository, 'status', '--porcelain'):
        raise Invalid('Exact snapshot HEAD/clean-state verification failed')


def snapshot(source, destination, revision, name, allow_fetch=False):
    source, destination = Path(source).resolve(), Path(destination).resolve()
    if overlaps(source, destination) or destination.exists():
        raise Invalid('Source/destination collision or existing snapshot; refusing overwrite')
    if not re.fullmatch(r'[0-9a-f]{40}', revision):
        raise Invalid('Malformed immutable SHA')
    destination.parent.mkdir(parents=True, exist_ok=True)
    stage = destination.parent / ('.stage-' + uuid.uuid4().hex)
    # Exclusive creation happens before the cleanup try: a colliding directory
    # is neither reinitialized by Git nor mistaken for task-owned staging.
    stage.mkdir(exist_ok=False)
    try:
        git(None, 'init', str(stage))
        try:
            # A local upload-pack fetch transfers an independent object pack. No
            # local clone hardlinks, alternates, shared .git or working-tree copy.
            git(stage, 'fetch', '--no-tags', '--depth=1', str(source), revision)
        except Blocked:
            if not allow_fetch:
                raise Blocked(name + ': locked revision unavailable locally; approved isolated fetch optional') from None
            git(stage, 'fetch', '--no-tags', '--depth=1',
                'https://github.com/code-corhuila/' + name + '.git', revision)
        git(stage, 'checkout', '--detach', revision)
        verify_snapshot(stage, revision)
        if destination.exists():
            raise Invalid('Snapshot destination appeared; refusing overwrite')
        stage.rename(destination)
    finally:
        remove_tree(stage)


def protect(directory):
    if os.name != 'nt':
        os.chmod(directory, 0o700)
        return
    try:
        identity = subprocess.run(['whoami', '/user', '/fo', 'csv', '/nh'],
                                  capture_output=True, check=True, timeout=15).stdout.decode()
        sid = next(csv.reader([identity.strip()]))[-1]
        if not re.fullmatch(r'S-1-[0-9-]+', sid):
            raise Invalid('Current user identity unavailable')
        subprocess.run(['icacls', str(directory), '/inheritance:r', '/grant:r',
                        '*' + sid + ':(OI)(CI)F', '*S-1-5-18:(OI)(CI)F',
                        '*S-1-5-32-544:(OI)(CI)F'], capture_output=True, check=True, timeout=30)
    except (subprocess.SubprocessError, OSError):
        raise Invalid('Owner-only execution directory protection failed') from None


def create_run(parent):
    parent = Path(parent).resolve()
    parent.mkdir(parents=True, exist_ok=True)
    run = parent / ('run-' + uuid.uuid4().hex)
    run.mkdir(exist_ok=False)
    protect(run)
    (run / '.local-owner').write_text(run.name, encoding='utf-8')
    return run


def clean_snapshots(run):
    run = Path(run)
    if run.is_symlink() or (run / '.local-owner').read_text(encoding='utf-8') != run.name:
        raise Invalid('Execution directory cleanup ownership verification failed')
    fixture = run / '.fixture-tmp'
    if fixture.exists():
        tmp = Path(fixture.read_text(encoding='utf-8'))
        if (tmp.is_symlink() or not tmp.name.startswith('sk-')
                or tmp.parent.resolve() != Path(tempfile.gettempdir()).resolve()
                or (tmp / '.fixture-owner').read_text(encoding='utf-8') != run.name):
            raise Invalid('Fixture temporary directory ownership verification failed')
        remove_tree(tmp)
        fixture.unlink()
    for name in ('layout', '.tmp'):
        target = run / name
        if target.parent.resolve() != run.resolve():
            raise Invalid('Cleanup escaped execution directory')
        remove_tree(target)


def capture_tools(env):
    tools, unavailable = {'python': platform.python_version()}, []
    bash = os.environ.get('SYNKRO_BASH') or ('C:/Program Files/Git/bin/bash.exe' if os.name == 'nt' else shutil.which('bash'))
    node = os.environ.get('SYNKRO_NODE') or shutil.which('node')
    commands = {'git': ['git', '--version'], 'bash': [bash or 'bash', '--version'],
                'node': [node or 'node', '--version'], 'docker': ['docker', 'info', '--format', '{{.OSType}} {{.ServerVersion}}'],
                'compose': ['docker', 'compose', 'version', '--short']}
    for name, command in commands.items():
        try:
            result = subprocess.run(command, capture_output=True, timeout=30, env=env)
            output = result.stdout.decode(errors='replace').splitlines()[0] if result.stdout else ''
            # Only known version patterns are publishable, never raw tool output.
            version = re.search(r'\d+\.\d+(?:\.\d+)?', output)
            if result.returncode or not version or (name == 'docker' and not output.startswith('linux ')):
                raise ValueError()
            tools[name] = version.group()
            if name == 'node' and int(version.group().split('.')[0]) < 22:
                unavailable.append('node')
            if name == 'compose' and tuple(map(int, version.group().split('.'))) < (2, 24, 4):
                unavailable.append('compose')
        except (ValueError, subprocess.SubprocessError, OSError):
            unavailable.append(name)
    if sys.version_info < (3, 11):
        unavailable.append('python')
    for package in ('yaml', 'cryptography'):
        if importlib.util.find_spec(package) is None:
            unavailable.append('python-test-dependencies')
    return tools, set(unavailable), bash, node


def inventory(env):
    records = {}
    for kind, list_args in [('container', ['ps', '-aq']), ('volume', ['volume', 'ls', '-q']), ('network', ['network', 'ls', '-q'])]:
        found = subprocess.run(['docker'] + list_args, capture_output=True, check=True, timeout=30, env=env).stdout.split()
        # Bounded argv batches avoid hundreds of Windows daemon round trips.
        # Retain the same identities/ownership fields; never publish raw inspect.
        for offset in range(0, len(found), 64):
            identifiers = [value.decode() for value in found[offset:offset + 64]]
            items = json.loads(subprocess.run(['docker', kind, 'inspect', *identifiers],
                               capture_output=True, check=True, timeout=30, env=env).stdout)
            for item in items:
                labels = (item.get('Config', {}).get('Labels') if kind == 'container' else item.get('Labels')) or {}
                record = {'kind': kind, 'name': item['Name'].lstrip('/'),
                          'id': item.get('Id', item.get('CreatedAt', '')),
                          'labels': {k: labels[k] for k in ('synkro.execution', 'synkro.disposable', 'io.synkro.infra.test-run',
                                      'io.synkro.infra.disposable', 'com.docker.compose.project') if k in labels}}
                records[(kind, record['name'])] = record
    return records


def assert_resource_owned(record, owners):
    labels = record['labels']
    owned = (labels.get('synkro.execution') in owners and labels.get('synkro.disposable') == 'true') or (
        labels.get('io.synkro.infra.test-run') in owners and labels.get('io.synkro.infra.disposable') == 'true')
    if not owned or not record['name'].startswith('synkro-'):
        raise Invalid('Cleanup refuses an unrelated or non-disposable resource')


def recorded_owners(run):
    owners = set()
    file = run / '.execution-ids'
    if file.exists():
        owners.update(value for value in file.read_text(encoding='utf-8').splitlines()
                      if re.fullmatch(r'[a-f0-9]{24,32}', value))
    # Published Mongo suites write their own guarded lifecycle manifests in this
    # run's isolated copy. Read identity fields only; never publish its env files.
    mongo = run / 'layout/synkro-infra-mongo/tests/.artifacts'
    if mongo.exists():
        for file in mongo.glob('*/manifest.json'):
            items = json.loads(file.read_text(encoding='utf-8'))
            if isinstance(items, list):
                for item in items:
                    value = item.get('run', '')
                    if re.fullmatch(r'[a-z0-9-]+', value) and item.get('project', '').startswith('synkro-infra-test-' + value + '-'):
                        owners.add(value)
    return owners


def verify_resources(before, env, run=None):
    after = inventory(env)
    if any(after.get(key) != record for key, record in before.items()):
        raise Invalid('Preexisting resource identity changed; refusing cleanup')
    owners = recorded_owners(run) if run else set()
    residual = [record for key, record in after.items() if key not in before]
    # Validate ALL residuals before destructive operations; a name or a before/
    # after difference alone is never ownership proof. Reinspect before removal.
    for record in residual:
        assert_resource_owned(record, owners)
    for kind in ('container', 'volume', 'network'):
        for record in residual:
            if record['kind'] != kind:
                continue
            current = inventory(env).get((kind, record['name']))
            if current != record:
                raise Invalid('Disposable identity replaced; refusing removal')
            command = ['docker', kind, 'rm'] + (['-f'] if kind == 'container' else []) + [record['name']]
            subprocess.run(command, capture_output=True, check=True, timeout=60, env=env)
    after = inventory(env)
    if before != after:
        raise Invalid('Resource audit changed: residual/replaced resource; guarded owner cleanup required')
    return {'status': 'PASSED', 'fallback_resources_removed': len(residual),
            'reason': 'Guarded cleanup verified; preexisting resource identities preserved'}


def run_suites(plan, blocked, environment, timeout, interrupted=None):
    results = []
    stopped = False
    for suite in plan:
        row = {'name': suite['name'], 'exit_code': None, 'started_at': now()}
        reasons = [blocked[key] for key in suite.get('requires', []) if key in blocked]
        if stopped:
            row.update(status='NOT RUN', reason='Handled interruption; active bounded suite allowed to clean up')
        elif reasons:
            row.update(status='BLOCKED', reason='; '.join(sorted(set(reasons))))
        else:
            print('RUN ' + suite['name'], flush=True)
            # Raw owner diagnostics stay in guarded temporary storage and are
            # removed with snapshots. They are never forwarded or evidence.
            env = environment or dict(os.environ)
            flags = subprocess.CREATE_NEW_PROCESS_GROUP if os.name == 'nt' else 0
            try:
                owner_file = env.get('SYNKRO_LOCAL_OWNER_FILE')
                sink = nullcontext(subprocess.DEVNULL)
                if owner_file:
                    run = Path(owner_file).parent
                    if (run / '.local-owner').read_text(encoding='utf-8') != run.name or (run / '.tmp').is_symlink():
                        raise Invalid('Private diagnostic ownership rejected')
                    sink = (run / '.tmp' / ('diagnostic-' + suite['name'] + '-' + uuid.uuid4().hex + '.raw')).open('xb')
                with sink as output:
                    process = subprocess.Popen(suite['command'], cwd=suite['cwd'], env=env,
                                               stdout=output, stderr=output,
                                               creationflags=flags, start_new_session=os.name != 'nt')
            except OSError:
                row.update(status='BLOCKED', reason='Local suite launcher unavailable')
                row['finished_at'] = now()
                results.append(row)
                continue
            deadline = time.monotonic() + suite.get('timeout', timeout)
            timed_out = False
            while process.poll() is None:
                try:
                    process.wait(timeout=max(0.1, min(1, deadline - time.monotonic())))
                except subprocess.TimeoutExpired:
                    if time.monotonic() >= deadline:
                        # Preserve failure. Resource audit must verify cleanup;
                        # forceful timeout is never reported as successful cleanup.
                        if os.name == 'nt':
                            subprocess.run(['taskkill', '/PID', str(process.pid), '/T', '/F'],
                                           capture_output=True, timeout=30)
                        else:
                            os.killpg(process.pid, signal.SIGKILL)
                        process.wait(timeout=30)
                        timed_out = True
                except KeyboardInterrupt:
                    stopped = True
                    if interrupted is not None:
                        interrupted.append(True)
                    print('Interruption recorded; waiting for active bounded owner cleanup', flush=True)
            code = process.returncode
            row.update(exit_code=code, status='FAILED' if code or timed_out else 'PASSED',
                       reason='Bounded suite timeout; resource audit required' if timed_out else
                       ('Suite returned nonzero; private diagnostics suppressed' if code else 'Owning suite completed'))
        row['finished_at'] = now()
        results.append(row)
        print(row['status'] + ' ' + suite['name'], flush=True)
    return results


def aggregate(results, scope):
    if not results:
        return 1
    if any(row['status'] == 'FAILED' for row in results):
        return 1
    if scope != 'full' or any(row['status'] != 'PASSED' for row in results) or not any(
            row.get('name') == 'full-platform-acceptance' for row in results):
        return 2
    return 0


def classify_prerequisites(row, absent, diagnostics):
    allowed = {'Missing required composition: ' + name for name in absent}
    if 'synkro-workflow' in absent:
        allowed.add('Missing Workflow migration runner and approved migrations')
    if (row['status'] == 'FAILED' and row['exit_code'] == 1 and absent
            and diagnostics and all(line in allowed for line in diagnostics)):
        row.update(status='BLOCKED', reason='Mandatory owner deliveries absent: ' + ', '.join(absent))


def capability_ready(results, cleanup, interrupted):
    applicable = [row for row in results if row['name'] not in ('full-prerequisites', 'full-platform-acceptance')]
    return (bool(applicable) and all(row['status'] == 'PASSED' for row in applicable)
            and not any(row['status'] == 'FAILED' for row in results)
            and cleanup['status'] == 'PASSED' and not interrupted)


def suites(layout, bash, node, owner=None):
    root = layout / 'synkro-infra-postgres'
    def suite(name, command, requires=(), cwd=root, timeout=3600):
        requirements = list(requires)
        if command[0] == sys.executable:
            requirements.append('python')
        return {'name': name, 'command': command, 'cwd': cwd, 'requires': requirements, 'timeout': timeout}
    py = sys.executable
    owner = owner or uuid.uuid4().hex
    db = ['synkro-auth-db', 'synkro-products-db', 'docker', 'python-test-dependencies']
    mongo = ['synkro-infra-mongo', 'synkro-sales-db', 'docker', 'node']
    syntax = 'set -euo pipefail; for file in scripts/*.sh postgres/init/*.sh postgres/*.sh; do bash -n "$file"; done'
    return [
        suite('unit-git-regressions', [py, '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_*.py'], ['git', 'python-test-dependencies']),
        suite('bash-syntax', [bash or 'bash', '-c', syntax], ['bash']),
        suite('shellcheck', ['docker', 'run', '--rm', '--name', 'synkro-shellcheck-' + owner,
              '--label', 'synkro.execution=' + owner, '--label', 'synkro.disposable=true',
              '-v', str(root) + ':/mnt:ro', 'koalaman/shellcheck:v0.10.0',
              *[p.relative_to(root).as_posix() for p in sorted(root.glob('scripts/*.sh'))],
              'postgres/init/01-instance.sh', 'postgres/health.sh', 'postgres/entrypoint.sh'], ['docker']),
        suite('protected-baselines', [py, 'scripts/verify_protected.py'], [p.name for p in layout.iterdir() if p.is_dir() and p != root]),
        suite('postgres-integration', [py, 'tests/integration.py'], db + ['synkro-customers-db', 'synkro-workflow']),
        suite('auth-db-regressions', [py, 'tests/db_regressions.py', 'auth'], ['synkro-auth-db', 'docker', 'python-test-dependencies']),
        suite('products-db-regressions', [py, 'tests/db_regressions.py', 'products'], ['synkro-products-db', 'docker', 'python-test-dependencies']),
        suite('mongo-sales', [node or 'node', 'tests/mongo_sales.mjs'], mongo + ['python', 'python-test-dependencies']),
        suite('mongo-configuration', [node or 'node', 'tests/configuration.test.mjs'], ['synkro-infra-mongo', 'node'], layout / 'synkro-infra-mongo'),
        suite('mongo-lifecycle', [node or 'node', '--require', str(root / 'tests/mongo_phase_trace.cjs'), 'tests/integration.mjs'], ['synkro-infra-mongo', 'docker', 'node'], layout / 'synkro-infra-mongo'),
        suite('mongo-owner-sales', [node or 'node', 'tests/sales-integration.mjs', '--sales-checkout', str(layout / 'synkro-sales-db')], mongo, layout / 'synkro-infra-mongo'),
        suite('auth-initialization', [py, 'tests/auth_initialization.py'], db + ['synkro-auth-api']),
        suite('sales-runtime', [py, 'tests/sales_runtime.py'], mongo + ['synkro-sales-api', 'bash']),
        suite('observability', [py, 'tests/observability.py'], ['docker', 'python-test-dependencies']),
        suite('portal-delivery', [py, 'tests/portal_delivery.py'], ['docker', 'python-test-dependencies', 'synkro-front', 'synkro-auth-portal', 'synkro-customers-portal', 'synkro-products-portal', 'synkro-sales-portal']),
        suite('workflow-real-acceptance', [py, 'tests/workflow_acceptance.py'], ['docker', 'git', 'node', 'python-test-dependencies', 'synkro-customers-api', 'synkro-auth-api', 'synkro-products-api', 'synkro-sales-api', 'synkro-workflow', 'synkro-customers-db', 'synkro-auth-db', 'synkro-products-db', 'synkro-sales-db', 'synkro-api-gateway', 'synkro-front', 'synkro-auth-portal']),
        suite('full-prerequisites', [py, 'tests/dependencies.py']),
        suite('full-platform-acceptance', [py, 'tests/full_composition.py'],
              ['full-deliveries', 'docker', 'git', 'node', 'python-test-dependencies',
               *[p.name for p in layout.iterdir() if p.is_dir() and p != root]]),
        suite('customers-real-browser', [py, 'tests/customers_browser.py'],
              ['full-deliveries', 'docker', 'git', 'node', 'python-test-dependencies',
               'synkro-customers-portal', 'synkro-front', 'synkro-customers-api', 'synkro-auth-api',
               'synkro-auth-db', 'synkro-customers-db', 'synkro-auth-portal', 'synkro-api-gateway',
               'synkro-sales-portal', 'synkro-products-portal']),
    ]


def missing_deliveries(layout):
    """Inspect actual pinned owner files; don't classify arbitrary test failures."""
    missing = []
    for name in ('customers-db', 'auth-portal', 'customers-portal'):
        owner = layout / ('synkro-' + name)
        if not (owner / 'deploy/compose.yml').is_file():
            missing.append('synkro-' + name)
        elif name.endswith('portal') and not (owner / 'package.json').is_file():
            missing.append('synkro-' + name)
        elif name == 'customers-db' and not list(owner.glob('01_ddl/**/*.sql')):
            missing.append('synkro-' + name)
    workflow = layout / 'synkro-workflow'
    compose = workflow / 'deploy/compose.yml'
    if not compose.is_file() or 'workflow-db-migrate:' not in compose.read_text(encoding='utf-8') or not list(workflow.glob('db/**/*.sql')):
        missing.append('synkro-workflow')
    return missing


def write_evidence(run, manifest):
    (run / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    lines = ['# Local integration evidence', '', 'Root SHA: `' + manifest.get('root_sha', 'unavailable') + '`',
             'Scope: ' + manifest['scope'], 'Overall: ' + manifest['acceptance_status'],
             '', '| Suite | Status | Exit | Reason |', '|---|---|---|---|']
    for row in manifest['suites']:
        lines.append(f"| {row['name']} | {row['status']} | {row.get('exit_code')} | {row.get('reason', '')} |")
    lines += ['', 'Cleanup: ' + manifest['cleanup']['status'],
              'Local evidence does not waive unchanged INF-PG-12/DoD remote-integration acceptance.']
    (run / 'report.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-workspace', type=Path, required=True)
    parser.add_argument('--scope', choices=('available', 'full'), required=True)
    parser.add_argument('--root-revision')
    parser.add_argument('--output-parent', type=Path, default=Path(tempfile.gettempdir()) / 'synkro-local')
    parser.add_argument('--allow-fetch', action='store_true')
    args = parser.parse_args(argv)
    source, parent = args.source_workspace.resolve(), args.output_parent.resolve()
    if overlaps(source, parent):
        raise Invalid('Source/execution workspace paths collide')
    run = create_run(parent)
    manifest = {'format': 1, 'run_id': run.name, 'started_at': now(), 'os': platform.system(),
                'scope': args.scope, 'root_sha': 'unavailable', 'dependencies': [], 'suites': [],
                'cleanup': {'status': 'NOT RUN'}, 'acceptance_status': 'NOT READY'}
    layout, tmp = run / 'layout', run / '.tmp'
    tmp.mkdir()
    env = child_environment(create_fixture_tmp(run))
    env['SYNKRO_LOCAL_OWNER_FILE'] = str(run / '.execution-ids')
    before = None
    interrupted = []
    code = 1
    try:
        root_source = source / 'synkro-infra-postgres'
        revision = args.root_revision or git(root_source, 'rev-parse', 'HEAD')
        snapshot(root_source, layout / root_source.name, revision, root_source.name, args.allow_fetch)
        root = layout / root_source.name
        verifier = root / 'scripts/verify_local.py'
        if not verifier.is_file() or verifier.read_bytes() != Path(__file__).read_bytes():
            raise Invalid('Executing verifier differs from the selected committed root')
        manifest['root_sha'] = revision
        lock_bytes = (root / 'dependencies.lock.json').read_bytes()
        manifest['lock_sha256'] = hashlib.sha256(lock_bytes).hexdigest()
        entries = validate_lock(json.loads(lock_bytes))
        blocked = {}
        for entry in entries:
            name, sha = entry['name'], entry['revision']
            row = {'name': name, 'revision': sha}
            try:
                snapshot(source / name, layout / name, sha, name, args.allow_fetch)
                row['status'] = 'PASSED'
            except Blocked:
                row.update(status='BLOCKED', reason=name + ': locked revision unavailable')
                blocked[name] = row['reason']
            manifest['dependencies'].append(row)
        tools, missing, bash, node = capture_tools(env)
        if node:
            env['SYNKRO_NODE'] = node
        if bash:
            env['SYNKRO_BASH'] = bash
        manifest['tools'] = tools
        blocked.update({name: 'Required local tool unavailable: ' + name for name in missing})
        if 'docker' not in missing:
            before = inventory(env)
        execution = run.name.removeprefix('run-')
        with (run / '.execution-ids').open('a', encoding='utf-8') as output:
            output.write(execution + '\n')
        plan = suites(layout, bash, node, execution)
        # A missing dependency cannot disappear from full protection requirements.
        plan[3]['requires'] = ['python', *[entry['name'] for entry in entries]]
        absent = missing_deliveries(layout)
        if absent:
            blocked['full-deliveries'] = 'Mandatory owner deliveries absent: ' + ', '.join(absent)
        # Missing root prerequisite files are a known incomplete-delivery outcome.
        results = run_suites(plan, blocked, env, 3600, interrupted)
        prerequisite = next(row for row in results if row['name'] == 'full-prerequisites')
        manifest['missing_deliveries'] = absent
        diagnostic_files = list((run / '.tmp').glob('diagnostic-full-prerequisites-*.raw'))
        diagnostics = diagnostic_files[0].read_text(encoding='utf-8', errors='replace').splitlines() if len(diagnostic_files) == 1 else []
        # Only the exact existing gate's known missing-owner messages classify as
        # incomplete. Any other failure stays FAILED; raw text is never evidence.
        classify_prerequisites(prerequisite, absent, diagnostics)
        manifest['suites'] = results
        code = aggregate(results, args.scope)
    except KeyboardInterrupt:
        interrupted.append(True)
    except (Invalid, Blocked, OSError, subprocess.SubprocessError, ValueError):
        manifest['suites'].append({'name': 'preparation', 'status': 'FAILED', 'exit_code': None,
                                   'reason': 'Safe preparation failed; raw diagnostics suppressed'})
    finally:
        try:
            manifest['resource_execution_ids'] = sorted(recorded_owners(run))
            resources = verify_resources(before, env, run) if before is not None else {'status': 'NOT RUN', 'reason': 'Docker unavailable; no suite resource audit possible'}
            clean_snapshots(run)
            manifest['cleanup'] = {'status': resources['status'], 'reason': resources['reason'], 'snapshots_removed': True}
            manifest['cleanup']['fallback_resources_removed'] = resources.get('fallback_resources_removed', 0)
            if before is not None and resources['status'] != 'PASSED':
                code = 1
        except (Invalid, OSError, subprocess.SubprocessError, ValueError):
            manifest['cleanup'] = {'status': 'FAILED', 'reason': 'Ownership/resource audit failed; cleanup not certified'}
            code = 1
        if interrupted:
            code = 130
        manifest['finished_at'] = now()
        manifest['exit_code'] = code
        ready = capability_ready(manifest['suites'], manifest['cleanup'], interrupted)
        manifest['capability_ready_for_review'] = ready
        manifest['full_platform_accepted'] = code == 0
        manifest['acceptance_status'] = 'LOCAL VALIDATION READY FOR REVIEW — full HU acceptance pending owner deliveries and validation-policy review' if ready else 'NOT READY — blockers listed'
        write_evidence(run, manifest)
    print('Evidence: ' + str(run))
    print(manifest['acceptance_status'])
    return code


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (Invalid, Blocked):
        print('Local validation configuration rejected; no raw diagnostics published', file=sys.stderr)
        sys.exit(1)
