import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

const css = readFileSync(join(import.meta.dirname, 'Badge.module.css'), 'utf8')

describe('Badge: the warning tone', () => {
  it('says its label in words, with a dot', () => {
    render(<Badge tone="warning">Stock bajo</Badge>)

    const badge = screen.getByText('Stock bajo')
    expect(badge).toHaveAttribute('data-tone', 'warning')
    expect(badge.querySelector('[data-mark]')).not.toBeNull()
  })

  it('draws the background and the dot from the warning tokens, and keeps the text in ink', () => {
    expect(css).toMatch(/\.badge\[data-tone='warning'\]\s*\{[^}]*background:\s*var\(--color-warning-50\)/)
    expect(css).toMatch(/\.badge\[data-tone='warning'\] \.mark\s*\{[^}]*background:\s*var\(--color-warning-700\)/)
    expect(css).not.toMatch(/data-tone='warning'\][^{]*\{[^}]*\bcolor:\s*var\(--color-warning/)
  })
})
