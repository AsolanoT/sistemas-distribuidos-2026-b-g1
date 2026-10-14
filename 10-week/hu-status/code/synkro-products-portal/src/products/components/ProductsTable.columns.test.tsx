import { render, screen, within } from '@testing-library/react'
import type { ProductRow } from '../model/product'
import { lookupColumns } from '../model/tableColumns'
import { ProductsTable } from './ProductsTable'
import { ProductsTableSkeleton } from './ProductsTableSkeleton'

const row: ProductRow = {
  productId: 'p-1',
  name: 'Teclado mecánico',
  price: 'COP 12.500,50',
  stock: 2,
  stockState: 'in-stock',
  category: 'Periféricos',
  active: true,
}

describe('the product table with the stock lookup columns', () => {
  it('has Producto, Categoría, Precio and Stock, and no status or actions column', () => {
    render(<ProductsTable rows={[row]} columns={lookupColumns} />)

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Producto',
      'Categoría',
      'Precio',
      'Stock',
    ])
  })

  it('has one cell per column', () => {
    render(<ProductsTable rows={[row]} columns={lookupColumns} />)

    expect(within(screen.getByRole('row', { name: /Teclado/ })).getAllByRole('cell')).toHaveLength(4)
  })

  it('shows the number next to the badge, as in the list', () => {
    render(<ProductsTable rows={[row]} columns={lookupColumns} />)

    const stock = within(screen.getByRole('row', { name: /Teclado/ })).getAllByRole('cell')[3]
    expect(within(stock).getByText('En stock')).toBeInTheDocument()
    expect(within(stock).getByText('2')).toBeInTheDocument()
  })

  it('offers no action even when an inactive-or-active row is given handlers', () => {
    render(
      <ProductsTable
        rows={[row]}
        columns={lookupColumns}
        actions={{ onEdit: vi.fn(), onAdjust: vi.fn(), onDeactivate: vi.fn(), disabled: false }}
      />,
    )

    expect(screen.queryAllByRole('button')).toEqual([])
  })

  it('labels its region with the label it is given', () => {
    render(<ProductsTable rows={[row]} columns={lookupColumns} label="Tabla de existencias" />)

    expect(screen.getByRole('region', { name: 'Tabla de existencias' })).toBeInTheDocument()
  })

  it('has a skeleton with the same columns', () => {
    const { container } = render(<ProductsTableSkeleton columns={lookupColumns} />)

    expect([...container.querySelectorAll('thead th')].map((header) => header.textContent)).toEqual([
      'Producto',
      'Categoría',
      'Precio',
      'Stock',
    ])
    for (const body of container.querySelectorAll('tbody tr')) expect(body.querySelectorAll('td')).toHaveLength(4)
  })
})
