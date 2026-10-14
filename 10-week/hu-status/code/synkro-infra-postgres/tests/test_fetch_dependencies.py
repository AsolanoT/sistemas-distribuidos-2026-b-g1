"""Exercise real immutable Git checkouts with injected transport failures."""
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('fetch_dependencies', ROOT / 'scripts/fetch_dependencies.py')
fetcher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fetcher)
REAL_RUN = subprocess.run


class DependencyRetrievalTest(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory(prefix='synkro-fetch-test-')
        self.base = Path(self.folder.name)
        self.root = self.base / 'layout/synkro-infra-postgres'
        self.root.mkdir(parents=True)
        self.source = self.base / 'source'
        self.git('init', str(self.source))
        self.git('-C', str(self.source), 'config', 'user.name', 'Disposable Test')
        self.git('-C', str(self.source), 'config', 'user.email', 'fixture@synkro.test')
        (self.source / 'delivery.txt').write_text('first immutable delivery\n')
        self.git('-C', str(self.source), 'add', '.')
        self.git('-C', str(self.source), 'commit', '-m', 'fixture one')
        self.sha = self.git('-C', str(self.source), 'rev-parse', 'HEAD').strip()
        (self.source / 'delivery.txt').write_text('newer branch tip\n')
        self.git('-C', str(self.source), 'commit', '-am', 'fixture two')
        (self.root / 'dependencies.lock.json').write_text(json.dumps({'repositories': [
            {'name': 'synkro-fixture', 'revision': self.sha, 'status': 'fixture'}]}))
        self.destination = self.root.parent / 'synkro-fixture'

    def tearDown(self):
        self.folder.cleanup()

    @staticmethod
    def git(*args):
        return REAL_RUN(['git', *args], check=True, capture_output=True, text=True).stdout

    def transport(self, args, **kwargs):
        if 'fetch' in args:
            args = list(args)
            args[args.index('origin')] = str(self.source)
        return REAL_RUN(args, **kwargs)

    def execute(self, transport=None):
        with patch.object(fetcher, 'ROOT', self.root), patch.object(fetcher.subprocess, 'run', side_effect=transport or self.transport):
            fetcher.fetch()

    def test_exact_revision_not_current_branch_tip_and_repeat_is_unchanged(self):
        self.execute()
        self.assertEqual(self.git('-C', str(self.destination), 'rev-parse', 'HEAD').strip(), self.sha)
        self.assertEqual((self.destination / 'delivery.txt').read_text(), 'first immutable delivery\n')
        self.execute()
        self.assertEqual(self.git('-C', str(self.destination), 'status', '--porcelain'), '')

    def test_deep_owner_paths_remain_clean_after_staged_checkout(self):
        # Auth's nested Java sources exceed MAX_PATH in an isolated Windows layout.
        # Configure only the source fixture; the fetcher's newly initialized stage
        # must handle its own long paths without changing global/user Git settings.
        self.git('-C', str(self.source), 'config', 'core.longpaths', 'true')
        relative = Path('owner') / ('domain-' + 'a' * 30) / ('adapter-' + 'b' * 30) / ('persistence-' + 'c' * 30) / 'DeepOwnerContract.java'
        file = self.source / relative
        file.parent.mkdir(parents=True)
        file.write_text('complete immutable owner source\n')
        self.git('-C', str(self.source), 'add', '.')
        self.git('-C', str(self.source), 'commit', '-m', 'deep owner fixture')
        revision = self.git('-C', str(self.source), 'rev-parse', 'HEAD').strip()
        (self.root / 'dependencies.lock.json').write_text(json.dumps({'repositories': [
            {'name': 'synkro-fixture', 'revision': revision, 'status': 'fixture'}]}))
        self.execute()
        self.assertEqual((self.destination / relative).read_text(), 'complete immutable owner source\n')
        self.assertEqual(self.git('-c', 'core.longpaths=true', '-C', str(self.destination), 'status', '--porcelain'), '')

    def test_interrupted_fetch_has_safe_retry_without_partial_destination(self):
        def interrupted(args, **kwargs):
            if 'fetch' in args:
                raise subprocess.TimeoutExpired(args, 180)
            return self.transport(args, **kwargs)
        with self.assertRaisesRegex(RuntimeError, r'synkro-fixture.*fetch.*timeout'):
            self.execute(interrupted)
        self.assertFalse(self.destination.exists())
        self.assertEqual(list(self.root.parent.glob('.synkro-fetch-*')), [])
        self.execute()
        self.assertEqual(self.git('-C', str(self.destination), 'rev-parse', 'HEAD').strip(), self.sha)

    def test_fetch_error_identifies_operation_and_classification_without_secrets(self):
        secret = 'token-sentinel-never-publish'
        def unavailable(args, **kwargs):
            if 'fetch' in args:
                raise subprocess.CalledProcessError(128, args, stderr=f'fatal: Authentication failed for https://user:{secret}@github.com/private?access_token={secret}')
            return self.transport(args, **kwargs)
        with self.assertRaisesRegex(RuntimeError, r'synkro-fixture.*fetch.*access') as caught:
            self.execute(unavailable)
        self.assertNotIn(secret, str(caught.exception))
        self.assertNotIn('https://', str(caught.exception))
        self.assertFalse(self.destination.exists())

    def test_dirty_existing_checkout_is_never_overwritten(self):
        self.execute()
        (self.destination / 'unrelated.txt').write_text('preserve user work')
        with self.assertRaisesRegex(RuntimeError, 'refusing overwrite'):
            self.execute()
        self.assertEqual((self.destination / 'unrelated.txt').read_text(), 'preserve user work')

    def test_mismatched_existing_checkout_is_never_reset(self):
        self.execute()
        newest = self.git('-C', str(self.source), 'rev-parse', 'HEAD').strip()
        self.git('-C', str(self.destination), 'fetch', str(self.source), newest)
        self.git('-C', str(self.destination), 'checkout', '--detach', 'FETCH_HEAD')
        with self.assertRaisesRegex(RuntimeError, 'refusing overwrite'):
            self.execute()
        self.assertEqual(self.git('-C', str(self.destination), 'rev-parse', 'HEAD').strip(), newest)

    def test_verified_head_is_required_before_publishing_checkout(self):
        def incorrect(args, **kwargs):
            if 'checkout' in args:
                return subprocess.CompletedProcess(args, 0, stdout=b'', stderr=b'')
            return self.transport(args, **kwargs)
        with self.assertRaisesRegex(RuntimeError, r'synkro-fixture.*verify'):
            self.execute(incorrect)
        self.assertFalse(self.destination.exists())


if __name__ == '__main__':
    unittest.main()
