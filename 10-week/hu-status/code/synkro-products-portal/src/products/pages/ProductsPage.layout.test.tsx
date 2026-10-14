import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiClient } from '../../test-doubles/shellApiClient'
import { accessories, categoriesPage, mouse, peripherals, productsPage } from '../../test-doubles/productsFixtures'
import type { CategoryResponse } from '../model/category'
import type { Page } from '../model/page'
import type { ProductResponse } from '../model/product'
import { ProductsPage } from './ProductsPage'

const CATEGORIES_PATH = '/api/v1/products/categories'

type Count = number | 'fail'

// What the service answers right now. A test flips a field before it retries.
const service: {
  activeProducts: Count
  outOfStock: Count
  categories: CategoryResponse[] | 'fail'
  products: Page<ProductResponse> | 'fail'
} = { activeProducts: 12, outOfStock: 3, categories: [], products: productsPage([]) }

function serve(overrides: Partial<typeof service> = {}) {
  Object.assign(service, {
    activeProducts: 12,
    outOfStock: 3,
    categories: [peripherals, accessories],
    products: productsPage([mouse]),
    ...overrides,
  })
}

const answer = <T,>(value: T | 'fail') => (value === 'fail' ? Promise.reject(new Error('down')) : Promise.resolve(value))
const totalPage = (total: number) => ({ data: [], meta: { page: 1, limit: 1, total, totalPages: total } })

apiClient.request.mockImplementation((path: string, options) => {
  // No product is low on stock here: the open alerts are an empty list.
  if (path === '/api/v1/stock-alerts') return Promise.resolve({ data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 0 } })
  if (path === CATEGORIES_PATH) {
    return answer(service.categories === 'fail' ? 'fail' : categoriesPage(service.categories))
  }
  if (options?.query?.limit === 1) {
    const count = options.query.stockAtMost === 0 ? service.outOfStock : service.activeProducts
    return answer(count === 'fail' ? 'fail' : totalPage(count))
  }
  if (options?.query?.name === 'zzz') return Promise.resolve(productsPage([]))
  return answer(service.products)
})

const tile = (name: string) => screen.getByRole('listitem', { name })
const countRequests = (stockAtMost?: number) =>
  apiClient.request.mock.calls.filter(
    ([, options]) => options?.query?.limit === 1 && options.query.stockAtMost === stockAtMost,
  )
const listRequests = () =>
  apiClient.request.mock.calls.filter(([path, options]) => path === '/api/v1/products' && options?.query?.limit !== 1)

describe('ProductsPage: the design', () => {
  beforeEach(() => {
    apiClient.request.mockClear()
    serve()
  })

  it('has the page title and the Catálogo section', async () => {
    render(<ProductsPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'Productos' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Catálogo' })).toBeInTheDocument()
    await screen.findByRole('row', { name: /Wireless mouse/ })
  })

  it('goes from skeletons to data: the tiles and the table fill in', async () => {
    render(<ProductsPage />)

    expect(screen.getByRole('status')).toHaveTextContent('Cargando productos…')
    expect(tile('Productos activos')).toHaveAttribute('aria-busy', 'true')

    await waitFor(() => expect(tile('Productos activos')).toHaveTextContent('12'))
    expect(tile('Agotados')).toHaveTextContent('3')
    expect(tile('Categorías activas')).toHaveTextContent('1')
    expect(await screen.findByRole('row', { name: /Wireless mouse/ })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('counts the active products and the out-of-stock ones with one row each', async () => {
    render(<ProductsPage />)
    await screen.findByRole('row', { name: /Wireless mouse/ })

    expect(countRequests(undefined)[0][1]?.query).toEqual({ page: 1, limit: 1, active: true })
    expect(countRequests(0)[0][1]?.query).toEqual({ page: 1, limit: 1, active: true, stockAtMost: 0 })
  })

  it('counts the categories from the ones it already loads, without a request of its own', async () => {
    render(<ProductsPage />)
    await waitFor(() => expect(tile('Categorías activas')).toHaveTextContent('1'))

    expect(apiClient.request.mock.calls.filter(([path]) => path === CATEGORIES_PATH)).toHaveLength(1)
  })

  describe('when the table fails', () => {
    it('keeps the tiles, and the retry brings the table back without asking for the counts again', async () => {
      const user = userEvent.setup()
      serve({ products: 'fail' })
      render(<ProductsPage />)

      expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar los productos.')
      expect(tile('Productos activos')).toHaveTextContent('12')
      expect(tile('Agotados')).toHaveTextContent('3')

      serve({ products: productsPage([mouse]) })
      await user.click(screen.getByRole('button', { name: 'Reintentar' }))

      expect(await screen.findByRole('row', { name: /Wireless mouse/ })).toBeInTheDocument()
      expect(countRequests(undefined)).toHaveLength(1)
      expect(countRequests(0)).toHaveLength(1)
    })
  })

  describe('when a tile fails', () => {
    it('shows — and its own retry while the table works, and the retry asks only for that count', async () => {
      const user = userEvent.setup()
      serve({ outOfStock: 'fail' })
      render(<ProductsPage />)

      await screen.findByRole('row', { name: /Wireless mouse/ })
      await waitFor(() => expect(tile('Agotados')).toHaveTextContent('—'))
      expect(tile('Productos activos')).toHaveTextContent('12')

      serve({ outOfStock: 5 })
      await user.click(within(tile('Agotados')).getByRole('button', { name: 'Reintentar: Agotados' }))

      await waitFor(() => expect(tile('Agotados')).toHaveTextContent('5'))
      expect(countRequests(0)).toHaveLength(2)
      expect(countRequests(undefined)).toHaveLength(1)
      expect(listRequests()).toHaveLength(1)
    })

    it('shows the categories tile as — with a retry that loads the categories again', async () => {
      const user = userEvent.setup()
      serve({ categories: 'fail' })
      render(<ProductsPage />)
      await waitFor(() => expect(tile('Categorías activas')).toHaveTextContent('—'))
      expect(tile('Productos activos')).toHaveTextContent('12')

      serve({ categories: [peripherals] })
      await user.click(screen.getByRole('button', { name: 'Reintentar: Categorías activas' }))

      await waitFor(() => expect(tile('Categorías activas')).toHaveTextContent('1'))
    })
  })

  describe('an empty catalogue', () => {
    it('opens the registration form from the call to action', async () => {
      const user = userEvent.setup()
      serve({ products: productsPage([]) })
      render(<ProductsPage />)

      const catalogue = await screen.findByRole('region', { name: 'Catálogo' })
      await user.click(await within(catalogue).findByRole('button', { name: 'Nuevo producto' }))

      expect(screen.getByRole('form', { name: 'Nuevo producto' })).toBeInTheDocument()
      expect(within(screen.getByRole('form', { name: 'Nuevo producto' })).getByLabelText('Nombre')).toHaveFocus()
      expect(within(catalogue).queryByRole('button', { name: 'Nuevo producto' })).not.toBeInTheDocument()
    })
  })

  it('says no product matches when the filters find nothing, and offers no registration there', async () => {
    const user = userEvent.setup()
    render(<ProductsPage />)
    await screen.findByRole('row', { name: /Wireless mouse/ })

    await user.type(screen.getByLabelText('Nombre'), 'zzz{Enter}')

    expect(await screen.findByText('Ningún producto coincide con estos filtros')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Catálogo' })).queryByRole('button', { name: 'Nuevo producto' })).toBeNull()
  })

  it('has a keyboard order of header, tile retry, filters, table region, its row actions and pagination', async () => {
    const user = userEvent.setup()
    serve({ outOfStock: 'fail', products: { ...productsPage([mouse]), meta: { page: 1, limit: 20, total: 41, totalPages: 3 } } })
    render(<ProductsPage />)
    await screen.findByRole('region', { name: 'Tabla de productos' })
    await waitFor(() => expect(tile('Agotados')).toHaveTextContent('—'))

    const order = [
      screen.getByRole('button', { name: 'Nuevo producto' }),
      screen.getByRole('button', { name: 'Reintentar: Agotados' }),
      screen.getByLabelText('Nombre'),
      screen.getByRole('button', { name: 'Buscar' }),
      screen.getByLabelText('Categoría'),
      screen.getByLabelText('Estado'),
      screen.getByRole('region', { name: 'Tabla de productos' }),
      screen.getByRole('button', { name: 'Editar Wireless mouse' }),
      screen.getByRole('button', { name: 'Ajustar stock Wireless mouse' }),
      screen.getByRole('button', { name: 'Desactivar Wireless mouse' }),
      screen.getByRole('button', { name: 'Siguiente' }),
    ]
    for (const element of order) {
      await user.tab()
      expect(element).toHaveFocus()
    }
  })
})
