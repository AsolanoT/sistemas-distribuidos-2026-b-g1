"""Root dispatch and layout contract for approved domain deliveries."""
import importlib.util
import unittest
import tempfile
import json
from pathlib import Path
from unittest.mock import MagicMock, patch
import yaml
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('operations',ROOT/'scripts/operations.py')
ops=importlib.util.module_from_spec(spec);spec.loader.exec_module(ops)
class ApprovedDomainDeliveryTest(unittest.TestCase):
    def test_both_approved_owners_are_in_partial_composition(self):
        includes=yaml.safe_load((ROOT/'compose.pg-migrations.yml').read_text())['include']
        for path in ['../synkro-customers-db/deploy/compose.yml','../synkro-workflow/deploy/compose.yml']:
            self.assertIn(path,includes)
    def test_explicit_customers_and_workflow_dispatch_uses_real_runner(self):
        for domain in ['customers','workflow']:
            env=MagicMock();env.mode='postgres-migrations';env.name='dev';env.project='synkro-test-dispatch'
            with patch.object(ops,'Environment',return_value=env),patch.object(ops,'history_guard'),patch.object(ops,'lock'):
                self.assertEqual(ops.main(['migrate','dev','--domain',domain,'--mode','postgres-migrations']),0)
            env.compose.assert_called_once_with('--profile','tooling','run','--rm','--no-deps',domain+'-db-migrate',timeout=300)
    def test_local_plan_requires_all_new_postgres_owners(self):
        spec=importlib.util.spec_from_file_location('verify_local',ROOT/'scripts/verify_local.py')
        local=importlib.util.module_from_spec(spec);spec.loader.exec_module(local)
        with tempfile.TemporaryDirectory() as folder:
            plan=local.suites(Path(folder),'bash','node')
        pg=next(s for s in plan if s['name']=='postgres-integration')
        self.assertIn('synkro-customers-db',pg['requires'])
        self.assertIn('synkro-workflow',pg['requires'])
    def test_auth_fixture_does_not_require_workflow_service_credentials(self):
        spec=importlib.util.spec_from_file_location('auth_initialization',ROOT/'tests/auth_initialization.py')
        auth=importlib.util.module_from_spec(spec);spec.loader.exec_module(auth)
        with tempfile.TemporaryDirectory() as folder:
            model=json.loads(auth.composition_file(Path(folder)).read_text())
        self.assertEqual(model['include'],[str(ROOT/'compose.postgres.yml'),str(ROOT.parent/'synkro-auth-db/deploy/compose.yml')])
    def test_partial_postgres_up_does_not_start_workflow_before_migrations(self):
        env=MagicMock();env.mode='postgres-migrations';env.name='dev';env.project='synkro-dev'
        with patch.object(ops,'Environment',return_value=env),patch.object(ops.subprocess,'run',return_value=MagicMock(returncode=0)):
            self.assertEqual(ops.main(['up','dev','--mode','postgres-migrations']),0)
        env.compose.assert_called_once_with('up','-d','--build','--wait','--wait-timeout','180','synkro-db',timeout=900)
if __name__=='__main__':unittest.main()
