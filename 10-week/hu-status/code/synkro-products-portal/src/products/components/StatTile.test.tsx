import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { SummaryTile } from '../model/summary'
import { StatTile } from './StatTile'

const tile = (state: SummaryTile['state']): SummaryTile => ({ id: 'activeProducts', label: 'Productos activos', state })

describe('StatTile', () => {
  it('shows the label and the number', () => {
    render(<StatTile tile={tile({ status: 'ready', value: 12 })} onRetry={vi.fn()} />)

    expect(screen.getByRole('listitem', { name: 'Productos activos' })).toHaveTextContent('12')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows a zero as a number, not as a failure', () => {
    render(<StatTile tile={tile({ status: 'ready', value: 0 })} onRetry={vi.fn()} />)

    expect(screen.getByRole('listitem')).toHaveTextContent('0')
    expect(screen.queryByText('—')).not.toBeInTheDocument()
  })

  it('shows a skeleton while loading, marked busy, with no number and no retry', () => {
    const { container } = render(<StatTile tile={tile({ status: 'loading' })} onRetry={vi.fn()} />)

    expect(screen.getByRole('listitem')).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(screen.getByText('Productos activos')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows — and a retry that says which tile it retries', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<StatTile tile={tile({ status: 'error' })} onRetry={onRetry} />)

    expect(screen.getByText('—')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reintentar: Productos activos' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })
})
