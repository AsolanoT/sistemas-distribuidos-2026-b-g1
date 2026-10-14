"""Compare Git blobs with recorded baselines; do not normalize protected files."""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def verify(primary_only=False):
    entries = json.loads((ROOT / 'protected-files.lock.json').read_text())
    for entry in entries:
        if primary_only and entry['repository'] != ROOT.name:
            continue
        repository = ROOT.parent / entry['repository']
        result = subprocess.run(['git', '-C', str(repository), 'rev-parse', 'HEAD:' + entry['path']],
                                capture_output=True, text=True, check=True)
        if result.stdout.strip() != entry['blob']:
            raise RuntimeError('Protected Git blob changed: ' + entry['repository'] + '/' + entry['path'])
        subprocess.run(['git', '-C', str(repository), 'diff', '--quiet', 'HEAD', '--', entry['path']], check=True)
    print('PASS protected CODEOWNERS and historical migration blobs match recorded baselines')


if __name__ == '__main__':
    try:
        verify('--primary-only' in sys.argv[1:])
    except (RuntimeError, subprocess.SubprocessError, OSError):
        print('Protected-file verification failed; no push authorized by this check', file=sys.stderr)
        sys.exit(1)
