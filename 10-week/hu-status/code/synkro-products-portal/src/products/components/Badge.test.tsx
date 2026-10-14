import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('states its meaning in text', () => {
    render(<Badge tone="success">En stock</Badge>)

    expect(screen.getByText('En stock')).toBeInTheDocument()
  })

  it.each(['success', 'error', 'neutral'] as const)('exposes the %s tone', (tone) => {
    render(<Badge tone={tone}>Estado</Badge>)

    expect(screen.getByText('Estado')).toHaveAttribute('data-tone', tone)
  })

  it('reinforces the state with a mark that screen readers skip', () => {
    render(<Badge tone="error">Agotado</Badge>)

    const mark = screen.getByText('Agotado').querySelector('[data-mark]')
    expect(mark).toHaveAttribute('aria-hidden', 'true')
  })

  it('can leave the mark out, for a plain label such as a category', () => {
    render(
      <Badge tone="neutral" marker={false}>
        Periféricos
      </Badge>,
    )

    expect(screen.getByText('Periféricos').querySelector('[data-mark]')).toBeNull()
  })
})
