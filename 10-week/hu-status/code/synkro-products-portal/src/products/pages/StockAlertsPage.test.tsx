import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiClient } from '../../test-doubles/shellApiClient'
import { deferred } from '../../test-doubles/productsFixtures'
import { ALERTS_PATH, CATEGORIES_PATH, CatalogueService, PRODUCTS_PATH } from '../../test-doubles/catalogueService'
import type { ProductResponse } from '../model/product'
import type { StockAlertResponse } from '../model/stockAlert'
import { StockAlertsPage } from './StockAlertsPage'

const product = (n: number, name: string): ProductResponse => ({
  productId: `p-${n}`,
  name,
  priceCents: 1000,
  stock: n,
  categoryId: 'c-1',
  active: true,
})

const keyboard = product(1, 'Teclado mecánico')
const mouse = product(2, 'Mouse inalámbrico')
const cable = product(3, 'Cable HDMI & más')

const alert = (n: number, productId: string, over: Partial<StockAlertResponse> = {}): StockAlertResponse => ({
  alertId: `a-${n}`,
  productId,
  status: 'OPEN',
  stockAtOpening: n,
  openedAt: '2026-10-10T15:49:00Z',
  ...over,
})

const openKeyboard = alert(1, 'p-1')
const openMouse = alert(2, 'p-2', { openedAt: '2026-10-11T08:05:00Z' })
const resolvedCable = alert(3, 'p-3', { status: 'RESOLVED', openedAt: '2026-10-09T10:00:00Z', resolvedAt: '2026-10-12T20:30:00Z' })

function start(overrides: { alerts?: StockAlertResponse[]; products?: ProductResponse[]; pageSize?: number; before?: (service: CatalogueService) => void } = {}) {
  const { before, ...options } = overrides
  const service = new CatalogueService({
    products: [keyboard, mouse, cable],
    categories: [],
    alerts: [openKeyboard, openMouse, resolvedCable],
    ...options,
  })
  before?.(service)
  const user = userEvent.setup()
  render(<StockAlertsPage timeZone="UTC" />)
  return { service, user }
}

const alertReads = (service: CatalogueService) => service.requests('GET', ALERTS_PATH)
const productReads = (service: CatalogueService) => service.requests('GET', /\/api\/v1\/products\/[^/]+$/)

describe('StockAlertsPage', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })
  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  describe('the screen', () => {
    it('has the title and the subtitle', () => {
      start()

      expect(screen.getByRole('heading', { level: 1, name: 'Alertas de stock' })).toBeInTheDocument()
      expect(
        screen.getByText('Se abren automáticamente cuando el stock de un producto baja al umbral o por debajo.'),
      ).toBeInTheDocument()
    })

    it('has the five columns, and no actions: the worker opens and resolves alerts', async () => {
      start()
      await screen.findByRole('row', { name: /Teclado mecánico/ })

      expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
        'Producto',
        'Stock al abrir',
        'Estado',
        'Abierta el',
        'Resuelta el',
      ])
      expect(screen.queryAllByRole('button', { name: /resolver|editar|ajustar|desactivar/i })).toEqual([])
    })

    it('shows the open alerts by default, newest first as the service gives them', async () => {
      start()

      await screen.findByRole('row', { name: /Teclado mecánico/ })
      const names = screen.getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[0].textContent)
      expect(names).toEqual(['Teclado mecánico', 'Mouse inalámbrico'])
    })

    it('shows the stock at opening, the dates in Spanish and a dash for an open alert', async () => {
      start()

      const cells = within(await screen.findByRole('row', { name: /Teclado mecánico/ })).getAllByRole('cell')
      expect(cells[1]).toHaveTextContent('1')
      expect(cells[3].textContent?.replace(/[  ]/g, ' ')).toBe('10/10/2026, 3:49 p. m.')
      expect(cells[4]).toHaveTextContent('—')
    })

    it('shows a resolved alert with its resolution date, and the Resuelta badge', async () => {
      const { user } = start()
      await screen.findByRole('row', { name: /Teclado mecánico/ })

      await user.selectOptions(screen.getByLabelText('Estado'), 'Resueltas')

      const cells = within(await screen.findByRole('row', { name: /Cable HDMI/ })).getAllByRole('cell')
      expect(within(cells[2]).getByText('Resuelta')).toHaveAttribute('data-tone', 'success')
      expect(cells[4].textContent?.replace(/[  ]/g, ' ')).toBe('12/10/2026, 8:30 p. m.')
    })

    it('shows an open alert as Abierta, in the warning tone, with the label as text', async () => {
      start()

      const cells = within(await screen.findByRole('row', { name: /Teclado mecánico/ })).getAllByRole('cell')
      expect(within(cells[2]).getByText('Abierta')).toHaveAttribute('data-tone', 'warning')
    })
  })

  describe('the Estado filter', () => {
    it('offers Abiertas, Resueltas and Todas, starting on Abiertas', () => {
      start()

      const select = screen.getByLabelText('Estado')
      expect([...select.querySelectorAll('option')].map((option) => option.textContent)).toEqual(['Abiertas', 'Resueltas', 'Todas'])
      expect(select).toHaveValue('open')
    })

    it.each([
      ['Abiertas', 'OPEN'],
      ['Resueltas', 'RESOLVED'],
      ['Todas', undefined],
    ])('asks the service for the status of "%s"', async (label, status) => {
      const { service, user } = start()
      await screen.findByRole('row', { name: /Teclado mecánico/ })
      if (label === 'Abiertas') {
        expect(alertReads(service)[0][1]?.query?.status).toBe('OPEN')
        return
      }

      await user.selectOptions(screen.getByLabelText('Estado'), label)

      await waitFor(() => expect(alertReads(service).at(-1)?.[1]?.query?.status).toBe(status))
    })

    it('shows everything with Todas', async () => {
      const { user } = start()
      await screen.findByRole('row', { name: /Teclado mecánico/ })

      await user.selectOptions(screen.getByLabelText('Estado'), 'Todas')

      expect(await screen.findByRole('row', { name: /Cable HDMI/ })).toBeInTheDocument()
      expect(screen.getAllByRole('row')).toHaveLength(4)
    })

    it('returns to the first page when it changes', async () => {
      const many = Array.from({ length: 25 }, (_, index) => alert(index + 10, 'p-1'))
      const { service, user } = start({ alerts: many, pageSize: 20 })
      await screen.findByText('Página 1 de 2')
      await user.click(screen.getByRole('button', { name: 'Siguiente' }))
      await screen.findByText('Página 2 de 2')

      await user.selectOptions(screen.getByLabelText('Estado'), 'Todas')

      await screen.findByText('Página 1 de 2')
      expect(alertReads(service).at(-1)?.[1]?.query).toMatchObject({ page: 1, limit: 20 })
    })
  })

  describe('the product names', () => {
    it('says Cargando… while a name loads, then shows it', async () => {
      const gate = deferred<void>()
      start({
        before: () => {
          const serve = apiClient.request.getMockImplementation()!
          apiClient.request.mockImplementation(async (path, options) => {
            if (path.startsWith(`${PRODUCTS_PATH}/p-`)) await gate.promise
            return serve(path, options)
          })
        },
      })

      expect(await screen.findAllByText('Cargando…')).toHaveLength(2)
      gate.resolve()

      expect(await screen.findByRole('row', { name: /Teclado mecánico/ })).toBeInTheDocument()
      expect(screen.queryByText('Cargando…')).not.toBeInTheDocument()
    })

    it('asks only for the products of the alerts on the page, once each', async () => {
      const { service } = start({ alerts: [openKeyboard, alert(9, 'p-1'), openMouse] })
      await screen.findByRole('row', { name: /Mouse inal/ })

      expect(productReads(service).map(([path]) => path)).toEqual([`${PRODUCTS_PATH}/p-1`, `${PRODUCTS_PATH}/p-2`])
    })

    it('does not ask for the products of the other pages', async () => {
      const many = Array.from({ length: 25 }, (_, index) => alert(index + 10, index < 20 ? 'p-1' : 'p-2'))
      const { service } = start({ alerts: many, pageSize: 20 })
      await screen.findByText('Página 1 de 2')

      await waitFor(() => expect(productReads(service)).toHaveLength(1))
      expect(productReads(service)[0][0]).toBe(`${PRODUCTS_PATH}/p-1`)
    })

    it('keeps the names it already has when the page changes', async () => {
      const many = Array.from({ length: 25 }, (_, index) => alert(index + 10, 'p-1'))
      const { service, user } = start({ alerts: many, pageSize: 20 })
      await screen.findAllByRole('row', { name: /Teclado mecánico/ })

      await user.click(screen.getByRole('button', { name: 'Siguiente' }))
      await screen.findByText('Página 2 de 2')
      await user.click(screen.getByRole('button', { name: 'Anterior' }))

      expect((await screen.findAllByRole('row', { name: /Teclado mecánico/ })).length).toBeGreaterThan(0)
      expect(productReads(service)).toHaveLength(1)
    })

    it('shows Producto no disponible, without a link, for a product that cannot be loaded, and the rest works', async () => {
      start({
        before: (service) =>
          service.rejectNextWhere((method, path) => method === 'GET' && path === `${PRODUCTS_PATH}/p-1`, 404, 'NOT_FOUND', 'Product not found'),
      })

      expect(await screen.findByText('Producto no disponible')).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Producto no disponible' })).not.toBeInTheDocument()
      expect(await screen.findByRole('link', { name: 'Mouse inalámbrico' })).toBeInTheDocument()
      expect(screen.getAllByRole('row')).toHaveLength(3)
    })

    it('links each name to the product in /products, filtered by name', async () => {
      start({ products: [keyboard, mouse, cable], alerts: [alert(5, 'p-3')] })

      const link = await screen.findByRole('link', { name: 'Cable HDMI & más' })

      expect(link).toHaveAttribute('href', `/products?name=${encodeURIComponent('Cable HDMI & más')}`)
    })

    it('navigates to the product list on a plain click, without a document load', async () => {
      const { user } = start()

      await user.click(await screen.findByRole('link', { name: 'Teclado mecánico' }))

      expect(window.location.pathname + window.location.search).toBe(`/products?name=${encodeURIComponent('Teclado mecánico')}`)
    })
  })

  describe('its four states', () => {
    it('shows skeleton rows and says it is loading', () => {
      start()

      expect(screen.getByRole('status')).toHaveTextContent('Cargando alertas…')
    })

    it('shows an error banner with a retry', async () => {
      const { user } = start({
        before: (service) => service.rejectNextWhere((method, path) => method === 'GET' && path === ALERTS_PATH, 500, 'INTERNAL_ERROR', 'down'),
      })

      expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las alertas.')
      await user.click(screen.getByRole('button', { name: 'Reintentar' }))

      expect(await screen.findByRole('row', { name: /Teclado mecánico/ })).toBeInTheDocument()
    })

    it('says there are no open alerts for the Abiertas filter', async () => {
      start({ alerts: [resolvedCable] })

      expect(await screen.findByText('No hay alertas abiertas por ahora')).toBeInTheDocument()
    })

    it('says there are no alerts registered for the other filters', async () => {
      const { user } = start({ alerts: [] })
      await screen.findByText('No hay alertas abiertas por ahora')

      await user.selectOptions(screen.getByLabelText('Estado'), 'Todas')

      expect(await screen.findByText('Aún no hay alertas registradas')).toBeInTheDocument()
    })

    it('offers no call to action in the empty state', async () => {
      start({ alerts: [] })
      await screen.findByText('No hay alertas abiertas por ahora')

      expect(screen.queryAllByRole('button')).toEqual([])
    })

    it('paginates by 20', async () => {
      const many = Array.from({ length: 25 }, (_, index) => alert(index + 10, 'p-1'))
      const { service, user } = start({ alerts: many, pageSize: 20 })
      await screen.findByText('Página 1 de 2')

      await user.click(screen.getByRole('button', { name: 'Siguiente' }))

      await screen.findByText('Página 2 de 2')
      expect(alertReads(service).at(-1)?.[1]?.query).toMatchObject({ page: 2, limit: 20, status: 'OPEN' })
    })
  })

  it('asks only for alerts and products, never for categories', async () => {
    const { service } = start()
    await screen.findByRole('row', { name: /Teclado mecánico/ })

    expect(service.requests('GET', CATEGORIES_PATH)).toHaveLength(0)
  })
})
