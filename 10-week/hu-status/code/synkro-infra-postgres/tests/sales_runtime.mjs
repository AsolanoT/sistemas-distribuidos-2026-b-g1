import { recordOwner } from '../scripts/local_owner.mjs';
// Actual shipped Sales image, owning Mongo infrastructure and secure migration runner.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomBytes, randomUUID, generateKeyPairSync, sign } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const mongo = resolve(root, '../synkro-infra-mongo');
const sales = resolve(root, '../synkro-sales-db');
const api = resolve(root, '../synkro-sales-api');
process.chdir(mongo); // The owner's client identity files are relative to its runtime directory.
const disposable = await import(pathToFileURL(resolve(mongo, 'scripts/disposable.mjs')));
const { inspect } = await import(pathToFileURL(resolve(mongo, 'scripts/docker.mjs')));
const ownerSales = await import(pathToFileURL(resolve(mongo, 'scripts/sales.mjs')));
const run = recordOwner(randomBytes(12).toString('hex'));
const project = `synkro-infra-test-${run}-source`;
const appProject = `synkro-sales-runtime-${run}`;
const artifacts = resolve(root, '.work/sales-runtime', run);
mkdirSync(artifacts, { recursive: true });
const values = { COMPOSE_PROJECT_NAME: project, MONGO_NETWORK: project, MONGO_ADMIN_USER: 'runtime_operator',
  MONGO_ADMIN_PASSWORD: randomBytes(24).toString('hex'), SALES_APP_PASSWORD: randomBytes(24).toString('hex'),
  MONGO_INTERNAL_KEY: randomBytes(756).toString('base64'), MONGO_REPLICA_SET: 'rs0',
  MONGO_STARTUP_TIMEOUT_SECONDS: '90', MONGO_CONNECT_TIMEOUT_MS: '2000', MONGO_TEST_RUN: run, MONGO_DISPOSABLE: 'true' };
const credentials = [values.MONGO_ADMIN_PASSWORD, values.SALES_APP_PASSWORD, values.MONGO_INTERNAL_KEY];
const file = resolve(artifacts, 'source.env');
writeFileSync(file, Object.entries(values).map(([name,value]) => `${name}='${value}'`).join('\n'), { mode: 0o600 });
const instance = { project, run, network: project, file, resources: [] };
const manifest = resolve(artifacts, 'manifest.json');
const save = () => writeFileSync(manifest, JSON.stringify([instance], null, 2));
function command(program, args, options={}) {
  try { return execFileSync(program, args, { encoding:'utf8', timeout:600000, stdio:['ignore','pipe','pipe'], ...options }); }
  catch(error) {
    let detail = String(error.stdout || '') + String(error.stderr || '');
    for (const value of credentials) detail = detail.replaceAll(value, '[REDACTED]');
    detail = detail.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED JWT]');
    console.error(detail.slice(-4000));
    throw new Error('Actual Sales runtime command failed or timed out');
  }
}
const docker = args => command('docker', args);
const cli = action => command(process.execPath, [resolve(mongo,'scripts/mongo.mjs'),action,'--env-file',file]);
let compose;
let appId;
try {
  disposable.createNetwork(instance); save(); cli('start'); disposable.capture(instance); save();
  instance.salesImage = ownerSales.buildRunner(sales); save();
  await ownerSales.runSales({ instance, values, checkout:sales, image:instance.salesImage, save, expected:10 });
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength:2048 });
  const publicPath = resolve(artifacts, 'auth-public.pem');
  writeFileSync(publicPath, publicKey.export({ type:'spki', format:'pem' }));
  const applicationUri = `mongodb://sales_app:${values.SALES_APP_PASSWORD}@synkro-mongo:27017/sales?authSource=admin&replicaSet=rs0&connectTimeoutMS=2000&serverSelectionTimeoutMS=3000&socketTimeoutMS=5000&retryWrites=false`;
  const environment = { ...process.env, SALES_APP_MONGODB_URI:applicationUri, JWT_PUBLIC_KEY_PATH:publicPath,
    JWT_PUBLIC_KEY:'an inline input for other APIs must not select a second Sales key source',
    MONGODB_URI:`mongodb://${values.MONGO_ADMIN_USER}:${values.MONGO_ADMIN_PASSWORD}@synkro-mongo:27017`,
    MONGODB_TIMEOUT:'2s', MONGODB_MAX_POOL_SIZE:'7' };
  const composition = resolve(artifacts, 'compose.json');
  writeFileSync(composition, JSON.stringify({ include:[resolve(api,'deploy/compose.yml').replaceAll('\\','/')],
    networks:{ platform:{name:instance.network} },
    services:{ 'synkro-sales-api':{ labels:{'synkro.execution':run,'synkro.disposable':'true'} } } }));
  const args = ['compose','-p',appProject,'-f',composition];
  const rendered = JSON.parse(command('docker', [...args,'config','--format','json'], {env:environment}));
  const service = rendered.services['synkro-sales-api'];
  assert.equal(service.ports, undefined); assert.equal(service.environment.MONGODB_URI, applicationUri);
  assert.equal(service.environment.JWT_PUBLIC_KEY, ''); assert.equal(service.environment.JWT_PUBLIC_KEY_FILE, '/run/secrets/sales_jwt_public_key');
  assert.ok(!JSON.stringify(service).includes(values.MONGO_ADMIN_PASSWORD));
  const exposure = resolve(artifacts, 'test-only-port.json');
  writeFileSync(exposure, JSON.stringify({services:{'synkro-sales-api':{ports:['127.0.0.1::8080']}}}));
  compose = (...extra) => command('docker', [...args,'-f',exposure,...extra], {env:environment});
  compose('up','-d','--build','--no-deps','synkro-sales-api');
  appId = compose('ps','-aq','synkro-sales-api').trim();
  const address = 'http://' + compose('port','synkro-sales-api','8080').trim();
  async function request(path, options={}) {
    const response = await fetch(address + path, {...options, signal:AbortSignal.timeout(7000)});
    const body = await response.json();
    return { status:response.status, body };
  }
  async function ready(status) {
    const deadline = Date.now()+60000;
    while(Date.now()<deadline) { try {const result=await request('/health');if(result.status===status)return result;} catch{} await new Promise(done=>setTimeout(done,500)); }
    throw new Error('Actual Sales database-aware health did not reach expected status '+status);
  }
  assert.equal((await ready(200)).body.dependencies.database, 'ok');
  const jwt = (subject, role, permission) => {
    const now = Math.floor(Date.now()/1000);
    const unsigned = Buffer.from(JSON.stringify({alg:'RS256'})).toString('base64url') + '.' +
      Buffer.from(JSON.stringify({sub:subject,roles:[role],permissions:permission?[permission]:[],iat:now-10,exp:now+300,jti:randomUUID()})).toString('base64url');
    return unsigned + '.' + sign('RSA-SHA256', Buffer.from(unsigned), privateKey).toString('base64url');
  };
  const salesperson=randomUUID(), foreign=randomUUID();
  const human = jwt(salesperson,'SALESPERSON','sales:read');
  const administrator = jwt(randomUUID(),'ADMIN','sales:read');
  const workflow = jwt('synkro-workflow','SERVICE','sales:register');
  const headers = token => ({Authorization:'Bearer '+token, 'Content-Type':'application/json', 'X-Correlation-Id':'infra-sales-runtime'});
  assert.equal((await request('/api/v1/sales')).status,401);
  const body=JSON.stringify({customerId:randomUUID(),createdBy:salesperson,details:[{productId:randomUUID(),quantity:2,unitPriceCents:1250}]});
  const registration = {method:'POST',headers:{...headers(workflow),'Idempotency-Key':randomUUID()+':register-sale'},body};
  const first=await request('/api/v1/sales',registration);assert.equal(first.status,201);
  const second=await request('/api/v1/sales',registration);assert.equal(second.status,200);assert.deepEqual(second.body,first.body);
  const identifier=first.body.saleId;assert.ok(identifier);
  assert.equal((await request('/api/v1/sales/'+identifier,{headers:headers(human)})).status,200);
  assert.equal((await request('/api/v1/sales/'+identifier,{headers:headers(jwt(foreign,'SALESPERSON','sales:read'))})).status,403);
  assert.equal((await request('/api/v1/sales',{headers:headers(administrator)})).status,200);
  assert.equal((await request('/api/v1/sales',{...registration,headers:headers(jwt('synkro-workflow','SERVICE'))})).status,403);
  assert.equal((await request('/api/v1/sales',{headers:headers(human.slice(0,-8)+'invalid')})).status,401);
  console.log('PASS current Sales actual image: application-only Mongo URI, one mounted public key, HTTP registration/replay, RS256/RBAC/ownership and DB-aware health');
  cli('stop');assert.equal((await ready(503)).body.dependencies.database,'down');
  cli('start');await ready(200);
  assert.equal((await request('/api/v1/sales/'+identifier,{headers:headers(human)})).status,200);
  const logs=docker(['logs',appId]);
  for(const value of credentials) assert.ok(!logs.includes(value),'Sales logs must not disclose credentials');
  assert.ok(!logs.includes(workflow) && !logs.includes(human),'Sales logs must not disclose JWTs');
  console.log('PASS actual Sales health detects unavailable Mongo, recovers after volume-preserving start and reads persisted registration without credential disclosure');
} catch(error) {
  let detail=error.message;
  for(const value of credentials) detail=detail.replaceAll(value,'[REDACTED]');
  detail=detail.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,'[REDACTED JWT]');
  console.error('FAIL actual Sales runtime: '+detail.slice(0,2000));
  throw new Error('Required actual Sales runtime assertion failed');
} finally {
  if(compose) {
    const identifiers=docker(['ps','-aq','--filter','label=com.docker.compose.project='+appProject]).trim().split(/\s+/).filter(Boolean);
    for(const identifier of identifiers) {
      const resource=JSON.parse(docker(['inspect',identifier]))[0];
      assert.equal(resource.Config.Labels['synkro.execution'],run);
      assert.equal(resource.Config.Labels['com.docker.compose.project'],appProject);
      assert.ok(resource.Mounts.every(mount=>mount.Type!=='volume'));
    }
    if(identifiers.length) compose('down','--timeout','20');
  }
  disposable.capture(instance);disposable.cleanup(instance);save();
  console.log('PASS only owned Sales runtime and Mongo resources removed');
}
