"""Execute shipped runtime tests and the owning non-skipped Go/HTTP integration gate."""
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def execute():
    node = os.environ.get('SYNKRO_NODE', 'node')
    subprocess.run([node, str(ROOT / 'tests/sales_runtime.mjs')], check=True, timeout=1200)
    shell = 'C:/Program Files/Git/bin/bash.exe' if os.name == 'nt' else 'bash'
    api = ROOT.parent / 'synkro-sales-api'
    db = ROOT.parent / 'synkro-sales-db'
    # The owning launcher verifies the exact immutable DB revision, disposable
    # consent, real executed HTTP scenarios, race detector and all coverage gates.
    subprocess.run([shell, (api / 'deploy/ci/mongo-integration.sh').as_posix(), db.as_posix()], cwd=api, check=True, timeout=1800)


if __name__ == '__main__':
    try:
        execute()
    except (subprocess.SubprocessError, OSError):
        print('FAIL required Sales runtime/owner integration; skipped tests are not passing evidence', file=sys.stderr)
        sys.exit(1)
