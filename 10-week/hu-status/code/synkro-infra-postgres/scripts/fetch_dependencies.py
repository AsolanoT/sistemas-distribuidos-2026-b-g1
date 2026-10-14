"""Fetch immutable dependency snapshots; refuse to change an existing checkout."""
import json
import os
import re
import shutil
import stat
import subprocess
import sys
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def git(repository, operation, *arguments):
    # Git for Windows otherwise misreads deep owner sources in staging layouts.
    # This applies only to this invocation and never edits global/user config.
    options = ['-c', 'core.longpaths=true'] if os.name == 'nt' else []
    command = ['git'] + options + (['-C', str(repository)] if repository else []) + list(arguments)
    environment = dict(os.environ, GIT_TERMINAL_PROMPT='0')
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True,
                                timeout=180, env=environment)
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        category = 'timeout'
    except subprocess.CalledProcessError as error:
        diagnostic = error.stderr or ''
        if isinstance(diagnostic, bytes):
            diagnostic = diagnostic.decode(errors='replace')
        diagnostic = diagnostic.lower()
        if any(value in diagnostic for value in ('authentication', 'could not read username', 'repository not found', 'permission denied (publickey)', 'access denied')):
            category = 'access denied or repository unavailable'
        elif any(value in diagnostic for value in ('not our ref', 'couldn\'t find remote ref', 'unadvertised object')):
            category = 'revision unavailable'
        elif any(value in diagnostic for value in ('resolve host', 'getaddrinfo', 'connection', 'timed out', 'network')):
            category = 'network failure'
        else:
            category = 'Git failure'
    except OSError:
        category = 'Git unavailable or filesystem failure'
    # Never publish raw stderr, URLs, commands, environment values or exception text.
    raise RuntimeError(f'{CURRENT_REPOSITORY}: {operation}: {category}; required integration cannot pass') from None


def verified(repository, revision):
    head = git(repository, 'verify HEAD', 'rev-parse', 'HEAD')
    dirty = git(repository, 'verify working tree', 'status', '--porcelain')
    if head != revision or dirty:
        raise RuntimeError(f'{CURRENT_REPOSITORY}: verify: existing dependency differs from the snapshot; refusing overwrite')


def remove_staging(stage, workspace, owner):
    expected = workspace / ('.synkro-fetch-' + owner)
    marker = stage / '.retrieval-owner'
    if stage != expected or stage.parent.resolve() != workspace.resolve() or stage.is_symlink() or marker.read_text() != owner:
        raise RuntimeError('Temporary retrieval cleanup ownership check failed')
    def writable(function, path, error):
        target = Path(path).resolve()
        if stage.resolve() not in target.parents:
            raise RuntimeError('Temporary retrieval cleanup escaped its staging directory')
        os.chmod(target, stat.S_IWRITE | stat.S_IREAD)
        function(path)
    shutil.rmtree(stage, onerror=writable)


def fetch():
    global CURRENT_REPOSITORY
    lock = json.loads((ROOT / 'dependencies.lock.json').read_text())
    workspace = ROOT.parent.resolve()
    names = set()
    for dependency in lock['repositories']:
        CURRENT_REPOSITORY = dependency['name']
        if not re.fullmatch(r'synkro-[a-z0-9-]+', CURRENT_REPOSITORY) or CURRENT_REPOSITORY in names:
            raise RuntimeError('Invalid or duplicate dependency name')
        names.add(CURRENT_REPOSITORY)
        destination = workspace / CURRENT_REPOSITORY
        revision = dependency['revision']
        if not re.fullmatch(r'[0-9a-f]{40}', revision):
            raise RuntimeError(f'{CURRENT_REPOSITORY}: invalid immutable revision')
        if destination.exists():
            verified(destination, revision)
        else:
            owner = uuid.uuid4().hex
            stage = workspace / ('.synkro-fetch-' + owner)
            stage.mkdir()
            (stage / '.retrieval-owner').write_text(owner)
            checkout = stage / CURRENT_REPOSITORY
            try:
                git(None, 'init', 'init', str(checkout))
                git(checkout, 'remote add', 'remote', 'add', 'origin', 'https://github.com/code-corhuila/' + CURRENT_REPOSITORY + '.git')
                git(checkout, 'fetch', 'fetch', '--depth', '1', 'origin', revision)
                git(checkout, 'checkout', 'checkout', '--detach', 'FETCH_HEAD')
                verified(checkout, revision)
                if destination.exists():
                    raise RuntimeError(f'{CURRENT_REPOSITORY}: publish: destination appeared; refusing overwrite')
                checkout.rename(destination)
            finally:
                remove_staging(stage, workspace, owner)
        print(dependency['name'] + ' ' + revision + ' (' + dependency['status'] + ')')


if __name__ == '__main__':
    try:
        fetch()
    except (RuntimeError, subprocess.SubprocessError) as error:
        print(str(error) if isinstance(error, RuntimeError) else 'Dependency retrieval failed; required integration cannot pass', file=sys.stderr)
        sys.exit(1)
