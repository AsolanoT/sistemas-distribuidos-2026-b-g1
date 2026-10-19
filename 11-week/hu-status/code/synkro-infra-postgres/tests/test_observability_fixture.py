"""The protected fixture secret must be readable by the shipped Grafana user."""
from contextlib import nullcontext
import importlib.util
import os
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('observability_fixture', Path(__file__).with_name('observability.py'))
observability = importlib.util.module_from_spec(spec)
spec.loader.exec_module(observability)


class BeforeResources(Exception):
    pass


class GrafanaFixtureTest(unittest.TestCase):
    @unittest.skipUnless(os.name == 'posix' and os.geteuid() == 0,
                         'Linux root fixture must provision the container UID')
    def test_grafana_can_read_secret_without_group_or_other_access(self):
        with tempfile.TemporaryDirectory() as folder:
            def inspect_before_resources(*args, **kwargs):
                password = Path(folder) / 'password'
                metadata = password.stat()
                self.assertEqual(stat.S_IMODE(metadata.st_mode), 0o600)
                self.assertEqual(metadata.st_uid, 472,
                                 'Grafana UID 472 cannot read a root-owned 0600 secret')
                self.assertTrue(password.read_bytes())
                raise BeforeResources()

            with patch.object(observability.tempfile, 'TemporaryDirectory', return_value=nullcontext(folder)), \
                    patch.object(observability.ops, 'run', side_effect=inspect_before_resources):
                with self.assertRaises(BeforeResources):
                    observability.execute()


if __name__ == '__main__':
    unittest.main()
