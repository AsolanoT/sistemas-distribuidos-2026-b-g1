import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiClient } from '../../test-doubles/shellApiClient'
import { CATEGORIES_PATH, CatalogueService, PRODUCTS_PATH } from '../../test-doubles/catalogueService'
import type { CategoryResponse } from '../model/category'
import type { ProductResponse } from '../model/product'
import { StockLookupPage } from './StockLookupPage'

const periph: CategoryResponse = { categoryId: 'c-1', name: 'Periféricos', active: true }
const audio: CategoryResponse = { categoryId: 'c-2', name: 'Audio', active: true }
const retired: CategoryResponse = { categoryId: 'c-3', name: 'Retirados', active: false }

const keyboard: ProductResponse = { productId: 'p-1', name: 'Teclado mecánico', priceCents: 1250050, stock: 2, categoryId: 'c-1', active: true }
const mouse: ProductResponse = { productId: 'p-2', name: 'Mouse inalámbrico', priceCents: 99900, stock: 7, categoryId: 'c-1', active: true }
const headset: ProductResponse = { productId: 'p-3', name: 'Audífonos', priceCents: 18990000, stock: 0, categoryId: 'c-2', active: true }
const old: ProductResponse = { productId: 'p-4', name: 'Mouse viejo', priceCents: 5000, stock: 4, categoryId: 'c-3', active: false }

function start(
  overrides: { products?: ProductResponse[]; pageSize?: number; before?: (service: CatalogueService) => void } = {},
) {
  const { before, ...serviceOptions } = overrides
  const service = new CatalogueService({
    products: [keyboard, mouse, headset, old],
    categories: [periph, audio, retired],
    ...serviceOptions,
  })
  before?.(service)
  const user = userEvent.setup()
  render(<StockLookupPage />)
  return { service, user }
}

const tile = (name: string) => screen.getByRole('listitem', { name })
const productReads = (service: CatalogueService) => service.requests('GET', PRODUCTS_PATH)

describe('StockLookupPage', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  describe('the screen', () => {
    it('is titled Existencias', () => {
      start()

      expect(screen.getByRole('heading', { level: 1, name: 'Existencias' })).toBeInTheDocument()
    })

    it('shows the three tiles: sellable, in stock and sold out', async () => {
      start()

      await waitFor(() => expect(within(tile('Productos vendibles')).getByText('3')).toBeInTheDocument())
      expect(within(tile('En stock')).getByText('2')).toBeInTheDocument()
      expect(within(tile('Agotados')).getByText('1')).toBeInTheDocument()
    })

    it('lists the active products only, with the four columns of the lookup', async () => {
      start()

      expect(await screen.findByRole('row', { name: /Teclado mecánico/ })).toBeInTheDocument()
      expect(screen.queryByRole('row', { name: /Mouse viejo/ })).not.toBeInTheDocument()
      expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
        'Producto',
        'Categoría',
        'Precio',
        'Stock',
      ])
    })

    it('shows only En stock and Agotado, with the number next to the badge', async () => {
      start()

      const sold = await screen.findByRole('row', { name: /Audífonos/ })
      expect(within(sold).getByText('Agotado')).toBeInTheDocument()
      expect(within(screen.getByRole('row', { name: /Teclado/ })).getByText('En stock')).toBeInTheDocument()
      expect(screen.queryByText('Stock bajo')).not.toBeInTheDocument()
    })

    it('has no actions, no registration, no forms and no categories section', async () => {
      start()
      await screen.findByRole('row', { name: /Teclado mecánico/ })

      expect(screen.queryByRole('button', { name: /Nuevo producto|Editar|Ajustar|Desactivar/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Categorías' })).not.toBeInTheDocument()
      expect(screen.queryByRole('form', { name: /producto|stock|categoría/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('columnheader', { name: /Acciones|Estado/ })).not.toBeInTheDocument()
    })
  })

  describe('what it asks the service', () => {
    it('always asks for active products, in the list and in the counts', async () => {
      const { service, user } = start()
      await screen.findByRole('row', { name: /Teclado mecánico/ })
      await user.type(screen.getByLabelText('Nombre'), 'Mouse')
      await user.click(screen.getByRole('button', { name: 'Buscar' }))
      await waitFor(() => expect(productReads(service).some(([, options]) => options?.query?.name === 'Mouse')).toBe(true))

      expect(productReads(service).length).toBeGreaterThan(3)
      for (const [, options] of productReads(service)) expect(options?.query?.active).toBe(true)
    })

    it('never asks for stock alerts, which a salesperson may not read', async () => {
      start()
      await screen.findByRole('row', { name: /Teclado mecánico/ })

      expect(apiClient.request.mock.calls.filter(([path]) => String(path).includes('stock-alerts'))).toEqual([])
    })

    it('asks for the categories once, like the list', async () => {
      const { service } = start()
      await screen.findByRole('row', { name: /Teclado mecánico/ })

      expect(service.requests('GET', CATEGORIES_PATH)).toHaveLength(1)
    })
  })

  describe('searching', () => {
    it('searches by name with Buscar', async () => {
      const { user } = start()
      await screen.findByRole('row', { name: /Teclado mecánico/ })

      await user.type(screen.getByLabelText('Nombre'), 'teclado')
      await user.click(screen.getByRole('button', { name: 'Buscar' }))

      await waitFor(() => expect(screen.queryByRole('row', { name: /Mouse inal/ })).not.toBeInTheDocument())
      expect(screen.getByRole('row', { name: /Teclado mecánico/ })).toBeInTheDocument()
    })

    it('offers active categories only, and no status filter', async () => {
      start()
      await screen.findByRole('row', { name: /Teclado mecánico/ })

      const options = within(screen.getByLabelText('Categoría')).getAllByRole('option').map((option) => option.textContent)
      expect(options).toEqual(['Todas las categorías', 'Periféricos', 'Audio'])
      expect(screen.queryByLabelText('Estado')).not.toBeInTheDocument()
    })

    it('filters by category', async () => {
      const { user } = start()
      await screen.findByRole('row', { name: /Teclado mecánico/ })

      await user.selectOptions(screen.getByLabelText('Categoría'), 'Audio')

      expect(await screen.findByRole('row', { name: /Audífonos/ })).toBeInTheDocument()
      expect(screen.queryByRole('row', { name: /Teclado/ })).not.toBeInTheDocument()
    })
  })

  describe('its four states', () => {
    it('shows skeleton rows and says it is loading', () => {
      start()

      expect(screen.getByRole('status')).toHaveTextContent('Cargando productos…')
    })

    it('shows an error with a retry, and the retry asks again', async () => {
      const { user } = start({
        before: (service) =>
          service.rejectNextWhere(
            (method, path, options) => method === 'GET' && path === PRODUCTS_PATH && options.query?.limit !== 1,
            500,
            'INTERNAL_ERROR',
            'down',
          ),
      })

      expect(await screen.findByText('No se pudieron cargar los productos.')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Reintentar' }))

      expect(await screen.findByRole('row', { name: /Teclado mecánico/ })).toBeInTheDocument()
    })

    it('says there are no products available when the catalogue has none, and offers nothing to do', async () => {
      start({ products: [] })

      expect(await screen.findByText('Aún no hay productos disponibles')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Nuevo producto/ })).not.toBeInTheDocument()
    })

    it('says no product matches the search when a search finds nothing', async () => {
      const { user } = start()
      await screen.findByRole('row', { name: /Teclado mecánico/ })

      await user.type(screen.getByLabelText('Nombre'), 'zzz')
      await user.click(screen.getByRole('button', { name: 'Buscar' }))

      expect(await screen.findByText('Ningún producto coincide con la búsqueda')).toBeInTheDocument()
    })

    it('paginates by 20', async () => {
      const many = Array.from({ length: 25 }, (_, index) => ({ ...keyboard, productId: `p-${index}`, name: `Producto ${index}` }))
      const { service, user } = start({ products: many, pageSize: 20 })
      await screen.findByRole('row', { name: /Producto 0/ })

      expect(screen.getByText('Página 1 de 2')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Siguiente' }))

      expect(await screen.findByText('Página 2 de 2')).toBeInTheDocument()
      const lists = productReads(service).filter(([, options]) => options?.query?.limit !== 1)
      expect(lists.at(-1)?.[1]?.query).toMatchObject({ page: 2, limit: 20, active: true })
    })
  })

  describe('when a count fails', () => {
    function failOutOfStockCount(service: CatalogueService) {
      service.rejectNextWhere(
        (method, path, options) => method === 'GET' && path === PRODUCTS_PATH && options.query?.stockAtMost === 0,
        500,
        'INTERNAL_ERROR',
        'down',
      )
    }

    it('shows a dash with a named retry only on the tiles that need that count', async () => {
      start({ before: failOutOfStockCount })

      expect(await screen.findByRole('button', { name: 'Reintentar: Agotados' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reintentar: En stock' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Reintentar: Productos vendibles' })).not.toBeInTheDocument()
      expect(within(tile('Productos vendibles')).getByText('3')).toBeInTheDocument()
      expect(await screen.findByRole('row', { name: /Teclado mecánico/ })).toBeInTheDocument()
    })

    it('recovers the tiles with the retry of En stock, which needs both counts', async () => {
      const { user } = start({ before: failOutOfStockCount })

      await user.click(await screen.findByRole('button', { name: 'Reintentar: En stock' }))

      await waitFor(() => expect(within(tile('En stock')).getByText('2')).toBeInTheDocument())
      expect(within(tile('Agotados')).getByText('1')).toBeInTheDocument()
    })

    it('recovers the tiles with the retry of Agotados', async () => {
      const { user } = start({ before: failOutOfStockCount })

      await user.click(await screen.findByRole('button', { name: 'Reintentar: Agotados' }))

      await waitFor(() => expect(within(tile('Agotados')).getByText('1')).toBeInTheDocument())
      expect(within(tile('En stock')).getByText('2')).toBeInTheDocument()
    })
  })
})
