import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Everything the user reads is Spanish and lives in a copy module; components,
// hooks and mappers carry no user-facing text of their own. Code, identifiers,
// comments and tests are English, so a Spanish letter or sign in a source file
// outside a copy module means copy that escaped it.
const PRODUCTS = join(import.meta.dirname, 'products')

function sources(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry)
    if (statSync(path).isDirectory()) return sources(path)
    return /\.(ts|tsx)$/.test(path) && !/\.test\.tsx?$/.test(path) && !/Copy\.ts$/.test(path) ? [path] : []
  })
}

const SPANISH = /[áéíóúñÁÉÍÓÚÑ¿¡]/

describe('user-facing copy', () => {
  const files = sources(PRODUCTS)

  it('has sources to check', () => {
    expect(files.length).toBeGreaterThan(10)
  })

  it.each(files.map((file) => [file.slice(PRODUCTS.length + 1), file]))('%s carries no Spanish text of its own', (_name, file) => {
    const stray = readFileSync(file, 'utf8')
      .split('\n')
      .filter((line) => SPANISH.test(line))

    expect(stray).toEqual([])
  })

  it('has the management copy in modules next to the registration and list copy', () => {
    const copyModules = readdirSync(join(PRODUCTS, 'model')).filter((file) => /Copy\.ts$/.test(file))

    expect(copyModules).toEqual(
      expect.arrayContaining(['registrationCopy.ts', 'listCopy.ts', 'managementCopy.ts', 'categoriesCopy.ts']),
    )
  })
})
