"""Local isolation regressions: real Git objects, dirty sources and safe outcomes."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('verify_local', ROOT / 'scripts/verify_local.py')
local = importlib.util.module_from_spec(spec)
spec.loader.exec_module(local)


class LocalVerificationTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='synkro-local-test-')
        self.base = Path(self.temp.name)
        self.source = self.base / 'sources'
        self.source.mkdir()
        self.repo = self.source / 'synkro-fixture'
        self.git('init', str(self.repo))
        self.git('-C', str(self.repo), 'config', 'user.name', 'Disposable fixture')
        self.git('-C', str(self.repo), 'config', 'user.email', 'fixture@synkro.test')
        (self.repo / 'delivery').write_text('locked\n')
        self.git('-C', str(self.repo), 'add', '.')
        self.git('-C', str(self.repo), 'commit', '-m', 'locked')
        self.sha = self.git('-C', str(self.repo), 'rev-parse', 'HEAD')
        (self.repo / 'delivery').write_text('newer\n')
        self.git('-C', str(self.repo), 'commit', '-am', 'newer')
        self.tip = self.git('-C', str(self.repo), 'rev-parse', 'HEAD')
        self.dest = self.base / 'execution' / 'synkro-fixture'

    def tearDown(self):
        # Git independent copies contain read-only pack files on Windows.
        local.remove_tree(self.base)
        self.temp.cleanup()

    @staticmethod
    def git(*args):
        return subprocess.run(['git', *args], check=True, capture_output=True, text=True).stdout.strip()

    def test_locked_object_not_active_branch_tip(self):
        local.snapshot(self.repo, self.dest, self.sha, 'synkro-fixture')
        self.assertEqual(self.git('-C', str(self.dest), 'rev-parse', 'HEAD'), self.sha)
        self.assertEqual((self.dest / 'delivery').read_text(), 'locked\n')
        self.assertFalse((self.dest / '.git/objects/info/alternates').exists())
        self.assertEqual(self.git('-C', str(self.repo), 'rev-parse', 'HEAD'), self.tip)

    def test_dirty_source_and_sentinel_excluded_and_untouched(self):
        secret = 'sentinel-credential-do-not-publish'
        (self.repo / 'delivery').write_text('user changes')
        (self.repo / 'secret.env').write_text(secret)
        before = self.git('-C', str(self.repo), 'status', '--porcelain')
        local.snapshot(self.repo, self.dest, self.sha, 'synkro-fixture')
        self.assertEqual((self.dest / 'delivery').read_text(), 'locked\n')
        self.assertFalse((self.dest / 'secret.env').exists())
        self.assertEqual((self.repo / 'secret.env').read_text(), secret)
        self.assertEqual(self.git('-C', str(self.repo), 'status', '--porcelain'), before)

    def test_missing_revision_has_safe_block_and_no_partial_snapshot(self):
        with self.assertRaisesRegex(local.Blocked, 'synkro-fixture.*revision unavailable'):
            local.snapshot(self.repo, self.dest, '1' * 40, 'synkro-fixture')
        self.assertFalse(self.dest.exists())

    def test_invalid_duplicate_names_and_malformed_sha(self):
        good = {'name': 'synkro-fixture', 'revision': self.sha}
        for entries in ([good, good], [{'name': '../escape', 'revision': self.sha}],
                        [{'name': 'synkro-fixture', 'revision': 'develop'}],
                        [{'name': 'synkro-infra-postgres', 'revision': self.sha}]):
            with self.subTest(entries=entries), self.assertRaises(local.Invalid):
                local.validate_lock({'repositories': entries})

    def test_path_collision_refused_before_git_changes(self):
        for dest in (self.repo, self.repo / 'nested', self.source.parent):
            with self.subTest(dest=dest), self.assertRaises(local.Invalid):
                local.snapshot(self.repo, dest, self.sha, 'synkro-fixture')
        self.assertEqual(self.git('-C', str(self.repo), 'rev-parse', 'HEAD'), self.tip)

    def test_existing_unrelated_execution_not_overwritten(self):
        self.dest.mkdir(parents=True)
        (self.dest / 'unrelated').write_text('preserve')
        with self.assertRaises(local.Invalid):
            local.snapshot(self.repo, self.dest, self.sha, 'synkro-fixture')
        self.assertEqual((self.dest / 'unrelated').read_text(), 'preserve')

    def test_existing_staging_directory_never_reinitialized_or_deleted(self):
        from types import SimpleNamespace
        stage = self.dest.parent / '.stage-fixed'
        stage.mkdir(parents=True)
        marker = stage / 'unrelated'
        marker.write_text('preserve unrelated staging')
        with patch.object(local.uuid, 'uuid4', return_value=SimpleNamespace(hex='fixed')):
            with self.assertRaises((local.Invalid, FileExistsError)):
                local.snapshot(self.repo, self.dest, self.sha, 'synkro-fixture')
        self.assertEqual(marker.read_text(), 'preserve unrelated staging')

    def test_interrupted_preparation_retry_without_partial_destination(self):
        real_git = local.git
        def interrupted(repo, *args):
            if args and args[0] == 'fetch':
                raise KeyboardInterrupt()
            return real_git(repo, *args)
        with patch.object(local, 'git', side_effect=interrupted), self.assertRaises(KeyboardInterrupt):
            local.snapshot(self.repo, self.dest, self.sha, 'synkro-fixture')
        self.assertFalse(self.dest.exists())
        self.assertFalse(list(self.dest.parent.glob('.stage-*')))
        local.snapshot(self.repo, self.dest, self.sha, 'synkro-fixture')

    def test_exact_snapshot_head_and_clean_state_required(self):
        local.snapshot(self.repo, self.dest, self.sha, 'synkro-fixture')
        with self.assertRaises(local.Invalid):
            local.verify_snapshot(self.dest, self.tip)
        (self.dest / 'untracked').write_text('not exact')
        with self.assertRaises(local.Invalid):
            local.verify_snapshot(self.dest, self.sha)

    def test_missing_full_delivery_is_blocked_not_passed(self):
        results = [{'status': 'PASSED'}, {'status': 'BLOCKED', 'name': 'full-prerequisites'}]
        self.assertEqual(local.aggregate(results, 'full'), 2)
        self.assertEqual(local.aggregate(results, 'available'), 2)

    def test_independent_suite_runs_after_blocked_delivery(self):
        plan = [{'name': 'missing', 'cwd': self.base, 'command': [sys.executable, '-c', 'pass'], 'requires': ['absent']},
                {'name': 'delivered', 'cwd': self.base, 'command': [sys.executable, '-c', 'pass'], 'requires': []}]
        results = local.run_suites(plan, {'absent': 'owner delivery missing'}, {}, 10)
        self.assertEqual([r['status'] for r in results], ['BLOCKED', 'PASSED'])

    def test_failure_is_failure_and_raw_credentials_not_evidence(self):
        sentinel = 'sentinel-token-never-in-evidence'
        plan = [{'name': 'failure', 'cwd': self.base, 'command': [sys.executable, '-c', f'print({sentinel!r}); raise SystemExit(7)'], 'requires': []}]
        results = local.run_suites(plan, {}, {}, 10)
        self.assertEqual(results[0]['exit_code'], 7)
        self.assertEqual(results[0]['status'], 'FAILED')
        self.assertEqual(local.aggregate(results, 'available'), 1)
        self.assertNotIn(sentinel, json.dumps(results))

    def test_cleanup_refuses_other_run_or_persistent_resource(self):
        record = {'kind': 'network', 'name': 'synkro-test-own-network', 'id': 'a' * 64,
                  'labels': {'synkro.execution': 'owned', 'synkro.disposable': 'true'}}
        with self.assertRaises(local.Invalid):
            local.assert_resource_owned(record, {'someone-else'})
        record['labels']['synkro.disposable'] = 'false'
        with self.assertRaises(local.Invalid):
            local.assert_resource_owned(record, {'owned'})

    def test_cleanup_refuses_unrelated_directory_marker(self):
        run = local.create_run(self.base / 'runs')
        (run / '.local-owner').write_text('not-this-run')
        with self.assertRaises(local.Invalid):
            local.clean_snapshots(run)

    def test_no_actions_secret_in_local_child_environment(self):
        with patch.dict(os.environ, {'SYNKRO_DEPENDENCY_READ_TOKEN': 'sentinel-action-secret', 'GITHUB_TOKEN': 'sentinel-github', 'COMPOSE_FILE': 'persistent.yml'}):
            env = local.child_environment(self.base)
        self.assertNotIn('SYNKRO_DEPENDENCY_READ_TOKEN', env)
        self.assertNotIn('GITHUB_TOKEN', env)
        self.assertNotIn('COMPOSE_FILE', env)

    def test_timeout_remains_failed_and_diagnostics_suppressed(self):
        plan = [{'name': 'bounded', 'cwd': self.base, 'command': [sys.executable, '-c', 'import time; time.sleep(30)'],
                 'requires': [], 'timeout': 0.1}]
        result = local.run_suites(plan, {}, {}, 1)[0]
        self.assertEqual(result['status'], 'FAILED')
        self.assertIn('timeout', result['reason'])

    def test_cleanup_positive_ownership_and_existing_resources_not_removed(self):
        record = {'kind': 'network', 'name': 'synkro-test-owned-network', 'id': 'a' * 64,
                  'labels': {'synkro.execution': 'own', 'synkro.disposable': 'true'}}
        local.assert_resource_owned(record, {'own'})
        with patch.object(local, 'inventory', return_value={('network', record['name']): record}), \
                patch.object(local.subprocess, 'run') as operation:
            result = local.verify_resources({('network', record['name']): record}, {})
        self.assertEqual(result['status'], 'PASSED')
        operation.assert_not_called()

    def test_unknown_new_resource_refused_before_any_destruction(self):
        record = {'kind': 'network', 'name': 'synkro-unrelated', 'id': 'a' * 64, 'labels': {}}
        with patch.object(local, 'inventory', return_value={('network', record['name']): record}), \
                patch.object(local.subprocess, 'run') as operation:
            with self.assertRaises(local.Invalid):
                local.verify_resources({}, {})
        operation.assert_not_called()


class WorkflowSeparationTest(unittest.TestCase):
    def test_complete_acceptance_executes_real_root_and_locked_browser_suites(self):
        plan = {row['name']: row for row in local.suites(ROOT.parent, 'bash', 'node')}
        self.assertEqual(plan['full-platform-acceptance']['command'][-1], 'tests/full_composition.py')
        self.assertEqual(plan['customers-real-browser']['command'][-1], 'tests/customers_browser.py')
        self.assertIn('synkro-customers-portal', plan['portal-delivery']['requires'])
        for name in ('full-platform-acceptance', 'customers-real-browser'):
            self.assertIn('synkro-front', plan[name]['requires'])
            self.assertIn('synkro-customers-portal', plan[name]['requires'])
            self.assertIn('docker', plan[name]['requires'])

    @unittest.skipUnless(os.name == 'nt', 'Windows deep snapshot cleanup')
    def test_owned_deep_snapshot_cleanup_keeps_native_git_paths_separate(self):
        import shutil
        folder = tempfile.mkdtemp(prefix='synkro-cleanup-test-')
        extended = Path('\\\\?\\' + folder)
        try:
            deep = extended / ('a' * 90) / ('b' * 90) / ('c' * 90)
            deep.mkdir(parents=True)
            (deep / 'owned').write_text('disposable snapshot')
            local.remove_tree(Path(folder))
            self.assertFalse(Path(folder).exists())
        finally:
            if extended.exists():
                shutil.rmtree(extended)

    def test_unexpected_prerequisite_failure_cannot_label_capability_ready(self):
        rows = [{'name': 'unit-git-regressions', 'status': 'PASSED'},
                {'name': 'full-prerequisites', 'status': 'FAILED'}]
        self.assertFalse(local.capability_ready(rows, {'status': 'PASSED'}, []))
        rows[1]['status'] = 'BLOCKED'
        self.assertTrue(local.capability_ready(rows, {'status': 'PASSED'}, []))

    def test_nested_python_and_model_dependencies_are_checked_before_mutation(self):
        plan = local.suites(ROOT.parent, 'bash', 'node')
        for name in ('mongo-sales', 'observability', 'portal-delivery'):
            suite = next(row for row in plan if row['name'] == name)
            self.assertIn('python-test-dependencies', suite['requires'], name)
            self.assertIn('python', suite['requires'], name)

    def test_python_tool_gate_applies_to_every_python_suite(self):
        plan = local.suites(ROOT.parent, 'bash', 'node')
        for suite in plan:
            if suite['command'][0] == sys.executable:
                self.assertIn('python', suite['requires'], suite['name'])

    def test_nested_node_restore_uses_the_verified_python_runtime(self):
        with patch.dict(os.environ, {'PYTHON': 'unapproved-launcher'}):
            env = local.child_environment(tempfile.gettempdir())
        self.assertEqual(env['PYTHON'], sys.executable)

    def test_missing_owners_never_hide_another_prerequisite_failure(self):
        row = {'name': 'full-prerequisites', 'status': 'FAILED', 'exit_code': 1}
        absent = ['synkro-customers-db']
        local.classify_prerequisites(row, absent, ['Missing required composition: synkro-customers-db',
                                                'Sales runner credential protection pending; no bypass permitted'])
        self.assertEqual(row['status'], 'FAILED')
        local.classify_prerequisites(row, absent, ['Missing required composition: synkro-customers-db'])
        self.assertEqual(row['status'], 'BLOCKED')

    def test_shellcheck_container_has_explicit_execution_ownership(self):
        plan = local.suites(ROOT.parent, 'bash', 'node', 'a' * 32)
        command = next(row['command'] for row in plan if row['name'] == 'shellcheck')
        self.assertIn('synkro.execution=' + 'a' * 32, command)
        self.assertIn('synkro-shellcheck-' + 'a' * 32, command)

    def test_private_diagnostics_are_owned_and_not_evidence(self):
        with tempfile.TemporaryDirectory() as folder:
            run = Path(folder)
            (run / '.local-owner').write_text(run.name)
            (run / '.tmp').mkdir()
            env = local.child_environment(run / '.tmp')
            env['SYNKRO_LOCAL_OWNER_FILE'] = str(run / '.execution-ids')
            suite = {'name': 'fixture', 'cwd': run, 'command':
                     [sys.executable, '-c', "print('sentinel-private-credential'); raise SystemExit(3)"]}
            rows = local.run_suites([suite], {}, env, 10)
            self.assertEqual(rows[0]['status'], 'FAILED')
            self.assertNotIn('sentinel-private-credential', json.dumps(rows))
            self.assertTrue(list((run / '.tmp').glob('diagnostic-*.raw')))
            local.clean_snapshots(run)
            self.assertFalse((run / '.tmp').exists())

    @unittest.skipUnless(os.name == 'nt', 'Windows extended temporary paths')
    def test_python_child_can_create_deep_fixture_without_global_settings(self):
        with tempfile.TemporaryDirectory() as folder:
            run = Path(folder)
            (run / '.local-owner').write_text(run.name)
            tmp = local.create_fixture_tmp(run)
            env = local.child_environment(tmp)
            self.assertFalse(env['TEMP'].startswith('\\\\?\\'), 'Git fixture paths must stay native')
            command = [sys.executable, '-c',
                       "import tempfile,subprocess; from pathlib import Path; "
                       "p=Path(tempfile.gettempdir())/'fixture'/'source'/'owner'/('domain-'+ 'a'*30)/('adapter-'+ 'b'*30)/('persistence-'+ 'c'*30); "
                       "p.mkdir(parents=True); (p/'DeepOwnerContract.java').write_text('owned'); "
                       "subprocess.run(['git','init',str(p)],check=True,capture_output=True)"]
            try:
                result = subprocess.run(command, env=env, capture_output=True)
                self.assertEqual(result.returncode, 0, 'Deep isolated Python fixture must be supported')
            finally:
                local.clean_snapshots(run)
            self.assertFalse(tmp.exists())

    def test_external_fixture_cleanup_requires_ownership(self):
        with tempfile.TemporaryDirectory() as folder:
            run = Path(folder)
            (run / '.local-owner').write_text(run.name)
            tmp = local.create_fixture_tmp(run)
            (tmp / '.fixture-owner').write_text('unrelated')
            with self.assertRaises(local.Invalid):
                local.clean_snapshots(run)
            self.assertTrue(tmp.exists())
            (tmp / '.fixture-owner').write_text(run.name)
            local.clean_snapshots(run)

    def test_automatic_is_root_only_and_private_dispatch_is_explicit(self):
        automatic = (ROOT / '.github/workflows/ci.yml').read_text()
        self.assertNotIn('SYNKRO_DEPENDENCY_READ_TOKEN', automatic)
        self.assertIn('python -m unittest discover', automatic)
        self.assertIn('--primary-only', automatic)
        private = (ROOT / '.github/workflows/private-integration.yml').read_text()
        self.assertIn('workflow_dispatch:', private)
        self.assertNotIn('continue-on-error', private)
        self.assertIn('Private dependency read access is required', private)
        for suite in ('tests/integration.py', 'tests/portal_delivery.py', 'tests/dependencies.py'):
            self.assertIn(suite, private)


if __name__ == '__main__':
    unittest.main()
