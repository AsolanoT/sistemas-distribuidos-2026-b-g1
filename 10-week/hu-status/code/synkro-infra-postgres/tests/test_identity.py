import base64
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from dev_identity import generate


class DevelopmentIdentityTest(unittest.TestCase):
    def test_tokens_are_signed_with_fixed_service_permissions(self):
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import padding
        with tempfile.TemporaryDirectory() as folder:
            generate(folder)
            public = serialization.load_pem_public_key((Path(folder) / 'public.pem').read_bytes())
            for service, permissions in [('workflow', ['customers:read', 'stock:reserve', 'stock:release', 'sales:register']),
                                         ('worker', ['products:read', 'stock-alerts:read', 'stock-alerts:write'])]:
                token = (Path(folder) / (service + '.token')).read_bytes()
                header, payload, signature = token.split(b'.')
                public.verify(base64.urlsafe_b64decode(signature + b'=='), header + b'.' + payload, padding.PKCS1v15(), hashes.SHA256())
                claims = json.loads(base64.urlsafe_b64decode(payload + b'=='))
                self.assertEqual(claims['roles'], ['SERVICE'])
                self.assertEqual(claims['sub'], 'synkro-' + service)
                self.assertEqual(claims['permissions'], permissions)
                self.assertEqual(claims['exp'] - claims['iat'], 30 * 86400)
            with self.assertRaises(ValueError):
                generate(folder)


if __name__ == '__main__':
    unittest.main()
