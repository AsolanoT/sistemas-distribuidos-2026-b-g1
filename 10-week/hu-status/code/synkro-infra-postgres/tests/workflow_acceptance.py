"""Reuse approved Customers joint acceptance; extend real replay/recovery and login.

Only isolated snapshots are writable. Production implementations are untouched.
The published owner prelude and cleanup stay intact; anchor drift fails closed.
"""
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import verify_local as local


def once(source, anchor, replacement):
    if source.count(anchor) != 1:
        raise RuntimeError('Published joint-test anchor changed; refusing adaptation')
    return source.replace(anchor, replacement, 1)


def execute():
    layout = ROOT.parent
    owner_file = os.environ.get('SYNKRO_LOCAL_OWNER_FILE')
    if owner_file:
        run = Path(owner_file).parent
        if ((run / '.local-owner').read_text(encoding='utf-8') != run.name
                or layout.resolve() != (run / 'layout').resolve()):
            raise RuntimeError('Joint acceptance refuses a non-owned source layout')
    elif os.environ.get('GITHUB_ACTIONS') != 'true':
        raise RuntimeError('Use the isolated local verifier; original siblings are read-only')
    lock = json.loads((ROOT / 'dependencies.lock.json').read_text())
    pins = {entry['name']: entry['revision'] for entry in lock['repositories']}
    customers = layout / 'synkro-customers-api'
    for name in ['synkro-customers-api', 'synkro-auth-api', 'synkro-products-api',
                 'synkro-sales-api', 'synkro-workflow', 'synkro-customers-db',
                 'synkro-auth-db', 'synkro-products-db', 'synkro-sales-db',
                 'synkro-api-gateway', 'synkro-front', 'synkro-auth-portal']:
        local.verify_snapshot(layout / name, pins[name])
    references = customers / '.local-reference'
    references.mkdir(exist_ok=False)
    for name in ['synkro-auth-api', 'synkro-products-api', 'synkro-sales-api',
                 'synkro-workflow', 'synkro-auth-db', 'synkro-products-db', 'synkro-sales-db']:
        local.snapshot(layout / name, references / ('code-corhuila-' + name + '-' + pins[name][:7]),
                       pins[name], name)
    (customers / '.test-cache').mkdir(exist_ok=True)
    source = (customers / 'tests/joint-acceptance.mjs').read_text(encoding='utf-8')
    # Use the approved Customers DB runner directly, rather than its test copy.
    source = source.replace("resolve(root,'tests/fixtures/customers-db')",
                            'resolve(root,"../synkro-customers-db")')
    source = once(source, "async function saga(customerId,expected){", "let latestKey; async function saga(customerId,expected){")
    source = once(source, "},randomUUID(),human);assert.equal(r.status,201);return wait",
                  "},(latestKey=randomUUID()),human);assert.equal(r.status,201);return wait")
    source = once(source, "const completed=await saga(customer.body.customerId,'COMPLETED');",
                  "const completed=await saga(customer.body.customerId,'COMPLETED');const completedKey=latestKey;")
    source = once(source, "    await request('customers','/api/v1/customers/'+customer.body.customerId,'DELETE'", """
    const replay=await request('workflow','/api/v1/sagas/register-sale','POST',{customerId:customer.body.customerId,lines:[{productId:product,quantity:2}]},completedKey,human);
    assert.equal(replay.status,200);assert.equal(replay.body.sagaId,completed.sagaId);
    assert.equal(saleCount(),1);assert.equal(sql(`SELECT stock FROM products_schema.product WHERE product_id='${product}'`),'18');
    console.log('PASS fully real replay: identical saga and no additional effects');
    const previousWorkflowUrl=urls.workflow;docker(['restart',wf]);bind('workflow',wf);effects.restartEndpointChanged=previousWorkflowUrl!==urls.workflow;await wait(async()=> (await request('workflow','/health')).status===200);
    const durable=await request('workflow','/api/v1/sagas/'+completed.sagaId,'GET',undefined,undefined,human);
    assert.equal(durable.body.status,'COMPLETED');assert.equal(durable.body.saleId,completed.saleId);
    console.log('PASS fully real idempotent replay and completed-state restart recovery');
    await request('customers','/api/v1/customers/'+customer.body.customerId,'DELETE'""")
    extension = (ROOT / 'tests/workflow_real_extension.mjs').read_text(encoding='utf-8')
    source = once(source, "    writeFileSync(resolve(root,'.test-cache/joint-result.json')", extension + "\n    writeFileSync(resolve(root,'.test-cache/joint-result.json')")
    # The test gains only an additional DNS alias, not a replacement Auth.
    source = once(source, "...mount(privateKey,'/run/private.pem'),'--publish'",
                  "...mount(privateKey,'/run/private.pem'),'--network-alias','synkro-auth-api','--publish'")
    generated = customers / 'tests/infra-real-joint.mjs'
    generated.write_text(source, encoding='utf-8')
    result = subprocess.run([os.environ.get('SYNKRO_NODE', 'node'), str(generated)],
                            cwd=customers, timeout=3600)
    if result.returncode:
        raise RuntimeError('Actual participant acceptance failed; private diagnostics retained by verifier')
    evidence = json.loads((customers / '.test-cache/joint-result.json').read_text())
    print('PASS actual participant acceptance, replay/recovery and Gateway login; exact pins in root lock')
    print('PASS real effects verified: ' + json.dumps(evidence['effects'], sort_keys=True))


if __name__ == '__main__':
    execute()
