import unittest
from pathlib import Path
import yaml
ROOT=Path(__file__).resolve().parents[1]
class AuthCustomersIntegrationTest(unittest.TestCase):
    def test_customers_uses_own_password_file_and_bounded_datasource(self):
        model=yaml.safe_load((ROOT/'compose.customers-api.override.yml').read_text())
        env=model['services']['synkro-customers-api']['environment']
        self.assertEqual(env['SPRING_DATASOURCE_USERNAME'],'customers_app')
        self.assertEqual(env['SPRING_DATASOURCE_PASSWORD'],'')
        self.assertIn('currentSchema=customers_schema',env['SPRING_DATASOURCE_URL'])
        self.assertIn('connectTimeout=',env['SPRING_DATASOURCE_URL'])
        self.assertEqual(env['SPRING_DATASOURCE_PASSWORD_FILE'],'/run/secrets/customers_app_password')
        self.assertNotIn('JWT_PRIVATE_KEY_FILE',env)
    def test_auth_has_its_restricted_datasource_separate_from_customers(self):
        model=yaml.safe_load((ROOT/'compose.auth-api.override.yml').read_text())
        env=model['services']['synkro-auth-api']['environment']
        self.assertEqual(env['SPRING_DATASOURCE_USERNAME'],'auth_app')
        self.assertIn('currentSchema=auth_schema',env['SPRING_DATASOURCE_URL'])
        self.assertEqual(env['SPRING_DATASOURCE_PASSWORD_FILE'],'/run/secrets/auth_app_password')
    def test_root_overrides_are_owned_include_overlays(self):
        includes=yaml.safe_load((ROOT/'compose.yml').read_text())['include']
        for domain in ['auth','customers']:
            self.assertIn({'path':['../synkro-'+domain+'-api/deploy/compose.yml','compose.'+domain+'-api.override.yml']},includes)
