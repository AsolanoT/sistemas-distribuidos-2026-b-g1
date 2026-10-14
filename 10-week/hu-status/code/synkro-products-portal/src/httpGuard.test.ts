import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'

// The portal reaches the API only through the host's `shell/apiClient`, and
// keeps no credentials of its own. The lint config is what enforces it.
const oxlint = join(process.cwd(), 'node_modules', 'oxlint', 'bin', 'oxlint')
const config = join(process.cwd(), '.oxlintrc.json')

function lint(target: string) {
  try {
    execFileSync(process.execPath, [oxlint, '-c', config, target], { stdio: 'pipe' })
    return { passes: true, output: '' }
  } catch (error) {
    return { passes: false, output: String((error as { stdout?: Buffer }).stdout) }
  }
}

describe('http and storage guard', () => {
  const dir = mkdtempSync(join(tmpdir(), 'products-guard-'))
  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  function lintSnippet(name: string, source: string) {
    const file = join(dir, name)
    writeFileSync(file, source)
    return lint(file)
  }

  it.each([
    ['fetch', 'export const load = () => fetch("/api/v1/products")\n'],
    ['XMLHttpRequest', 'export const xhr = () => new XMLHttpRequest()\n'],
    ['axios', 'import axios from "axios"\nexport const load = () => axios.get("/x")\n'],
    ['localStorage', 'export const save = (t: string) => localStorage.setItem("t", t)\n'],
    ['sessionStorage', 'export const save = (t: string) => sessionStorage.setItem("t", t)\n'],
  ])('rejects %s', (name, source) => {
    expect(lintSnippet(`${name}.ts`, source).passes).toBe(false)
  })

  it('accepts the portal source as it is', () => {
    expect(lint(join(process.cwd(), 'src')).passes).toBe(true)
  })
})
