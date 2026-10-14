import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const read = (file: string) => readFileSync(join(ROOT, file), 'utf8')

// The location blocks of the nginx template, by their opening line.
function locationBlock(template: string, opening: string): string {
  const start = template.indexOf(opening)
  if (start === -1) return ''
  let depth = 0
  for (let index = template.indexOf('{', start); index < template.length; index += 1) {
    if (template[index] === '{') depth += 1
    if (template[index] === '}' && --depth === 0) return template.slice(start, index + 1)
  }
  return ''
}

describe('the container image', () => {
  const dockerfile = read('deploy/Dockerfile')

  it('builds in a Node 22 alpine stage and serves with nginx 1.27 alpine', () => {
    expect(dockerfile).toMatch(/^FROM node:22-alpine AS build$/m)
    expect(dockerfile).toMatch(/^FROM nginx:1\.27-alpine$/m)
  })

  it('installs exactly what the lockfile says', () => {
    expect(dockerfile).toMatch(/COPY package\.json package-lock\.json/)
    expect(dockerfile).toMatch(/RUN npm ci/)
  })

  it('takes the host remote entry as a build argument with the local default, and nothing else about the host', () => {
    expect(dockerfile).toMatch(/^ARG VITE_SHELL_ENTRY_URL=http:\/\/localhost:5173\/assets\/remoteEntry\.js$/m)
    expect(dockerfile).not.toMatch(/8000|VITE_API|GATEWAY|TOKEN|SECRET|PASSWORD/i)
  })

  it('fails the build when the compiled portal has a gateway address or token handling', () => {
    expect(dockerfile).toMatch(/RUN npm run build/)
    expect(dockerfile).toMatch(/RUN npm run check:compiled/)
  })

  it('serves dist with the nginx template, substituting only HOST_ORIGIN', () => {
    expect(dockerfile).toMatch(/COPY --from=build \/app\/dist \/usr\/share\/nginx\/html/)
    expect(dockerfile).toMatch(/COPY deploy\/nginx\.conf\.template \/etc\/nginx\/templates\/default\.conf\.template/)
    expect(dockerfile).toMatch(/^ENV HOST_ORIGIN=http:\/\/localhost:5173$/m)
    expect(dockerfile).toMatch(/^ENV NGINX_ENVSUBST_FILTER=\^HOST_ORIGIN\$$/m)
  })

  it('leaves the build context free of dependencies, build output and secrets', () => {
    const ignored = read('.dockerignore')

    for (const entry of ['node_modules', 'dist', 'coverage', '.git', '.env']) expect(ignored).toContain(entry)
  })
})

describe('the nginx template', () => {
  const template = read('deploy/nginx.conf.template')
  const remoteEntry = locationBlock(template, 'location = /assets/remoteEntry.js')
  const assets = locationBlock(template, 'location /assets/')
  const index = locationBlock(template, 'location = /index.html')

  it('never caches the remote entry, which decides which version of the portal the host loads', () => {
    expect(remoteEntry).toMatch(/add_header Cache-Control "no-store" always;/)
  })

  it('caches the hashed assets for a long time, immutable', () => {
    expect(assets).toMatch(/add_header Cache-Control "public, max-age=31536000, immutable" always;/)
  })

  it('does not cache index.html', () => {
    expect(index).toMatch(/add_header Cache-Control "no-cache" always;/)
  })

  it.each([
    ['the remote entry', () => remoteEntry],
    ['the other assets', () => assets],
  ])('allows %s from the host origin only, and says it varies with the origin', (_name, block) => {
    expect(block()).toMatch(/add_header Access-Control-Allow-Origin "\$\{HOST_ORIGIN\}" always;/)
    expect(block()).toMatch(/add_header Vary "Origin" always;/)
  })

  it('repeats what each location needs, because add_header is not inherited into a location that has its own', () => {
    const outside = template.replace(remoteEntry, '').replace(assets, '').replace(index, '')

    expect(outside).not.toMatch(/Access-Control-Allow-Origin/)
    for (const block of [remoteEntry, assets]) expect((block.match(/add_header/g) ?? []).length).toBeGreaterThanOrEqual(3)
  })

  it('never answers every origin and never bakes a host address', () => {
    expect(template).not.toMatch(/Access-Control-Allow-Origin\s+"?\*/)
    expect(template).not.toMatch(/localhost|127\.0\.0\.1|https?:\/\//)
  })

  it('compresses text', () => {
    expect(template).toMatch(/gzip on;/)
  })

  it('leaves nginx own variables alone: only HOST_ORIGIN is a template variable', () => {
    const variables = [...template.matchAll(/\$\{(\w+)\}/g)].map(([, name]) => name)

    expect(new Set(variables)).toEqual(new Set(['HOST_ORIGIN']))
    expect(template).toMatch(/\$uri/)
  })
})

describe('the compose file and the environment', () => {
  it('delivers this portal internally through the host', () => {
    const compose = read('deploy/compose.yml')

    expect(compose).not.toMatch(/ports:/)
    expect(compose).toMatch(/networks: \[platform\]/)
    expect(compose).toMatch(/dockerfile: deploy\/Dockerfile/)
    expect(compose).toMatch(/HOST_ORIGIN: \$\{HOST_ORIGIN:-http:\/\/localhost:5173\}/)
    expect(compose).toMatch(/VITE_SHELL_ENTRY_URL: \$\{VITE_SHELL_ENTRY_URL:-http:\/\/localhost:5173\/assets\/remoteEntry\.js\}/)
    expect(compose).not.toMatch(/8000|TOKEN|SECRET|PASSWORD/)
  })

  it('documents HOST_ORIGIN and the build argument in .env.example, commented', () => {
    const example = read('.env.example')

    expect(example).toMatch(/^# HOST_ORIGIN=http:\/\/localhost:5173$/m)
    expect(example).toMatch(/^# VITE_SHELL_ENTRY_URL=/m)
  })

  it('keeps the real .env and the coverage report out of git', () => {
    const ignored = read('.gitignore')

    expect(ignored).toMatch(/^\.env$/m)
    expect(ignored).toMatch(/^coverage\/$/m)
  })
})

describe('CI', () => {
  const ci = read('.github/workflows/ci.yml')

  it('keeps the jobs it had', () => {
    for (const job of ['check-common-files:', 'lint-and-build:', 'unit-tests:']) expect(ci).toContain(job)
  })

  it('builds the container image without pushing it', () => {
    expect(ci).toMatch(/container-image:/)
    expect(ci).toMatch(/docker build -f deploy\/Dockerfile/)
    expect(ci).not.toMatch(/docker push|login-action|registry/)
  })

  it('checks the rendered nginx configuration of the image', () => {
    expect(ci).toMatch(/nginx -t/)
  })

  it('checks the compiled portal after the build', () => {
    expect(ci).toMatch(/npm run check:compiled/)
  })
})

describe('the repository structure of a domain portal', () => {
  it.each([
    'deploy/Dockerfile',
    'deploy/nginx.conf.template',
    'deploy/compose.yml',
    'src/shell.d.ts',
    'src/vite-env.d.ts',
    'src/products/api',
    'src/products/components',
    'src/products/model',
    'src/products/pages',
    '.env.example',
    '.gitignore',
    '.nvmrc',
    'package-lock.json',
    'README.md',
    '.github/CODEOWNERS',
    '.github/pull_request_template.md',
  ])('has %s', (path) => {
    expect(existsSync(join(ROOT, path))).toBe(true)
  })

  it('pins Node 22 in .nvmrc and in engines', () => {
    expect(read('.nvmrc').trim()).toBe('22')
    expect(JSON.parse(read('package.json')).engines.node).toBe('>=22 <23')
  })
})
