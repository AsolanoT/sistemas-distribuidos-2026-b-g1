import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from unittest.mock import MagicMock

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('operations', ROOT / 'scripts/operations.py')
ops = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ops)


class OperationsTest(unittest.TestCase):
    def test_explicit_environment(self):
        for value in ['', 'develop', '../main', 'production']:
            with self.assertRaises(ops.Failure):
                ops.Environment(value, 'postgres', ROOT)

    def test_environment_cannot_override_project(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'env').mkdir()
            (root / 'env/qa.env').write_text('COMPOSE_PROJECT_NAME=synkro-dev\n')
            with self.assertRaisesRegex(ops.Failure, 'COMPOSE_PROJECT_NAME'):
                ops.Environment('qa', 'postgres', root)

    def test_environment_cannot_activate_tooling_on_ordinary_startup(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'env').mkdir()
            (root / 'env/dev.env').write_text('COMPOSE_PROJECT_NAME=synkro-dev\nCOMPOSE_PROFILES=tooling\n')
            with self.assertRaises(ops.Failure):
                ops.Environment('dev', 'postgres', root)

    def test_env_is_data_never_shell_code(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'test.env'
            path.write_text('PASSWORD="a$()#;b"\nOTHER=literal\\value\n')
            self.assertEqual(ops.read_env(path)['PASSWORD'], 'a$()#;b')
            path.write_text('export X=value\n')
            with self.assertRaises(ops.Failure):
                ops.read_env(path)

    def test_shutdown_refuses_all_volume_flags(self):
        for env in ['dev', 'qa', 'main']:
            self.assertNotEqual(ops.main(['down', env, '--volumes']), 0)

    def test_identity_restricted_before_environment_load(self):
        for env in ['qa', 'main']:
            self.assertNotEqual(ops.main(['dev-identity', env]), 0)

    def test_failed_subprocess_does_not_disclose_output(self):
        with patch.object(ops.subprocess, 'run', return_value=ops.subprocess.CompletedProcess([], 17, 'secret-value', 'secret-value')):
            with self.assertRaises(ops.Failure) as result:
                ops.run(['docker', 'test'])
            self.assertNotIn('secret-value', str(result.exception))
            self.assertIn('17', str(result.exception))

    def test_lock_rejects_overlap(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'lock'
            with ops.lock(path):
                with self.assertRaisesRegex(ops.Failure, 'overlapping'):
                    with ops.lock(path):
                        pass
            self.assertFalse(path.exists())

    def test_backup_location_rejects_repository(self):
        with self.assertRaises(ops.Failure):
            ops.backup_directory(ROOT / 'backups', ROOT.parent)

    def test_rendered_model_rejects_admin_on_api_and_published_db(self):
        for service in [{'ports': [{'published': '5432'}]}, {'environment': {'DB_ADMIN_PASSWORD': 'sentinel'}}]:
            with self.assertRaises(ops.Failure):
                ops.validate_model({'services': {'synkro-auth-api': service}}, 'synkro-dev')

    def test_failed_backup_prevents_qa_migration(self):
        environment = MagicMock()
        environment.project, environment.name, environment.mode = 'synkro-qa', 'qa', 'postgres-migrations'
        environment.values = {'BACKUP_DIRECTORY': '/outside/workspace'}
        with tempfile.TemporaryDirectory() as folder:
            with patch.object(ops, 'Environment', return_value=environment), patch.object(ops, 'history_guard'), patch.object(ops, 'backup', side_effect=ops.Failure('backup failed')), patch.object(ops.Path, 'home', return_value=Path(folder)):
                self.assertEqual(ops.main(['migrate', 'qa', '--domain', 'auth', '--mode', 'postgres-migrations']), 1)
                environment.compose.assert_not_called()
                ops.backup.assert_called_once()

    def test_failed_mongo_backup_prevents_main_sales_migration(self):
        environment = MagicMock()
        environment.project, environment.name, environment.mode = 'synkro-main', 'main', 'mongo-migrations'
        environment.values = {'BACKUP_DIRECTORY': '/outside/workspace'}
        with tempfile.TemporaryDirectory() as folder:
            with patch.object(ops, 'Environment', return_value=environment), patch.object(ops, 'mongo_backup', side_effect=ops.Failure('backup failed')), patch.object(ops.Path, 'home', return_value=Path(folder)):
                self.assertEqual(ops.main(['migrate', 'main', '--domain', 'sales', '--mode', 'mongo-migrations']), 1)
                environment.compose.assert_not_called()
                ops.mongo_backup.assert_called_once()

    def test_unhealthy_engine_has_bounded_wait(self):
        environment = ops.Environment.__new__(ops.Environment)
        environment.compose = MagicMock(return_value='[]')
        with patch.object(ops.time, 'monotonic', side_effect=[0, 1]):
            with self.assertRaisesRegex(ops.Failure, 'timed out'):
                environment.ready(seconds=1)

    def test_cleanup_refuses_unrelated_resource_before_docker(self):
        import sys
        sys.path.insert(0, str(ROOT / 'scripts'))
        from restore import cleanup
        with self.assertRaises(Exception) as result:
            cleanup('preexisting-container', 'preexisting-volume', 'owner')
        self.assertIn('unrelated', str(result.exception))

    def test_database_only_mongo_mode_is_explicit(self):
        self.assertEqual(ops.MODES['mongo-migrations'], 'compose.mongo-migrations.yml')

    def test_missing_and_exposed_protected_files_fail(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaises(ops.Failure):
                ops.protected_file(Path(folder) / 'missing', 'SECRET_PATH')
            path = Path(folder) / 'exposed'
            path.write_text('disposable-sentinel')
            if ops.os.name == 'nt':
                ops.protect_created(path)
                ops.run(['icacls.exe', str(path), '/grant', '*S-1-1-0:R'])
            else:
                ops.os.chmod(path, 0o644)
            with self.assertRaises(ops.Failure):
                ops.protected_file(path, 'SECRET_PATH')

    def test_administrator_uri_on_api_is_rejected(self):
        with self.assertRaises(ops.Failure):
            ops.validate_model({'services': {'synkro-products-api': {'environment': {'DATABASE_URL': 'postgresql://postgres:sentinel@synkro-db/synkro'}}}}, 'synkro-dev', {'DB_ADMIN_USER': 'postgres'})

    def test_bootstrap_waits_for_server_before_missing_users_are_created(self):
        environment = MagicMock()
        with patch.object(ops, 'Environment', return_value=environment):
            self.assertEqual(ops.main(['bootstrap', 'dev', '--mode', 'postgres']), 0)
            environment.server_ready.assert_called_once()
            environment.ready.assert_called_once()
            names = [call[0] for call in environment.method_calls]
            self.assertLess(names.index('server_ready'), names.index('compose'))
            self.assertLess(names.index('compose'), names.index('ready'))

    def test_mongo_restore_delegates_to_published_sales_recovery(self):
        with tempfile.TemporaryDirectory() as folder:
            folder = Path(folder)
            (folder / 'complete.json').write_text(json.dumps({'project': 'synkro-dev', 'engine': 'mongo', 'format': 1}))
            target = folder / 'restore.env'
            target.write_text('COMPOSE_PROJECT_NAME=synkro-infra-test-regression-restore\nMONGO_DISPOSABLE=true\nMONGO_TEST_RUN=regression\n')
            manifest = folder / 'manifest.json'
            manifest.write_text('[]')
            with patch.object(ops, 'protected_file'), patch.object(ops, 'run', return_value='') as command:
                self.assertEqual(ops.main(['restore', 'dev', '--engine', 'mongo', '--backup', str(folder),
                                          '--target-env-file', str(target), '--manifest', str(manifest)]), 0)
                invoked = command.call_args.args[0]
                self.assertIn('restore-sales-disposable', invoked)
                self.assertIn('--manifest', invoked)
                self.assertIn('--sales-checkout', invoked)
                self.assertNotIn('restore-disposable', invoked)


if __name__ == '__main__':
    unittest.main()
