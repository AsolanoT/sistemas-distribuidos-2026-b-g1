"""Record disposable execution identities only when a local verifier owns storage."""
import os
from pathlib import Path
import re
import uuid


def execution_id():
    identifier = uuid.uuid4().hex
    destination = os.environ.get('SYNKRO_LOCAL_OWNER_FILE')
    if destination:
        file = Path(destination)
        parent = file.parent.resolve()
        if (file.name != '.execution-ids' or not re.fullmatch(r'run-[0-9a-f]{32}', parent.name)
                or (parent / '.local-owner').read_text(encoding='utf-8') != parent.name):
            raise RuntimeError('Local execution identity recorder refuses unrelated storage')
        with file.open('a', encoding='utf-8') as output:
            output.write(identifier + '\n')
    return identifier
