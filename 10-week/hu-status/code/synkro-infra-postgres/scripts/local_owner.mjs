// Identity-only provenance; never persist credentials or command arguments.
import { appendFileSync, readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
export function recordOwner(identifier) {
  const destination = process.env.SYNKRO_LOCAL_OWNER_FILE;
  if (destination) {
    const file = resolve(destination);
    const parent = dirname(file);
    if (basename(file) !== '.execution-ids' || !/^run-[a-f0-9]{32}$/.test(basename(parent)) ||
        readFileSync(resolve(parent, '.local-owner'), 'utf8') !== basename(parent) ||
        !/^[a-f0-9]{24,32}$/.test(identifier)) throw new Error('Refusing unrelated execution identity storage');
    appendFileSync(file, identifier + '\n', { mode: 0o600 });
  }
  return identifier;
}
