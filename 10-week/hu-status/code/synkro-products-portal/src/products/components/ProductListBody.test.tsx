import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ListView } from '../model/productList'
import { ProductListBody } from './ProductListBody'

const meta = { page: 1, limit: 20, total: 1, totalPages: 1 }
const emptyMeta = { ...meta, total: 0, totalPages: 0 }
const row = {
  productId: 'p-1',
  name: 'Wireless mouse',
  price: 'COP 1.234,56',
  stock: 7,
  stockState: 'in-stock' as const,
  category: 'Peripherals',
  active: true,
}

function renderBody(view: ListView, onRegister: (() => void) | null = vi.fn()) {
  const onRetry = vi.fn()
  const onPageChange = vi.fn()
  const { container } = render(
    <ProductListBody view={view} onRetry={onRetry} onPageChange={onPageChange} onRegister={onRegister ?? undefined} />,
  )
  return { onRetry, onPageChange, onRegister, container }
}

describe('ProductListBody', () => {
  it('shows a skeleton shaped like the table and says "Cargando productos…" to screen readers', () => {
    const { container } = renderBody({ status: 'loading' })

    expect(screen.getByRole('status')).toHaveTextContent('Cargando productos…')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(container.querySelectorAll('tbody tr').length).toBeGreaterThan(1)
  })

  it('shows the error in an alert with a retry that repeats the request', async () => {
    const user = userEvent.setup()
    const { onRetry } = renderBody({ status: 'error' })

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los productos.')
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('makes the retry reachable with the keyboard', async () => {
    const user = userEvent.setup()
    renderBody({ status: 'error' })

    await user.tab()

    expect(screen.getByRole('button', { name: 'Reintentar' })).toHaveFocus()
  })

  describe('an empty catalogue, with no filters', () => {
    const view: ListView = { status: 'empty', meta: emptyMeta, hasFilters: false }

    it('says there are no products yet and offers to register the first one', async () => {
      const user = userEvent.setup()
      const { onRegister } = renderBody(view)

      expect(screen.getByText('Aún no hay productos registrados')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Nuevo producto' }))

      expect(onRegister).toHaveBeenCalledOnce()
    })

    it('offers no action when registering is not possible right now', () => {
      renderBody(view, null)

      expect(screen.getByText('Aún no hay productos registrados')).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('shows no table and no pagination', () => {
      renderBody(view)

      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    })
  })

  describe('filters that match nothing', () => {
    const view: ListView = { status: 'empty', meta: emptyMeta, hasFilters: true }

    it('says no product matches, and offers no registration', () => {
      renderBody(view)

      expect(screen.getByText('Ningún producto coincide con estos filtros')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Nuevo producto' })).not.toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  it('shows the products and their pagination when there is data', () => {
    renderBody({ status: 'data', rows: [row], meta })

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Wireless mouse' })).toBeInTheDocument()
    expect(screen.getByText('Página 1 de 1')).toBeInTheDocument()
  })
})
