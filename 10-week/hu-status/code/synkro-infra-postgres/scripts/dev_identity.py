"""Only invoked by synkro.py after the explicit dev guard."""
import base64
import json
import os
import time
import uuid
from pathlib import Path


def generate(destination):
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import padding, rsa
    destination = Path(destination).resolve()
    destination.mkdir(parents=True, exist_ok=True, mode=0o700)
    names = ['private.pem', 'public.pem', 'workflow.token', 'worker.token']
    if any((destination / name).exists() for name in names):
        raise ValueError('Identity destination already exists')
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    values = {'private.pem': key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()),
              'public.pem': key.public_key().public_bytes(serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo)}
    permissions = {'workflow': ['customers:read', 'stock:reserve', 'stock:release', 'sales:register'],
                   'worker': ['products:read', 'stock-alerts:read', 'stock-alerts:write']}
    def encode(value):
        return base64.urlsafe_b64encode(value).rstrip(b'=')
    for service, grants in permissions.items():
        now = int(time.time())
        claims = {'sub': f'synkro-{service}', 'roles': ['SERVICE'], 'permissions': grants,
                  'iat': now, 'exp': now + 30 * 86400, 'jti': str(uuid.uuid4())}
        payload = encode(b'{"alg":"RS256","typ":"JWT"}') + b'.' + encode(json.dumps(claims).encode())
        values[service + '.token'] = payload + b'.' + encode(key.sign(payload, padding.PKCS1v15(), hashes.SHA256()))
    for name, value in values.items():
        with os.fdopen(os.open(destination / name, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), 'wb') as output:
            output.write(value)
        from operations import protect_created
        protect_created(destination / name)
    print('Development identity files created; private key is mounted only by Auth')
