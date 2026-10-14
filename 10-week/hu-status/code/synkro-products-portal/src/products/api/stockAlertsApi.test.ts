import { apiClient, hostError } from '../../test-doubles/shellApiClient'
import { getProduct } from './productsApi'
import { listAllOpenAlerts, listStockAlerts } from './stockAlertsApi'

const alert = (n: number, productId = `p-${n}`) => ({
  alertId: `a-${n}`,
  productId,
  status: 'OPEN' as const,
  stockAtOpening: n,
  openedAt: '2026-10-10T15:49:00Z',
})

const page = (data: unknown[], pageNumber: number, totalPages: number, limit = 20) => ({
  data,
  meta: { page: pageNumber, limit, total: data.length, totalPages },
})

describe('stock alerts calls', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  describe('listStockAlerts', () => {
    it.each([
      ['OPEN', 'OPEN'],
      ['RESOLVED', 'RESOLVED'],
      [undefined, undefined],
    ] as const)('asks for the status %s through the host client', async (status, sent) => {
      apiClient.request.mockResolvedValue(page([], 1, 0))

      await listStockAlerts({ status, page: 2 })

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith('/api/v1/stock-alerts', {
        query: { page: 2, limit: 20, status: sent },
        signal: undefined,
      })
    })

    it('passes the signal so a superseded request can be aborted', async () => {
      apiClient.request.mockResolvedValue(page([], 1, 0))
      const controller = new AbortController()

      await listStockAlerts({ page: 1 }, { signal: controller.signal })

      expect(apiClient.request.mock.lastCall?.[1]?.signal).toBe(controller.signal)
    })

    it('returns the page as the service sent it', async () => {
      const answer = page([alert(1)], 1, 1)
      apiClient.request.mockResolvedValue(answer)

      expect(await listStockAlerts({ page: 1 })).toEqual(answer)
    })

    it('lets the host error through', async () => {
      apiClient.request.mockRejectedValue(hostError(403, { error: 'FORBIDDEN', message: 'no' }))

      await expect(listStockAlerts({ page: 1 })).rejects.toMatchObject({ status: 403 })
    })
  })

  describe('listAllOpenAlerts', () => {
    it('reads every page of the open alerts, 100 at a time', async () => {
      apiClient.request
        .mockResolvedValueOnce(page([alert(1), alert(2)], 1, 2, 100))
        .mockResolvedValueOnce(page([alert(3)], 2, 2, 100))

      const alerts = await listAllOpenAlerts()

      expect(alerts.map((item) => item.alertId)).toEqual(['a-1', 'a-2', 'a-3'])
      expect(apiClient.request.mock.calls.map(([, options]) => options?.query)).toEqual([
        { page: 1, limit: 100, status: 'OPEN' },
        { page: 2, limit: 100, status: 'OPEN' },
      ])
    })

    it('makes one request when there is a single page', async () => {
      apiClient.request.mockResolvedValue(page([alert(1)], 1, 1, 100))

      await listAllOpenAlerts()

      expect(apiClient.request).toHaveBeenCalledOnce()
    })

    it('answers an empty list when there are no alerts', async () => {
      apiClient.request.mockResolvedValue(page([], 1, 0, 100))

      expect(await listAllOpenAlerts()).toEqual([])
    })

    it('fails when any page fails, so a partial set is never shown as complete', async () => {
      apiClient.request.mockResolvedValueOnce(page([alert(1)], 1, 2, 100)).mockRejectedValueOnce(new Error('down'))

      await expect(listAllOpenAlerts()).rejects.toThrow('down')
    })
  })

  describe('getProduct', () => {
    it('reads one product by id through the host client', async () => {
      const product = { productId: 'p-1', name: 'Teclado', priceCents: 1, stock: 1, categoryId: 'c-1', active: true }
      apiClient.request.mockResolvedValue(product)

      expect(await getProduct('p-1')).toEqual(product)
      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith('/api/v1/products/p-1', { signal: undefined })
    })

    it('escapes the id in the path and passes the signal', async () => {
      apiClient.request.mockResolvedValue({})
      const controller = new AbortController()

      await getProduct('a/b', { signal: controller.signal })

      expect(apiClient.request).toHaveBeenCalledWith('/api/v1/products/a%2Fb', { signal: controller.signal })
    })
  })
})
