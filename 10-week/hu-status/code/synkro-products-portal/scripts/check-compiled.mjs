import { existsSync } from 'node:fs'
import { findViolations, readCompiled } from './compiledCheck.mjs'

// Run after the build (CI and the image build do): fails when the compiled portal
// has a gateway address, token handling or a direct HTTP client.
const directory = process.argv[2] ?? 'dist'

if (!existsSync(directory)) {
  console.error(`check-compiled: ${directory} does not exist. Build the portal first.`)
  process.exit(1)
}

const violations = findViolations(readCompiled(directory))

if (violations.length > 0) {
  for (const { file, rule } of violations) console.error(`check-compiled: ${rule} in ${file}`)
  process.exit(1)
}

console.log(`check-compiled: ${directory} has no gateway address and no token handling.`)
