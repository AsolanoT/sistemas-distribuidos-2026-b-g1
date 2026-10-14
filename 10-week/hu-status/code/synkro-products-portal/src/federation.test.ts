import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createFederationConfig, federationConfig } from './federation.config'
import ownPackage from '../package.json'

// The host (synkro-front) imports `productsPortal/App` from
// http://localhost:5175/assets/remoteEntry.js and mounts the default export.
describe('federation config', () => {
  it('is named after the remote the host registers', () => {
    expect(federationConfig.name).toBe('productsPortal')
  })

  it('serves its entry where the host looks for it', () => {
    expect(federationConfig.filename).toBe('remoteEntry.js')
  })

  it('exposes the root module as ./App', () => {
    expect(federationConfig.exposes).toEqual({ './App': './src/App.tsx' })
  })

  it('shares react and react-dom as the only shared libraries', () => {
    expect(Object.keys(federationConfig.shared)).toEqual(['react', 'react-dom'])
  })

  it('shares react and react-dom at the version range the host pins', () => {
    expect(federationConfig.shared.react.requiredVersion).toBe(ownPackage.dependencies.react)
    expect(federationConfig.shared['react-dom'].requiredVersion).toBe(ownPackage.dependencies['react-dom'])
    expect(ownPackage.dependencies.react).toBe('^19.2.8')
  })

  it('reaches the host client and session through the shell remote', () => {
    expect(Object.keys(federationConfig.remotes)).toEqual(['shell'])
  })
})

describe('shell entry url', () => {
  it('defaults to the local host entry', () => {
    expect(federationConfig.remotes.shell).toBe('http://localhost:5173/assets/remoteEntry.js')
  })

  it('can point at another host without editing the config', () => {
    const config = createFederationConfig('https://host.example/assets/remoteEntry.js')

    expect(config.remotes.shell).toBe('https://host.example/assets/remoteEntry.js')
  })
})

describe('built remote entry', () => {
  const outDir = mkdtempSync(join(tmpdir(), 'products-portal-'))

  beforeAll(async () => {
    await build({ logLevel: 'silent', mode: 'production', build: { outDir, emptyOutDir: true } })
  }, 120_000)

  afterAll(() => rmSync(outDir, { recursive: true, force: true }))

  it('emits assets/remoteEntry.js', () => {
    expect(existsSync(join(outDir, 'assets', 'remoteEntry.js'))).toBe(true)
  })

  it('declares ./App among the entry exposed modules', () => {
    const entry = readFileSync(join(outDir, 'assets', 'remoteEntry.js'), 'utf8')
    expect(entry).toContain('"./App"')
  })

  // The federation plugin only rewrites its css placeholders inside '' or "" quotes;
  // a template literal (backticks) leaves them unresolved and breaks every exposed module.
  it('leaves no css placeholder unresolved, whatever the quote style', () => {
    const entry = readFileSync(join(outDir, 'assets', 'remoteEntry.js'), 'utf8')
    expect(entry).not.toContain('__v__css__')
  })
})
