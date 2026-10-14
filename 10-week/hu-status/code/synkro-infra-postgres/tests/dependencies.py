"""Full-composition prerequisite gate. Missing delivery always returns nonzero."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = ['infra-mongo', 'auth-db', 'products-db', 'customers-db', 'sales-db', 'auth-api',
            'customers-api', 'products-api', 'sales-api', 'workflow', 'worker', 'api-gateway',
            'front', 'auth-portal', 'customers-portal', 'products-portal', 'sales-portal']


def verify():
    failures = []
    for name in EXPECTED:
        repo = ROOT.parent / ('synkro-' + name)
        file = repo / ('compose.yml' if name == 'infra-mongo' else 'deploy/compose.yml')
        if not file.is_file():
            failures.append('Missing required composition: synkro-' + name)
    workflow = ROOT.parent / 'synkro-workflow/deploy/compose.yml'
    if workflow.is_file() and 'workflow-db-migrate:' not in workflow.read_text():
        failures.append('Missing Workflow migration runner and approved migrations')
    sales = ROOT.parent / 'synkro-sales-db/deploy/migrate.sh'
    if not sales.is_file() or 'mongosh "$LIQUIBASE_COMMAND_URL"' in sales.read_text():
        failures.append('Sales runner credential protection pending; no bypass permitted')
    for failure in failures:
        print(failure, file=sys.stderr)
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(verify())
