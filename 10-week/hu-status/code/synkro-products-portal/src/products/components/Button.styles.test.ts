import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Under Vitest a CSS module answers every class name with itself, so the
// variants are checked in the stylesheet: each one exists and reads its colours,
// and its compact size, from the design tokens.
const css = readFileSync(join(import.meta.dirname, 'Button.module.css'), 'utf8')

function rule(selector: string): string {
  const start = css.indexOf(`${selector} {`)
  return start === -1 ? '' : css.slice(start, css.indexOf('}', start))
}

describe('Button stylesheet', () => {
  it('draws the ghost variant transparent, in the secondary text colour', () => {
    expect(rule('.ghost')).toMatch(/background:\s*transparent/)
    expect(rule('.ghost')).toMatch(/color:\s*var\(--color-text-secondary\)/)
  })

  it('draws the danger variant transparent, in the error colour', () => {
    expect(rule('.danger')).toMatch(/background:\s*transparent/)
    expect(rule('.danger')).toMatch(/color:\s*var\(--color-error-700\)/)
    expect(rule('.danger')).toMatch(/border-color:\s*var\(--color-error-700\)/)
  })

  it('gives every variant a visible hover that is not only colour', () => {
    expect(css).toMatch(/\.ghost:hover:not\(:disabled\)/)
    expect(css).toMatch(/\.danger:hover:not\(:disabled\)/)
  })

  it('keeps the compact size at least 24 by 24 CSS pixels', () => {
    expect(rule('.small')).toMatch(/min-height:\s*var\(--space-8\)/)
    expect(rule('.small')).toMatch(/min-width:\s*var\(--space-8\)/)
  })
})
