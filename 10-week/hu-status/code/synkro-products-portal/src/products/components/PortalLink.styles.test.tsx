import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { PortalLink } from './PortalLink'

const css = readFileSync(join(import.meta.dirname, 'PortalLink.module.css'), 'utf8')

function rule(selector: string): string {
  const start = css.indexOf(`${selector} {`)
  return start === -1 ? '' : css.slice(start, css.indexOf('}', start))
}

describe('PortalLink styles', () => {
  it('is drawn with the portal link style, not the browser default blue', () => {
    render(<PortalLink href="/stock">Existencias</PortalLink>)

    expect(screen.getByRole('link').className).toMatch(/link/)
  })

  it('reads its colour from the tokens', () => {
    expect(rule('.link')).toMatch(/color:\s*var\(--color-secondary-action\)/)
  })

  it('is underlined, so it is a link without relying on its colour', () => {
    expect(rule('.link')).toMatch(/text-decoration:\s*underline/)
  })

  it('has a hover that thickens the underline, not only a colour change', () => {
    expect(css).toMatch(/\.link:hover/)
    expect(css).toMatch(/text-decoration-thickness/)
  })
})
