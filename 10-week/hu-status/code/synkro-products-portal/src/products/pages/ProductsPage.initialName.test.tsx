import { render, screen } from '@testing-library/react'
import { apiClient } from '../../test-doubles/shellApiClient'
import { CatalogueService, PRODUCTS_PATH } from '../../test-doubles/catalogueService'
import { ProductsPage } from './ProductsPage'

const keyboard = { productId: 'p-1', name: 'Teclado mecánico', priceCents: 1250050, stock: 2, categoryId: 'c-1', active: true }
const mouse = { productId: 'p-2', name: 'Mouse inalámbrico', priceCents: 99900, stock: 7, categoryId: 'c-1', active: true }

function start(search: string) {
  window.history.replaceState({}, '', `/products${search}`)
  const service = new CatalogueService({
    products: [keyboard, mouse],
    categories: [{ categoryId: 'c-1', name: 'Periféricos', active: true }],
  })
  render(<ProductsPage />)
  return service
}

const firstListRequest = (service: CatalogueService) =>
  service.requests('GET', PRODUCTS_PATH).find(([, options]) => options?.query?.limit !== 1)

describe('ProductsPage: the initial name filter from the URL', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })
  afterEach(() => {
    window.history.replaceState({}, "", "/")
  })

  it('asks for the name in the URL from the first request, and the search box starts with it', async () => {
    const service = start('?name=Teclado')

    expect(await screen.findByRole('row', { name: /Teclado mecánico/ })).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /Mouse inalámbrico/ })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Teclado')
    expect(firstListRequest(service)?.[1]?.query?.name).toBe('Teclado')
  })

  it('trims the name', async () => {
    const service = start('?name=%20%20Teclado%20')

    await screen.findByRole('row', { name: /Teclado mecánico/ })
    expect(screen.getByLabelText('Nombre')).toHaveValue('Teclado')
    expect(firstListRequest(service)?.[1]?.query?.name).toBe('Teclado')
  })

  it('ignores an empty name', async () => {
    const service = start('?name=')

    expect(await screen.findByRole('row', { name: /Mouse inalámbrico/ })).toBeInTheDocument()
    expect(firstListRequest(service)?.[1]?.query?.name).toBeUndefined()
  })

  it('reads the URL once, when the page mounts', async () => {
    start('?name=Teclado')
    await screen.findByRole('row', { name: /Teclado mecánico/ })

    window.history.replaceState({}, '', '/products?name=Mouse')

    expect(screen.getByLabelText('Nombre')).toHaveValue('Teclado')
  })
})
