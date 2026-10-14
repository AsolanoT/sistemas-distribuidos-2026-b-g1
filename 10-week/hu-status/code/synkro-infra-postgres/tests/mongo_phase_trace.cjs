// Opt-in observation only. Never record args, environments or child buffers.
const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { syncBuiltinESMExports } = require('node:module');
const owner = process.env.SYNKRO_LOCAL_OWNER_FILE;
if (!owner) throw new Error('Safe Mongo trace requires owned local evidence storage');
const directory = path.dirname(owner);
if (!/^run-[a-f0-9]{32}$/.test(path.basename(directory)) ||
    fs.readFileSync(path.join(directory, '.local-owner'), 'utf8') !== path.basename(directory)) {
  throw new Error('Safe Mongo trace storage ownership rejected');
}
const destination = path.join(directory, 'mongo-phase-trace.jsonl');
process.env.NODE_OPTIONS = ((process.env.NODE_OPTIONS || '') + ' --require=' + JSON.stringify(__filename.replaceAll('\\', '/'))).trim();
function emit(value) {
  fs.appendFileSync(destination, JSON.stringify({ at: Date.now(), pid: process.pid, ...value }) + '\n');
}
for (const method of ['spawnSync', 'execFileSync']) {
  const original = cp[method];
  cp[method] = function(program, args, options) {
    const executable = path.basename(String(program));
    const operation = executable.startsWith('node')
      ? (['start','bootstrap','health','stop','restart','backup','restore-disposable','wait'].find(x => args?.includes(x)) || 'node')
      : executable.startsWith('docker')
        ? (args?.includes('/opt/synkro/bootstrap.sh') ? 'compose-bootstrap' :
           args?.[0] === 'compose' ? 'compose-' + (['exec','up','stop','ps'].find(x => args.includes(x)) || 'other') : args?.[0])
        : executable;
    const started = Date.now();
    emit({ method, operation, phase: 'begin', timeout: options?.timeout });
    try {
      const result = original.apply(this, arguments);
      emit({ method, operation, phase: 'end', milliseconds: Date.now()-started,
             status: result?.status ?? 0, error: result?.error?.code || null });
      return result;
    } catch (error) {
      emit({ method, operation, phase: 'throw', milliseconds: Date.now()-started,
             error: error.code || error.name });
      throw error;
    }
  };
}
syncBuiltinESMExports();
