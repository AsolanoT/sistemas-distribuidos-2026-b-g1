import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LowStockNotice } from './LowStockNotice'

describe('LowStockNotice', () => {
  it('says the check failed and that the list is still available, as a status', () => {
    render(<LowStockNotice onRetry={() => {}} />)

    const notice = screen.getByRole('status')
    expect(notice).toHaveTextContent('No se pudo comprobar el stock bajo. La lista sigue disponible.')
  })

  it('offers Reintentar', async () => {
    const onRetry = vi.fn()
    render(<LowStockNotice onRetry={onRetry} />)

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })
})
