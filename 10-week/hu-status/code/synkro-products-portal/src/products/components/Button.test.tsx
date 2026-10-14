import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('never submits unless it says so', () => {
    render(<Button>Buscar</Button>)

    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveAttribute('type', 'button')
  })

  it('has a small size for an action that sits inside a tile', () => {
    render(<Button size="small">Reintentar</Button>)

    expect(screen.getByRole('button').className).toMatch(/small/)
  })

  it('is regular unless it asks for small', () => {
    render(<Button>Reintentar</Button>)

    expect(screen.getByRole('button').className).not.toMatch(/small/)
  })

  it.each(['primary', 'secondary', 'ghost', 'danger'] as const)('has a %s variant', (variant) => {
    render(<Button variant={variant}>Acción</Button>)

    expect(screen.getByRole('button').className).toMatch(new RegExp(variant))
  })

  it('keeps the compact size with the ghost and danger variants', () => {
    render(
      <>
        <Button variant="ghost" size="small">
          Editar
        </Button>
        <Button variant="danger" size="small">
          Desactivar
        </Button>
      </>,
    )

    for (const button of screen.getAllByRole('button')) expect(button.className).toMatch(/small/)
  })
})
