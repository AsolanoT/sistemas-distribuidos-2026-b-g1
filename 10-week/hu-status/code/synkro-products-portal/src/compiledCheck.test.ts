import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { findViolations, readCompiled } from '../scripts/compiledCheck.mjs'

// The portal reaches the API only through the host's client, and the host alone
// knows the gateway and holds the token. The compiled portal proves it: no gateway
// address and no token handling in what is shipped.
const check = (text: string) => findViolations([{ name: 'bundle.js', text }]).map((violation) => violation.rule)

describe('the compiled-code check', () => {
  describe('a gateway address', () => {
    it.each([
      ['localhost:8000', 'const base = "http://localhost:8000"'],
      ['a gateway port', 'fetchBase("127.0.0.1:8000/api")'],
      ['an absolute API url', 'const url = "https://gateway.example.com/api/v1/products"'],
    ])('rejects %s', (_name, source) => {
      expect(check(source)).toContain('gateway-url')
    })

    it('accepts the host remote entry, which is not the gateway', () => {
      expect(check('remotes:{shell:"http://localhost:5173/assets/remoteEntry.js"}')).toEqual([])
    })

    it('accepts a relative API path, which is how the portal asks', () => {
      expect(check('const path = "/api/v1/products"')).toEqual([])
    })
  })

  describe('token handling', () => {
    it.each([
      ['Authorization', 'headers["Authorization"] = token'],
      ['Bearer', 'const value = `Bearer ${t}`'],
      ['sessionStorage', 'sessionStorage.getItem("t")'],
      ['localStorage', 'localStorage.setItem("t", t)'],
      ['a JWT field', 'const { access_token } = body'],
    ])('rejects %s', (_name, source) => {
      expect(check(source)).toContain('token-handling')
    })
  })

  describe('a direct HTTP client', () => {
    it.each([
      ['fetch(', 'const r = await fetch("/api/v1/products")'],
      ['fetch( after a statement', 'a();fetch(url)'],
      ['XMLHttpRequest', 'const x = new XMLHttpRequest()'],
      ['axios', 'import axios from "axios"'],
    ])('rejects %s', (_name, source) => {
      expect(check(source)).toContain('direct-http')
    })

    it.each([
      ['a method named fetch', 'client.fetch(options)'],
      ['prefetch', 'prefetchDNS(href);preconnect(href)'],
      ['fetchPriority', 'props.fetchPriority="high"'],
      ['the word in text', 'throw Error("could not fetch the data")'],
    ])('does not trip on %s, as React own code has them', (_name, source) => {
      expect(check(source)).toEqual([])
    })
  })

  it('reports the file and the rule of each violation', () => {
    const violations = findViolations([
      { name: 'a.js', text: 'ok' },
      { name: 'b.js', text: 'localStorage.clear()' },
    ])

    expect(violations).toEqual([expect.objectContaining({ file: 'b.js', rule: 'token-handling' })])
  })

  it('accepts a bundle that has none of it', () => {
    expect(check('export function App(){return createElement("h1",null,"Productos")}')).toEqual([])
  })

  describe('the portal as it is compiled', () => {
    const dist = join(import.meta.dirname, '..', 'dist')

    // Run after `npm run build`; CI does, and so does the image build.
    it.runIf(existsSync(dist) && statSync(dist).isDirectory() && readdirSync(dist).length > 0)(
      'has no gateway address and no token handling',
      () => {
        expect(findViolations(readCompiled(dist))).toEqual([])
      },
    )

    it('is checked with a script CI and the image build run after the build', () => {
      const scripts = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf8')).scripts

      expect(scripts['check:compiled']).toBe('node scripts/check-compiled.mjs dist')
    })
  })
})
