import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen } from '@testing-library/react'
import { peripherals } from '../../test-doubles/productsFixtures'
import { NO_PANEL } from '../model/panel'
import { CategoriesSection } from './CategoriesSection'

const css = readFileSync(join(import.meta.dirname, 'CategoriesSection.module.css'), 'utf8')

function rule(selector: string): string {
  const start = css.indexOf(`${selector} {`)
  return start === -1 ? '' : css.slice(start, css.indexOf('}', start))
}

function renderSection() {
  const noop = () => {}
  render(
    <CategoriesSection
      categories={{ status: 'ready', value: [{ ...peripherals, name: 'Una categoría con un nombre bastante largo' }] }}
      panel={NO_PANEL}
      busy={false}
      onRetry={noop}
      onCreate={noop}
      onRename={noop}
      onDeactivate={noop}
      onCreated={noop}
      onRenamed={noop}
      onDeactivated={noop}
      onOutdated={noop}
      onClose={noop}
    />,
  )
}

describe('the category chips, laid out to wrap cleanly', () => {
  it('keeps the two controls together in a group of their own, after the name', () => {
    renderSection()

    const rename = screen.getByRole('button', { name: /Renombrar categoría/ })
    const deactivate = screen.getByRole('button', { name: /Desactivar categoría/ })
    expect(rename.parentElement).toBe(deactivate.parentElement)
    expect(rename.parentElement?.className).toMatch(/controls/)
    expect(rename.parentElement?.previousElementSibling).toHaveTextContent('Una categoría con un nombre bastante largo')
  })

  it('does not draw the chip as a pill, which turns into an odd shape when it wraps', () => {
    expect(rule('.chip')).not.toMatch(/--radius-full/)
    expect(rule('.chip')).toMatch(/border-radius:\s*var\(--radius-md\)/)
  })

  it('lets the name take the room it needs and wrap on its own, and the controls wrap together', () => {
    expect(rule('.chip')).toMatch(/flex-wrap:\s*wrap/)
    expect(rule('.name')).toMatch(/flex:\s*1 1 auto/)
    expect(rule('.name')).toMatch(/min-width:\s*0/)
    expect(rule('.controls')).toMatch(/display:\s*flex/)
    expect(rule('.controls')).toMatch(/gap:\s*var\(--space-2\)/)
  })

  it('never lets a chip grow wider than its row, so the page does not scroll sideways', () => {
    expect(rule('.chip')).toMatch(/max-width:\s*100%/)
  })
})
