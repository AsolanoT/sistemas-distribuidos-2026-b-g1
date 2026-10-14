"""The optional Git helper sends test credentials only to Git's captured pipe."""
import os
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class DependencyAccessTest(unittest.TestCase):
    def test_helper_answers_only_github_prompts_without_debug_output(self):
        shell = 'C:/Program Files/Git/bin/bash.exe' if os.name == 'nt' else 'bash'
        helper = str(ROOT / 'scripts/dependency_askpass.sh')
        environment = dict(os.environ, SYNKRO_DEPENDENCY_READ_TOKEN='disposable-test-token')
        for prompt, expected in [("Username for 'https://github.com': ", 'x-access-token\n'),
                                 ("Password for 'https://x-access-token@github.com': ", 'disposable-test-token\n')]:
            result = subprocess.run([shell, helper, prompt], capture_output=True, text=True, env=environment)
            self.assertEqual(result.returncode, 0)
            self.assertEqual(result.stdout, expected)
            self.assertEqual(result.stderr, '')
        foreign = subprocess.run([shell, helper, "Password for 'https://foreign.test': "], capture_output=True, text=True, env=environment)
        self.assertNotEqual(foreign.returncode, 0)
        self.assertEqual(foreign.stdout, '')
        self.assertNotIn('disposable-test-token', foreign.stderr)


if __name__ == '__main__':
    unittest.main()
