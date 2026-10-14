import { render } from '@testing-library/react'
import { tableColumns } from '../model/tableColumns'
import { ProductsTableSkeleton } from './ProductsTableSkeleton'

describe('ProductsTableSkeleton', () => {
  it('has the same columns as the table, headers included', () => {
    const { container } = render(<ProductsTableSkeleton />)

    const headers = [...container.querySelectorAll('thead th')].map((header) => header.textContent)
    expect(headers).toEqual(['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'])
    expect(headers).toHaveLength(tableColumns.length)
  })

  it('has rows with one placeholder cell per column', () => {
    const { container } = render(<ProductsTableSkeleton />)

    const rows = [...container.querySelectorAll('tbody tr')]
    expect(rows.length).toBeGreaterThan(1)
    for (const row of rows) expect(row.querySelectorAll('td')).toHaveLength(tableColumns.length)
  })

  it('is hidden from assistive technology and takes no focus: the loading status says it', () => {
    const { container } = render(<ProductsTableSkeleton />)

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('[tabindex]')).toBeNull()
  })
})
