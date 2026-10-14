import { recordOwner } from '../scripts/local_owner.mjs';
// Actual Mongo owner + supported Sales runner. No CI bootstrap or domain copy.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const mongo = resolve(process.env.SYNKRO_MONGO_REPO || resolve(root, '../synkro-infra-mongo'));
const sales = resolve(process.env.SYNKRO_SALES_DB_REPO || resolve(root, '../synkro-sales-db'));
const owner = recordOwner(randomBytes(12).toString('hex'));
const artifacts = resolve(root, '.work', 'mongo-sales', owner);
mkdirSync(artifacts, { recursive: true });
const disposable = await import(pathToFileURL(resolve(mongo, 'scripts/disposable.mjs')));
const configuration = await import(pathToFileURL(resolve(mongo, 'scripts/config.mjs')));
const { inspect } = await import(pathToFileURL(resolve(mongo, 'scripts/docker.mjs')));
const ownerSales = await import(pathToFileURL(resolve(mongo, 'scripts/sales.mjs')));
const { protect } = await import(pathToFileURL(resolve(mongo, 'scripts/protect.mjs')));
const secrets = [];
function run(program, args, options = {}) {
  try { return execFileSync(program, args, { encoding: 'utf8', timeout: 300000, stdio: ['ignore','pipe','pipe'], ...options }); }
  catch (error) {
    let diagnostic = String(error.stdout || '') + String(error.stderr || '');
    for (const value of secrets) diagnostic = diagnostic.replaceAll(value, '[REDACTED]').replaceAll(encodeURIComponent(value), '[REDACTED]');
    console.error(diagnostic.slice(-4000));
    throw new Error('Actual Mongo/Sales operation failed or timed out');
  }
}
const docker = args => run('docker', args);
const cli = (instance, operation, extra=[]) => run(process.execPath, [resolve(mongo,'scripts/mongo.mjs'),operation,'--env-file',instance.file,...extra]);
const instances = [];
function resource(stage) {
  const project = `synkro-infra-test-${owner}-${stage}`;
  const values = { COMPOSE_PROJECT_NAME:project, MONGO_NETWORK:project, MONGODB_NETWORK:project,
    MONGO_ADMIN_USER:'infra_operator', MONGO_ADMIN_PASSWORD:randomBytes(24).toString('hex') + '$:@! space',
    SALES_APP_PASSWORD:randomBytes(24).toString('hex') + '$:@! space', MONGO_INTERNAL_KEY:randomBytes(756).toString('base64'),
    MONGO_REPLICA_SET:'rs0',MONGO_STARTUP_TIMEOUT_SECONDS:'90',MONGO_CONNECT_TIMEOUT_MS:'2000',
    MONGO_TEST_RUN:owner,MONGO_DISPOSABLE:'true', MONGODB_DATABASE:'sales',
    MONGODB_OPTIONS:'authSource=admin&replicaSet=rs0&connectTimeoutMS=2000&serverSelectionTimeoutMS=5000&socketTimeoutMS=10000' };
  secrets.push(values.MONGO_ADMIN_PASSWORD, values.SALES_APP_PASSWORD, values.MONGO_INTERNAL_KEY);
  const file=resolve(artifacts,stage+'.env');
  writeFileSync(file,Object.entries(values).map(([key,value])=>`${key}='${value}'`).join('\n'),{mode:0o600});
  const instance={project,file,run:owner,network:project,resources:[],values};
  instances.push(instance); return instance;
}
function prepare(instance) {
  disposable.createNetwork(instance);
  cli(instance,'start'); disposable.capture(instance);
  instance.env={...process.env,...configuration.composeEnvironment(instance.values,resolve(mongo,'.runtime',instance.project)),
    MONGODB_NETWORK:instance.network, MONGODB_DATABASE:'sales', MONGODB_OPTIONS:instance.values.MONGODB_OPTIONS,
    MONGODB_URI:`mongodb://${encodeURIComponent(instance.values.MONGO_ADMIN_USER)}:${encodeURIComponent(instance.values.MONGO_ADMIN_PASSWORD)}@synkro-mongo:27017`};
  const file=resolve(artifacts,instance.project+'.json');
  writeFileSync(file,JSON.stringify({include:[resolve(mongo,'compose.yml').replaceAll('\\','/'),resolve(sales,'deploy/compose.yml').replaceAll('\\','/')],
    services:{'sales-db-migrate':{labels:{'synkro.execution':owner,'synkro.disposable':'true'}}}}));
  instance.compose=args=>run('docker',['compose','-p',instance.project,'--env-file',instance.file,'-f',file,...args],{env:instance.env});
}
const probe=resolve(artifacts,'probe.js');
writeFileSync(probe,`const fs=require('fs'); const assert=require('assert/strict');
(async()=>{try {
 const action=process.env.TEST_ACTION;
 const credentials=JSON.parse(fs.readFileSync('/run/secrets/'+(['permissions','recovered-permissions'].includes(action)?'app':'admin')+'.json','utf8'));
 const client=await new Mongo('mongodb://synkro-mongo:27017/admin?replicaSet=rs0&connectTimeoutMS=2000&serverSelectionTimeoutMS=5000&socketTimeoutMS=10000');
 assert.ok(await client.getDB('admin').auth(credentials.user,credentials.password));
 db=client.getDB('sales');
 if(action==='initial') {const hello=await client.getDB('admin').hello();assert.equal(hello.isWritablePrimary,true);assert.equal(hello.setName,'rs0');assert.equal((await client.getDB('admin').getUser('sales_app')).roles.length,0);}
 else if(action==='history') print(await db.DATABASECHANGELOG.countDocuments({}));
 else if(action==='permissions') load('/sales/deploy/ci/sale/permissions.js');
 else if(action==='verify') {assert.equal(await db.sale.countDocuments({_id:'00000000-0000-4000-8000-0000000000aa'}),1);assert.equal((await db.getCollectionInfos({name:'sale'}))[0].options.validationLevel,'strict');}
 else if(action==='restore-users') assert.equal((await client.getDB('admin').getUser('sales_app')).roles.length,0);
 else if(action==='recovered-permissions') {
   const original=await db.sale.findOne({_id:'00000000-0000-4000-8000-0000000000aa'});assert.ok(original);
   const id='00000000-0000-4000-8000-0000000000bb';
   await db.sale.insertOne({...original,_id:id,idempotencyKey:'root-recovery-permission-key'});
   assert.equal((await db.sale.updateOne({_id:id},{$set:{active:true}})).modifiedCount,1);
   assert.equal(await db.sale.countDocuments({_id:id}),1);
   for(const attempt of [()=>db.sale.deleteOne({_id:id}),()=>db.sale.deleteMany({}),
     ()=>client.getDB('other').x.findOne(),()=>client.getDB('other').x.insertOne({a:1})]) {
     let denied=false;try {await attempt();} catch(error) {assert.equal(error.code,13);denied=true;}assert.ok(denied);
   }
 }
 else if(action==='step-down') {try {await client.getDB('admin').runCommand({replSetStepDown:20,force:true});} catch(e) {assert.ok([11600,11602,189,91].includes(e.code));}}
 print('PASS '+action);
}catch(e){print('FAIL probe '+e.name);quit(1);}})();`);
function check(instance,action) {
  return docker(['run','--rm','--network',instance.network,'--tmpfs','/data/db','--tmpfs','/data/configdb',
    '--label','synkro.execution='+owner,'--label','synkro.disposable=true','-e','TEST_ACTION='+action,
    '--mount',`type=bind,source=${resolve(mongo,'.runtime',instance.project)},target=/run/secrets,readonly`,
    '--mount',`type=bind,source=${sales},target=/sales,readonly`,
    '--mount',`type=bind,source=${probe},target=/probe.js,readonly`,
    '--entrypoint','mongosh',disposable.MONGO_IMAGE,'--nodb','--quiet','--file','/probe.js']).trim();
}
try {
 const source=resource('source');prepare(source);check(source,'initial');
 console.log('PASS authenticated Mongo PRIMARY and sales_app in admin from actual HU-INF-04 bootstrap');
 check(source,'step-down');
 const started=Date.now();
 try {execFileSync(process.execPath,[resolve(mongo,'scripts/mongo.mjs'),'wait','--env-file',source.file,'--timeout-seconds','2'],{timeout:10000,stdio:'pipe'});throw new Error('Non-PRIMARY accepted');}
 catch(error) {assert.ok(Number.isInteger(error.status) && error.status!==0, 'Wait must fail as a real subprocess, not an assertion');assert.ok(Date.now()-started<10000);}
 cli(source,'wait',['--timeout-seconds','40']);
 console.log('PASS Mongo without PRIMARY fails within bounded wait');
 const model=JSON.parse(source.compose(['--profile','tooling','config','--format','json']));
 assert.equal(model.name,source.project);assert.ok(model.services['sales-db-migrate'].profiles.includes('tooling'));
 assert.equal(model.services['synkro-mongo'].ports,undefined);
 source.compose(['--profile','tooling','build','sales-db-migrate']);
 const migration=()=>source.compose(['--profile','tooling','run','--rm','--no-deps','-T','sales-db-migrate']);
 const first=migration();assert.match(first,/UPDATE SUMMARY/);
 const history=check(source,'history').split('\n')[0];assert.ok(Number(history)>0);
 const second=migration();assert.match(second,/Run:\s+0\s*$/m);assert.equal(check(source,'history').split('\n')[0],history);
 console.log('PASS supported Sales runner: '+history+' changesets; repeat zero additional changes; guards retained');
 console.log(check(source,'permissions'));
 console.log('Checking owning Mongo bootstrap after Sales grants');
 cli(source,'bootstrap');check(source,'verify');
 console.log('Checking root include volume-preserving stop/start with owning Mongo definition');
 source.compose(['stop','synkro-mongo']);
 source.compose(['up','-d','--wait','--wait-timeout','120','synkro-mongo']);check(source,'verify');
 console.log('PASS Sales data/grants persist across owning-repository bootstrap and restart');
 const archive=resolve(artifacts,'sales.archive.gz');cli(source,'backup',['--database','sales','--archive',archive]);
 const target=resource('restore');prepare(target);cli(target,'restore-disposable',['--database','sales','--archive',archive,'--test-run',owner]);
 check(target,'verify');check(target,'restore-users');check(source,'verify');
 console.log('PASS Sales data/validator restored separately; source unchanged; users/grants deliberately excluded');
 // Exercise the actual root dispatch separately from the generic data-only case.
 const recovery=resource('recovery-restore');prepare(recovery);
 recovery.salesImage=ownerSales.buildRunner(sales);
 const manifest=resolve(artifacts,'root-recovery-manifest.json');
 const save=()=>{
   writeFileSync(manifest,JSON.stringify(instances.map(({project,file,run,network,resources,clients,salesImage})=>
     ({project,file,run,network,resources,clients,salesImage}))),{mode:0o600});protect(manifest);
 };
 protect(recovery.file);save();
 const previousDirectory=process.cwd();
 try {
   process.chdir(mongo); // The owner records client IDs under its own .runtime.
   await ownerSales.runSales({instance:recovery,values:recovery.values,checkout:sales,image:recovery.salesImage,save,expected:10});
 } finally {process.chdir(previousDirectory);}
 const recoveryHistory=check(recovery,'history').split('\n')[0];assert.equal(recoveryHistory,'10');
 const bundle=resolve(artifacts,'root-completed-bundle');mkdirSync(bundle);protect(bundle,true);
 copyFileSync(archive,resolve(bundle,'sales.archive.gz'));protect(resolve(bundle,'sales.archive.gz'));
 // Like the PG restore fixture, assign explicit dev metadata to this exclusively
 // disposable source archive. No persistent dev/qa/main environment is accessed.
 writeFileSync(resolve(bundle,'complete.json'),JSON.stringify({project:'synkro-dev',engine:'mongo',format:1}),{mode:0o600});
 protect(resolve(bundle,'complete.json'));
 console.log(run(process.env.PYTHON || (process.platform==='win32'?'python':'python3'),
   [resolve(root,'scripts/synkro.py'),'restore','dev','--engine','mongo','--backup',bundle,
    '--target-env-file',recovery.file,'--manifest',manifest],{env:{...process.env,SYNKRO_NODE:process.execPath}}).trim());
 const updated=JSON.parse(readFileSync(manifest,'utf8')).find(value=>value.project===recovery.project);
 recovery.clients=updated.clients;recovery.resources=updated.resources;
 check(recovery,'verify');assert.equal(check(recovery,'history').split('\n')[0],recoveryHistory);
 console.log(check(recovery,'recovered-permissions'));check(source,'verify');
 console.log('PASS actual root Sales restore dispatch: independently migrated target, exact owner manifest, fresh history retained, allowed app read/insert/update and denied delete/cross-database access');
} catch(error) {
 for(const instance of instances) {
  for(const identity of instance.resources.filter(value=>value.kind==='container')) {
   const container=inspect('container',identity.name);
   if(container) {
    disposable.assertOwned(container,{...identity,project:instance.project,run:owner},'container');
    let log=docker(['logs','--tail','35',identity.id]);
    for(const value of secrets) log=log.replaceAll(value,'[REDACTED]').replaceAll(encodeURIComponent(value),'[REDACTED]');
    console.error(log.slice(-2500));
   }
  }
 }
 throw error;
} finally {
 for(const instance of instances.reverse()) {
   // Compose --rm removes successful runners. Check and remove only a failed
   // runner belonging to this exact execution before the Mongo owner's guard.
   for(const id of docker(['ps','-aq','--filter','label=com.docker.compose.project='+instance.project,'--filter','label=com.docker.compose.service=sales-db-migrate']).split(/\s+/).filter(Boolean)) {
     const data=inspect('container',id);assert.equal(data.Config.Labels['synkro.execution'],owner);assert.equal(data.Config.Labels['synkro.disposable'],'true');assert.ok(data.Mounts.every(m=>m.Type!=='volume'));docker(['rm','-f',id]);
   }
   disposable.capture(instance);disposable.cleanup(instance);
 }
 console.log('PASS only owned disposable Mongo/Sales resources removed');
}
