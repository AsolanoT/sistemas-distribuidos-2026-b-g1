import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiClient } from '../../test-doubles/shellApiClient'
import { CatalogueService, PRODUCTS_PATH } from '../../test-doubles/catalogueService'
import type { ProductResponse } from '../model/product'
import { ProductsPage } from './ProductsPage'

const product = (n: number, active = true): ProductResponse => ({
  productId: `p-${n}`,
  name: `Producto ${String(n).padStart(2, '0')}`,
  priceCents: 1000,
  stock: 5,
  categoryId: 'c-1',
  active,
})

const listPages = (service: CatalogueService) =>
  service
    .requests('GET', PRODUCTS_PATH)
    .filter(([, options]) => options?.query?.limit !== 1)
    .map(([, options]) => options?.query?.page)

describe('ProductsPage: an empty last page', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  it('returns to the last valid page when deactivating the only product of the last page under Activos', async () => {
    // Four active products and a page size of three: the last page holds only Producto 04.
    const service = new CatalogueService({
      products: [1, 2, 3, 4].map((n) => product(n)),
      categories: [{ categoryId: 'c-1', name: 'Periféricos', active: true }],
      pageSize: 3,
    })
    const user = userEvent.setup()
    render(<ProductsPage />)
    await screen.findByRole('row', { name: /Producto 01/ })
    await user.selectOptions(screen.getByLabelText('Estado'), 'Activos')
    await screen.findByText('Página 1 de 2')
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    await screen.findByText('Página 2 de 2')

    await user.click(screen.getByRole('button', { name: 'Desactivar Producto 04' }))
    await user.click(screen.getByRole('button', { name: 'Desactivar' }))

    expect(await screen.findByText('Página 1 de 1')).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /Producto 01/ })).toBeInTheDocument()
    expect(screen.queryByText(/Ningún producto coincide/)).not.toBeInTheDocument()
    await waitFor(() => expect(listPages(service).slice(-2)).toEqual([2, 1]))
  })

  it('does not chase pages when the catalogue is empty', async () => {
    const service = new CatalogueService({ products: [], categories: [] })
    render(<ProductsPage />)

    expect(await screen.findByText('Aún no hay productos registrados')).toBeInTheDocument()
    expect(listPages(service)).toEqual([1])
  })
})
