import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiClient, lastRequestUrl } from '../../test-doubles/shellApiClient'
import { accessories, categoriesPage, keyboard, mouse, peripherals, productsPage } from '../../test-doubles/productsFixtures'
import type { Page } from '../model/page'
import type { ProductResponse } from '../model/product'
import { ProductsPage } from './ProductsPage'

const CATEGORIES_PATH = '/api/v1/products/categories'

// Answers the two requests the way the products service does: categories by
// path, products by the name filter in the query.
function answerFromService(products: Page<ProductResponse> = productsPage([mouse])) {
  apiClient.request.mockImplementation((path: string, options) => {
    if (path === CATEGORIES_PATH) return Promise.resolve(categoriesPage([peripherals, accessories]))
    if (options?.query?.name === 'key') return Promise.resolve(productsPage([keyboard]))
    return Promise.resolve(products)
  })
}

function productsRequests() {
  return apiClient.request.mock.calls.filter(([path, options]) => path === '/api/v1/products' && options?.query?.limit !== 1)
}

describe('ProductsPage', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  it('shows the Productos heading', () => {
    answerFromService()

    render(<ProductsPage />)

    expect(screen.getByRole('heading', { name: 'Productos' })).toBeInTheDocument()
  })

  it('shows a loading notice first', () => {
    answerFromService()

    render(<ProductsPage />)

    expect(screen.getByRole('status')).toHaveTextContent('Cargando productos…')
  })

  it('shows every product with its category name, from the categories list', async () => {
    answerFromService(productsPage([mouse, keyboard]))

    render(<ProductsPage />)

    const mouseRow = await screen.findByRole('row', { name: /Wireless mouse/ })
    expect(within(mouseRow).getByText('COP 1.234,56')).toBeInTheDocument()
    expect(within(mouseRow).getByText('Peripherals')).toBeInTheDocument()
    const keyboardRow = screen.getByRole('row', { name: /Mechanical keyboard/ })
    expect(within(keyboardRow).getByText('Categoría desconocida')).toBeInTheDocument()
  })

  it('shows the empty notice when no product matches', async () => {
    answerFromService(productsPage([]))

    render(<ProductsPage />)

    expect(await screen.findByText('Aún no hay productos registrados')).toBeInTheDocument()
  })

  it('shows the error with a retry that brings the products back', async () => {
    const user = userEvent.setup()
    let productCalls = 0
    apiClient.request.mockImplementation((path: string) => {
      if (path === CATEGORIES_PATH) return Promise.resolve(categoriesPage([peripherals]))
      productCalls += 1
      return productCalls === 1 ? Promise.reject(new Error('gateway down')) : Promise.resolve(productsPage([mouse]))
    })
    render(<ProductsPage />)
    await user.click(await screen.findByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('row', { name: /Wireless mouse/ })).toBeInTheDocument()
    expect(productsRequests()).toHaveLength(2)
  })

  it('searches by name and shows what the service answers', async () => {
    const user = userEvent.setup()
    answerFromService()
    render(<ProductsPage />)
    await screen.findByRole('row', { name: /Wireless mouse/ })

    await user.type(screen.getByLabelText('Nombre'), 'key{Enter}')

    expect(await screen.findByRole('row', { name: /Mechanical keyboard/ })).toBeInTheDocument()
    expect(lastRequestUrl()).toBe('/api/v1/products?page=1&limit=20&name=key')
  })

  it('filters by category', async () => {
    const user = userEvent.setup()
    answerFromService()
    render(<ProductsPage />)
    await screen.findByRole('row', { name: /Wireless mouse/ })

    await user.selectOptions(screen.getByLabelText('Categoría'), 'c-2')

    await waitFor(() => expect(lastRequestUrl()).toBe('/api/v1/products?page=1&limit=20&categoryId=c-2'))
  })

  it('moves to the next page with the page metadata from the service', async () => {
    const user = userEvent.setup()
    apiClient.request.mockImplementation((path: string, options) => {
      if (path === CATEGORIES_PATH) return Promise.resolve(categoriesPage([peripherals]))
      const page = Number(options?.query?.page ?? 1)
      return Promise.resolve({ data: [mouse], meta: { page, limit: 20, total: 41, totalPages: 3 } })
    })
    render(<ProductsPage />)
    expect(await screen.findByText('Página 1 de 3')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(await screen.findByText('Página 2 de 3')).toBeInTheDocument()
    expect(lastRequestUrl()).toBe('/api/v1/products?page=2&limit=20')
  })

  it('keeps the products on screen when the categories fail, and marks their category as unavailable', async () => {
    const user = userEvent.setup()
    let categoryCalls = 0
    apiClient.request.mockImplementation((path: string) => {
      if (path === CATEGORIES_PATH) {
        categoryCalls += 1
        return categoryCalls === 1 ? Promise.reject(new Error('down')) : Promise.resolve(categoriesPage([peripherals]))
      }
      return Promise.resolve(productsPage([mouse]))
    })
    render(<ProductsPage />)

    const mouseRow = await screen.findByRole('row', { name: /Wireless mouse/ })
    expect(within(mouseRow).getByText('No disponible')).toBeInTheDocument()
    expect(screen.getByText('No se pudieron cargar las categorías.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar categorías' }))

    await waitFor(() => expect(within(screen.getByRole('row', { name: /Wireless mouse/ })).getByText('Peripherals')).toBeInTheDocument())
  })
})
