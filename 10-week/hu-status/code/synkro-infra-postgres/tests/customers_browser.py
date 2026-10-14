"""Execute the owner's real browser acceptance against exact locked snapshots."""
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tests'))
from full_composition import owner_guard
sys.path.insert(0, str(ROOT / 'scripts'))
import verify_local as local


def execute():
    run = owner_guard(ROOT)
    lock = json.loads((ROOT / 'dependencies.lock.json').read_text())
    pins = {e['name']: e['revision'] for e in lock['repositories']}
    names = ['synkro-customers-portal', 'synkro-front', 'synkro-customers-api', 'synkro-auth-api',
             'synkro-auth-db', 'synkro-customers-db', 'synkro-auth-portal', 'synkro-api-gateway',
             'synkro-sales-portal', 'synkro-products-portal']
    for name in names: local.verify_snapshot(ROOT.parent / name, pins[name])
    customers = ROOT.parent / 'synkro-customers-portal'
    source = (customers / 'scripts/acceptance.mjs').read_text()
    anchor = "ref=['synkro-customers-portal','synkro-front'].includes(name)?'HEAD':'origin/develop'"
    if source.count(anchor) != 1: raise RuntimeError('Owning acceptance anchor drift; no substitution')
    source = source.replace(anchor, "ref='HEAD'", 1)
    private = customers / '.acceptance'
    private.mkdir(exist_ok=True); os.chmod(private, 0o700)
    generated = private / 'infra-acceptance.mjs'
    generated.write_text(source)
    os.chmod(generated, 0o600)
    subprocess.run(['npm', 'ci'], cwd=customers, check=True, timeout=600)
    result = subprocess.run([os.environ.get('SYNKRO_NODE', 'node'), str(generated)], cwd=customers, timeout=3600)
    evidence = json.loads((customers / 'evidence/browser-result.json').read_text())
    safe = {'root_sha': local.git(ROOT, 'rev-parse', 'HEAD'), 'revisions': evidence['revisions'],
            'imageIds': evidence['imageIds'], 'browserVersion': evidence.get('browserVersion'),
            'checks': evidence['checks'], 'status': evidence['status'], 'cleanup': evidence['cleanup'],
            'scope': evidence['scope']}
    if safe['revisions'] != {name: pins[name] for name in names}:
        raise RuntimeError('Browser suite executed an unexpected revision')
    (run / 'customers-browser-result.json').write_text(json.dumps(safe, indent=2))
    if result.returncode or safe['status'] != 'PASS' or safe['cleanup'] != 'PASS':
        raise RuntimeError('Owning real browser acceptance/cleanup failed; raw diagnostics suppressed')
    print('PASS locked actual browser/Customers/API/Auth/Gateway contract, role permissions, replay, outage and recovery')


if __name__ == '__main__': execute()
