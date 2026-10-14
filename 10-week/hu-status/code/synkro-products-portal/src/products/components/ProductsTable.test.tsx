import { render, screen, within } from '@testing-library/react'
import type { ProductRow } from '../model/product'
import { ProductsTable } from './ProductsTable'

const mouseRow: ProductRow = {
  productId: 'p-1',
  name: 'Wireless mouse',
  price: 'COP 1.234,56',
  stock: 7,
  stockState: 'in-stock',
  category: 'Peripherals',
  active: true,
}

const keyboardRow: ProductRow = {
  productId: 'p-2',
  name: 'Mechanical keyboard',
  price: 'COP 0,00',
  stock: 0,
  stockState: 'out-of-stock',
  category: 'Categoría desconocida',
  active: false,
}

const cellsOf = (name: RegExp) => within(screen.getByRole('row', { name })).getAllByRole('cell')

describe('ProductsTable', () => {
  it('has the columns of the wireframe, in order, ending with the actions', () => {
    render(<ProductsTable rows={[mouseRow]} />)

    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent)
    expect(headers).toEqual(['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'])
  })

  it('sits in a keyboard-reachable, labelled region that scrolls on its own', () => {
    render(<ProductsTable rows={[mouseRow]} />)

    const region = screen.getByRole('region', { name: 'Tabla de productos' })
    expect(region).toHaveAttribute('tabindex', '0')
    expect(within(region).getByRole('table')).toBeInTheDocument()
  })

  it('shows the name and the price of each product', () => {
    render(<ProductsTable rows={[mouseRow]} />)

    const cells = cellsOf(/Wireless mouse/)
    expect(cells[0]).toHaveTextContent('Wireless mouse')
    expect(cells[2]).toHaveTextContent('COP 1.234,56')
  })

  it('shows the category as a badge', () => {
    render(<ProductsTable rows={[mouseRow]} />)

    expect(within(cellsOf(/Wireless mouse/)[1]).getByText('Peripherals')).toHaveAttribute('data-tone', 'neutral')
  })

  it('shows the stock number next to a badge that states the state in words', () => {
    render(<ProductsTable rows={[mouseRow, keyboardRow]} />)

    const inStock = cellsOf(/Wireless mouse/)[3]
    expect(within(inStock).getByText('7')).toBeInTheDocument()
    expect(within(inStock).getByText('En stock')).toHaveAttribute('data-tone', 'success')

    const soldOut = cellsOf(/Mechanical keyboard/)[3]
    expect(within(soldOut).getByText('0')).toBeInTheDocument()
    expect(within(soldOut).getByText('Agotado')).toHaveAttribute('data-tone', 'error')
  })

  it('shows Activo and Inactivo as badges', () => {
    render(<ProductsTable rows={[mouseRow, keyboardRow]} />)

    expect(within(cellsOf(/Wireless mouse/)[4]).getByText('Activo')).toHaveAttribute('data-tone', 'success')
    expect(within(cellsOf(/Mechanical keyboard/)[4]).getByText('Inactivo')).toHaveAttribute('data-tone', 'neutral')
  })

  it('marks Precio and Stock as numeric, and only those', () => {
    render(<ProductsTable rows={[mouseRow]} />)

    const cells = cellsOf(/Wireless mouse/)
    expect(cells.map((cell) => /numeric/.test(cell.className))).toEqual([false, false, true, true, false, false])
    const headers = screen.getAllByRole('columnheader')
    expect(headers.map((header) => /numeric/.test(header.className))).toEqual([false, false, true, true, false, false])
  })

  it('keeps the rows in the order received', () => {
    render(<ProductsTable rows={[keyboardRow, mouseRow]} />)

    const names = screen.getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[0].textContent)
    expect(names).toEqual(['Mechanical keyboard', 'Wireless mouse'])
  })
})
