import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

const meta = (page: number, totalPages: number) => ({ page, limit: 20, total: 100, totalPages })

describe('Pagination', () => {
  it('shows the current page out of the total', () => {
    render(<Pagination meta={meta(2, 5)} onPageChange={vi.fn()} />)

    expect(screen.getByText('Página 2 de 5')).toBeInTheDocument()
  })

  it('moves to the previous and next page', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination meta={meta(2, 5)} onPageChange={onPageChange} />)

    await user.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(onPageChange).toHaveBeenLastCalledWith(1)

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(onPageChange).toHaveBeenLastCalledWith(3)
  })

  it('disables Anterior on the first page', () => {
    render(<Pagination meta={meta(1, 5)} onPageChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled()
  })

  it('disables Siguiente on the last page', () => {
    render(<Pagination meta={meta(5, 5)} onPageChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeEnabled()
  })

  it('is labelled as the pagination of the list', () => {
    render(<Pagination meta={meta(1, 3)} onPageChange={vi.fn()} />)

    expect(screen.getByRole('navigation', { name: 'Paginación' })).toBeInTheDocument()
  })

  it('announces the page change politely', () => {
    render(<Pagination meta={meta(2, 5)} onPageChange={vi.fn()} />)

    expect(screen.getByText('Página 2 de 5')).toHaveAttribute('aria-live', 'polite')
  })
})
