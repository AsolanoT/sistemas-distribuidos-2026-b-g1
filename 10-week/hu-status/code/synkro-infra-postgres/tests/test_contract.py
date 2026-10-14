import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ContractTest(unittest.TestCase):
    def test_postgres_contract(self):
        text = (ROOT / 'compose.postgres.yml').read_text()
        for expected in ['synkro-db:', 'postgres:16.15-alpine3.23', 'external: true', 'read_only: true', 'healthcheck:', 'postgres-data:', 'POSTGRES_PASSWORD_FILE']:
            self.assertIn(expected, text)
        for forbidden in ['container_name:', 'ports:', 'pgcrypto']:
            self.assertNotIn(forbidden, text)

    def test_bootstrap_data_parameterization(self):
        text = (ROOT / 'postgres/init/01-instance.sh').read_text()
        for expected in ['ON_ERROR_STOP', '\\getenv', 'format(', 'BEGIN;', 'COMMIT;', 'NOSUPERUSER NOCREATEDB NOCREATEROLE', 'pg_roles']:
            self.assertIn(expected, text)
        self.assertNotIn('CREATE SCHEMA', text)
        self.assertNotIn('CREATE EXTENSION', text)

    def test_full_composition_requires_every_owner(self):
        text = (ROOT / 'compose.yml').read_text()
        for repo in ['infra-mongo', 'auth-db', 'customers-db', 'products-db', 'sales-db', 'auth-api', 'customers-api', 'products-api', 'sales-api', 'workflow', 'worker', 'api-gateway', 'front', 'auth-portal', 'customers-portal', 'products-portal', 'sales-portal']:
            self.assertIn('synkro-' + repo, text)

    def test_environment_project_names(self):
        for env in ['dev', 'qa', 'main']:
            text = (ROOT / f'env/{env}.env.example').read_text()
            self.assertIn('COMPOSE_PROJECT_NAME=synkro-' + env, text)
            self.assertIn('AUTH_APP_PASSWORD_PATH=', text)
            self.assertIn('JWT_PRIVATE_KEY_PATH=', text)
            self.assertIn('VITE_DEV_SIGN_IN=false', text)


if __name__ == '__main__':
    unittest.main()
