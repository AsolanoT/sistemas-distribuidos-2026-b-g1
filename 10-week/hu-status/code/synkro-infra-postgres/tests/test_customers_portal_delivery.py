"""The approved Angular portal needs its actual owning command and entry contract."""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class CustomersPortalDeliveryTest(unittest.TestCase):
    def test_actual_angular_package_is_in_the_complete_portal_suite(self):
        source = (ROOT / 'tests/portal_delivery.py').read_text()
        self.assertIn("('synkro-customers-portal', 'synkro-customers-portal')", source)
        self.assertIn("'npm', 'run', 'coverage'", source)
        self.assertIn("delivery(prefix + '/remotes/customers/', entry='remoteEntry.js', minimum_css=0)", source)
        self.assertIn("compose('stop', 'synkro-customers-portal')", source)

    def test_all_environment_examples_publish_the_approved_customers_input(self):
        for name in ('dev', 'qa', 'main'):
            text = (ROOT / 'env' / (name + '.env.example')).read_text()
            self.assertIn('VITE_CUSTOMERS_PORTAL_ENTRY=/remotes/customers/remoteEntry.js', text)
