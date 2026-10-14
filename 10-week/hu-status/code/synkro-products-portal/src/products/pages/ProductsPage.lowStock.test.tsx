import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiClient } from '../../test-doubles/shellApiClient'
import { deferred } from '../../test-doubles/productsFixtures'
import { ALERTS_PATH, CatalogueService } from '../../test-doubles/catalogueService'
import type { ProductResponse } from '../model/product'
import type { StockAlertResponse } from '../model/stockAlert'
import { ProductsPage } from './ProductsPage'

const product = (n: number, name: string, stock: number): ProductResponse => ({
  productId: `p-${n}`,
  name,
  priceCents: 1000,
  stock,
  categoryId: 'c-1',
  active: true,
})

const keyboard = product(1, 'Teclado mecánico', 2)
const mouse = product(2, 'Mouse inalámbrico', 7)
const headset = product(3, 'Audífonos', 0)
const alert = (n: number, productId: string): StockAlertResponse => ({
  alertId: `a-${n}`,
  productId,
  status: 'OPEN',
  stockAtOpening: n,
  openedAt: '2026-10-10T15:49:00Z',
})

function start(overrides: { alerts?: StockAlertResponse[]; before?: (service: CatalogueService) => void } = {}) {
  const service = new CatalogueService({
    products: [keyboard, mouse, headset],
    categories: [{ categoryId: 'c-1', name: 'Periféricos', active: true }],
    alerts: [alert(1, 'p-1'), alert(3, 'p-3')],
    ...(overrides.alerts ? { alerts: overrides.alerts } : {}),
  })
  overrides.before?.(service)
  const user = userEvent.setup()
  render(<ProductsPage />)
  return { service, user }
}

const stockCell = (name: RegExp) => within(screen.getByRole('row', { name })).getAllByRole('cell')[3]
const alertReads = (service: CatalogueService) => service.requests('GET', ALERTS_PATH)
const failAlerts = (service: CatalogueService) =>
  service.rejectNextWhere((method, path) => method === 'GET' && path === ALERTS_PATH, 500, 'INTERNAL_ERROR', 'down')

describe('ProductsPage: Stock bajo', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  it('shows Stock bajo, with its number, for a product with an open alert and stock above zero', async () => {
    start()

    await waitFor(() => expect(within(stockCell(/Teclado/)).getByText('Stock bajo')).toBeInTheDocument())
    expect(within(stockCell(/Teclado/)).getByText('Stock bajo')).toHaveAttribute('data-tone', 'warning')
    expect(within(stockCell(/Teclado/)).getByText('2')).toBeInTheDocument()
  })

  it('keeps En stock for a product with no open alert', async () => {
    start()
    await waitFor(() => expect(within(stockCell(/Teclado/)).getByText('Stock bajo')).toBeInTheDocument())

    expect(within(stockCell(/Mouse/)).getByText('En stock')).toHaveAttribute('data-tone', 'success')
  })

  it('keeps Agotado at stock zero, even with an open alert', async () => {
    start()
    await waitFor(() => expect(within(stockCell(/Teclado/)).getByText('Stock bajo')).toBeInTheDocument())

    expect(within(stockCell(/Audífonos/)).getByText('Agotado')).toBeInTheDocument()
    expect(within(stockCell(/Audífonos/)).queryByText('Stock bajo')).not.toBeInTheDocument()
  })

  it('shows the table at once with En stock and Agotado, and upgrades it when the alerts arrive', async () => {
    const gate = deferred<void>()
    start({
      before: () => {
        const serve = apiClient.request.getMockImplementation()!
        apiClient.request.mockImplementation(async (path, options) => {
          if (path === ALERTS_PATH) await gate.promise
          return serve(path, options)
        })
      },
    })

    expect(await screen.findByRole('row', { name: /Teclado/ })).toBeInTheDocument()
    expect(within(stockCell(/Teclado/)).getByText('En stock')).toBeInTheDocument()
    gate.resolve()

    await waitFor(() => expect(within(stockCell(/Teclado/)).getByText('Stock bajo')).toBeInTheDocument())
  })

  it('asks for every open alert once, 100 at a time', async () => {
    const { service } = start()
    await waitFor(() => expect(within(stockCell(/Teclado/)).getByText('Stock bajo')).toBeInTheDocument())

    expect(alertReads(service)).toHaveLength(1)
    expect(alertReads(service)[0][1]?.query).toEqual({ page: 1, limit: 100, status: 'OPEN' })
  })

  describe('when the alerts cannot be loaded', () => {
    it('says so in a status above the table, and the table keeps working', async () => {
      start({ before: failAlerts })

      expect(await screen.findByText('No se pudo comprobar el stock bajo. La lista sigue disponible.')).toBeInTheDocument()
      expect(await screen.findByRole('row', { name: /Teclado/ })).toBeInTheDocument()
      expect(within(stockCell(/Teclado/)).getByText('En stock')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Editar Teclado mecánico' })).toBeEnabled()
    })

    it('recovers with Reintentar: the notice goes and the badges upgrade', async () => {
      const { user } = start({ before: failAlerts })
      await screen.findByText('No se pudo comprobar el stock bajo. La lista sigue disponible.')

      await user.click(screen.getByRole('button', { name: 'Reintentar' }))

      await waitFor(() => expect(within(stockCell(/Teclado/)).getByText('Stock bajo')).toBeInTheDocument())
      expect(screen.queryByText('No se pudo comprobar el stock bajo. La lista sigue disponible.')).not.toBeInTheDocument()
    })

    it('shows no notice while the alerts load, or when they load', async () => {
      start()
      await waitFor(() => expect(within(stockCell(/Teclado/)).getByText('Stock bajo')).toBeInTheDocument())

      expect(screen.queryByText(/No se pudo comprobar/)).not.toBeInTheDocument()
    })
  })

  it('asks for the alerts again after a stock adjustment', async () => {
    const { service, user } = start()
    await waitFor(() => expect(within(stockCell(/Teclado/)).getByText('Stock bajo')).toBeInTheDocument())
    const before = alertReads(service).length

    await user.click(screen.getByRole('button', { name: 'Ajustar stock Mouse inalámbrico' }))
    await user.type(screen.getByLabelText('Cantidad a ajustar'), '-1')
    await user.type(screen.getByLabelText('Motivo'), 'Venta')
    await user.click(screen.getByRole('button', { name: 'Ajustar stock' }))

    await waitFor(() => expect(alertReads(service).length).toBe(before + 1))
  })

  it('does not ask for the alerts again after an edit', async () => {
    const { service, user } = start()
    await waitFor(() => expect(within(stockCell(/Teclado/)).getByText('Stock bajo')).toBeInTheDocument())
    const before = alertReads(service).length

    await user.click(screen.getByRole('button', { name: 'Editar Mouse inalámbrico' }))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await waitFor(() => expect(screen.queryByRole('form', { name: 'Editar producto' })).not.toBeInTheDocument())

    expect(alertReads(service)).toHaveLength(before)
  })
})
