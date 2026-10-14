import importlib.util
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


class FullCompositionGuardTest(unittest.TestCase):
    def module(self):
        spec = importlib.util.spec_from_file_location('full', Path(__file__).with_name('full_composition.py'))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def test_original_checkout_is_rejected_before_creating_secrets(self):
        module = self.module()
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(module.ops.Failure):
                module.owner_guard(Path(__file__).resolve().parents[1])

    def test_unrelated_layout_cannot_reuse_a_valid_run_marker(self):
        module = self.module()
        with tempfile.TemporaryDirectory() as directory:
            run = Path(directory) / ('run-' + 'a' * 32)
            run.mkdir()
            (run / '.local-owner').write_text(run.name)
            with patch.dict(os.environ, {'SYNKRO_LOCAL_OWNER_FILE': str(run / '.execution-ids')}, clear=True):
                with self.assertRaises(module.ops.Failure):
                    module.owner_guard(Path(directory) / 'unrelated' / 'synkro-infra-postgres')
