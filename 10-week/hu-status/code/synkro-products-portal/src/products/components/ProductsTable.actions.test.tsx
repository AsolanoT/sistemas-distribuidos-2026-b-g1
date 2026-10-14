import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ProductRow } from '../model/product'
import { ProductsTable } from './ProductsTable'

const keyboardRow: ProductRow = {
  productId: 'p-2',
  name: 'Teclado mecánico',
  price: 'COP 120,00',
  stock: 4,
  stockState: 'in-stock',
  category: 'Periféricos',
  active: true,
}

const inactiveRow: ProductRow = { ...keyboardRow, productId: 'p-3', name: 'Mouse viejo', active: false }

function renderTable(rows: ProductRow[] = [keyboardRow, inactiveRow], disabled = false) {
  const actions = { onEdit: vi.fn(), onAdjust: vi.fn(), onDeactivate: vi.fn(), disabled }
  render(<ProductsTable rows={rows} actions={actions} />)
  return actions
}

const rowOf = (name: RegExp) => within(screen.getByRole('row', { name }))

describe('ProductsTable: the actions column', () => {
  it('is the last column, headed "Acciones" and right-aligned', () => {
    renderTable()

    const headers = screen.getAllByRole('columnheader')
    expect(headers.map((header) => header.textContent)).toEqual([
      'Producto',
      'Categoría',
      'Precio',
      'Stock',
      'Estado',
      'Acciones',
    ])
    expect(headers.at(-1)?.className).toMatch(/endHeader/)
  })

  describe('an active row', () => {
    it('offers Editar, Ajustar stock and Desactivar', () => {
      renderTable()

      const cells = within(screen.getByRole('row', { name: /Teclado mecánico/ })).getAllByRole('cell')
      expect(within(cells.at(-1)!).getAllByRole('button').map((button) => button.textContent)).toEqual([
        'Editar',
        'Ajustar stock',
        'Desactivar',
      ])
    })

    it('names each action after the product', () => {
      renderTable()

      expect(screen.getByRole('button', { name: 'Editar Teclado mecánico' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Ajustar stock Teclado mecánico' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Desactivar Teclado mecánico' })).toBeInTheDocument()
    })

    it('draws Editar and Ajustar stock as ghost buttons and Desactivar as a danger button, all compact', () => {
      renderTable()

      expect(screen.getByRole('button', { name: /^Editar/ }).className).toMatch(/ghost.*small|small.*ghost/)
      expect(screen.getByRole('button', { name: /^Ajustar stock/ }).className).toMatch(/ghost.*small|small.*ghost/)
      expect(screen.getByRole('button', { name: /^Desactivar/ }).className).toMatch(/danger.*small|small.*danger/)
    })

    it('tells the page which product each action is about', async () => {
      const user = userEvent.setup()
      const actions = renderTable()

      await user.click(screen.getByRole('button', { name: 'Editar Teclado mecánico' }))
      await user.click(screen.getByRole('button', { name: 'Ajustar stock Teclado mecánico' }))
      await user.click(screen.getByRole('button', { name: 'Desactivar Teclado mecánico' }))

      expect(actions.onEdit).toHaveBeenCalledExactlyOnceWith('p-2')
      expect(actions.onAdjust).toHaveBeenCalledExactlyOnceWith('p-2')
      expect(actions.onDeactivate).toHaveBeenCalledExactlyOnceWith('p-2')
    })

    it('marks each action so focus can return to it', () => {
      renderTable()

      expect(screen.getByRole('button', { name: 'Editar Teclado mecánico' })).toHaveAttribute('data-opener', 'edit:p-2')
      expect(screen.getByRole('button', { name: 'Ajustar stock Teclado mecánico' })).toHaveAttribute(
        'data-opener',
        'adjust:p-2',
      )
      expect(screen.getByRole('button', { name: 'Desactivar Teclado mecánico' })).toHaveAttribute(
        'data-opener',
        'deactivate:p-2',
      )
    })
  })

  describe('an inactive row', () => {
    it('offers no action: the contract has no way to reactivate', () => {
      renderTable()

      expect(rowOf(/Mouse viejo/).queryAllByRole('button')).toEqual([])
    })

    it('still says it is inactive', () => {
      renderTable()

      expect(rowOf(/Mouse viejo/).getByText('Inactivo')).toBeInTheDocument()
    })
  })

  describe('while a panel or dialog is open', () => {
    it('disables every action', () => {
      renderTable([keyboardRow], true)

      for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
    })
  })

  it('shows no buttons when the table is given no actions', () => {
    render(<ProductsTable rows={[keyboardRow]} />)

    expect(screen.queryAllByRole('button')).toEqual([])
  })

  it('keeps the region keyboard-reachable and marks it as where focus falls back to', () => {
    renderTable()

    const region = screen.getByRole('region', { name: 'Tabla de productos' })
    expect(region).toHaveAttribute('tabindex', '0')
    expect(region).toHaveAttribute('data-focus-fallback', 'catalogue')
  })
})
