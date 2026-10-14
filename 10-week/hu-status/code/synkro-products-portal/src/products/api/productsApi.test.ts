import { apiClient, lastRequestUrl } from '../../test-doubles/shellApiClient'
import {
  accessories,
  categoriesPage,
  mouse,
  peripherals,
  productsPage,
} from '../../test-doubles/productsFixtures'
import { countProducts, listAllCategories, listCategories, listProducts } from './productsApi'

const emptyMeta = { page: 1, limit: 20, total: 0, totalPages: 0 }

describe('productsApi', () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch')

  beforeEach(() => {
    apiClient.request.mockReset()
    fetchSpy.mockClear()
  })

  describe('listProducts', () => {
    it("sends the request through the host's client to the products path", async () => {
      apiClient.request.mockResolvedValue({ data: [], meta: emptyMeta })

      await listProducts({ page: 1 })

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith('/api/v1/products', expect.any(Object))
    })

    it('asks for the first page of 20 when no filter is set', async () => {
      apiClient.request.mockResolvedValue({ data: [], meta: emptyMeta })

      await listProducts({ page: 1 })

      expect(lastRequestUrl()).toBe('/api/v1/products?page=1&limit=20')
    })

    it('builds the query from every filter that is set', async () => {
      apiClient.request.mockResolvedValue({ data: [], meta: emptyMeta })

      await listProducts({ page: 2, name: 'mouse', categoryId: 'c-1', active: false })

      expect(lastRequestUrl()).toBe('/api/v1/products?page=2&limit=20&name=mouse&categoryId=c-1&active=false')
    })

    it('trims the name and leaves it out when it is blank', async () => {
      apiClient.request.mockResolvedValue({ data: [], meta: emptyMeta })

      await listProducts({ page: 1, name: '  mouse ' })
      expect(lastRequestUrl()).toBe('/api/v1/products?page=1&limit=20&name=mouse')

      await listProducts({ page: 1, name: '   ' })
      expect(lastRequestUrl()).toBe('/api/v1/products?page=1&limit=20')
    })

    it('leaves out an empty category and an active filter that is not set', async () => {
      apiClient.request.mockResolvedValue({ data: [], meta: emptyMeta })

      await listProducts({ page: 1, categoryId: '', active: undefined })

      expect(lastRequestUrl()).toBe('/api/v1/products?page=1&limit=20')
    })

    it('passes the abort signal to the host', async () => {
      apiClient.request.mockResolvedValue({ data: [], meta: emptyMeta })
      const controller = new AbortController()

      await listProducts({ page: 1 }, { signal: controller.signal })

      const [, options] = apiClient.request.mock.lastCall ?? []
      expect(options?.signal).toBe(controller.signal)
    })

    it('resolves with the typed products and page metadata', async () => {
      const page = productsPage([mouse])
      apiClient.request.mockResolvedValue(page)

      const response = await listProducts({ page: 1 })

      expect(response).toEqual(page)
      expectTypeOf(response.data[0].priceCents).toEqualTypeOf<number>()
      expectTypeOf(response.meta.totalPages).toEqualTypeOf<number>()
    })

    it("lets the host's error reach the caller untouched", async () => {
      const failure = new Error('host-mapped error')
      apiClient.request.mockRejectedValue(failure)

      await expect(listProducts({ page: 1 })).rejects.toBe(failure)
    })

    it('never calls fetch itself', async () => {
      apiClient.request.mockResolvedValue({ data: [], meta: emptyMeta })

      await listProducts({ page: 1 })

      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })

  describe('countProducts', () => {
    it('asks for a single row, because only the total is needed', async () => {
      apiClient.request.mockResolvedValue({ data: [], meta: { ...emptyMeta, limit: 1, total: 12 } })

      await countProducts({ active: true })

      expect(lastRequestUrl()).toBe('/api/v1/products?page=1&limit=1&active=true')
    })

    it('sends stockAtMost, including zero', async () => {
      apiClient.request.mockResolvedValue({ data: [], meta: { ...emptyMeta, limit: 1, total: 2 } })

      await countProducts({ active: true, stockAtMost: 0 })

      expect(lastRequestUrl()).toBe('/api/v1/products?page=1&limit=1&active=true&stockAtMost=0')
    })

    it('resolves with meta.total', async () => {
      apiClient.request.mockResolvedValue({ data: [mouse], meta: { page: 1, limit: 1, total: 37, totalPages: 37 } })

      await expect(countProducts({ active: true })).resolves.toBe(37)
    })

    it('passes the abort signal to the host', async () => {
      apiClient.request.mockResolvedValue({ data: [], meta: emptyMeta })
      const controller = new AbortController()

      await countProducts({ active: true }, { signal: controller.signal })

      expect(apiClient.request.mock.lastCall?.[1]?.signal).toBe(controller.signal)
    })
  })

  describe('listCategories', () => {
    it('lists one page of categories with the page and limit', async () => {
      apiClient.request.mockResolvedValue(categoriesPage([peripherals], 1))

      await listCategories({ page: 1, limit: 100 })

      expect(lastRequestUrl()).toBe('/api/v1/products/categories?page=1&limit=100')
    })

    it('sends the active filter only when it is set', async () => {
      apiClient.request.mockResolvedValue(categoriesPage([peripherals], 1))

      await listCategories({ page: 1, limit: 100, active: true })

      expect(lastRequestUrl()).toBe('/api/v1/products/categories?page=1&limit=100&active=true')
    })

    it('resolves with the typed categories and page metadata', async () => {
      const page = categoriesPage([peripherals], 1)
      apiClient.request.mockResolvedValue(page)

      const response = await listCategories({ page: 1, limit: 100 })

      expect(response).toEqual(page)
      expectTypeOf(response.data[0].categoryId).toEqualTypeOf<string>()
    })
  })

  describe('listAllCategories', () => {
    it('reads every page and returns the categories in order', async () => {
      apiClient.request
        .mockResolvedValueOnce(categoriesPage([peripherals], 2))
        .mockResolvedValueOnce(categoriesPage([accessories], 2))

      const categories = await listAllCategories()

      expect(categories).toEqual([peripherals, accessories])
      expect(apiClient.request).toHaveBeenCalledTimes(2)
      expect(lastRequestUrl()).toBe('/api/v1/products/categories?page=2&limit=100')
    })

    it('reads a single page when there is only one', async () => {
      apiClient.request.mockResolvedValueOnce(categoriesPage([peripherals], 1))

      await expect(listAllCategories()).resolves.toEqual([peripherals])
      expect(apiClient.request).toHaveBeenCalledTimes(1)
    })

    it('returns no categories after one read when there are none', async () => {
      apiClient.request.mockResolvedValueOnce(categoriesPage([], 0))

      await expect(listAllCategories()).resolves.toEqual([])
      expect(apiClient.request).toHaveBeenCalledTimes(1)
    })

    it('passes the abort signal on every page', async () => {
      apiClient.request
        .mockResolvedValueOnce(categoriesPage([peripherals], 2))
        .mockResolvedValueOnce(categoriesPage([accessories], 2))
      const controller = new AbortController()

      await listAllCategories({ signal: controller.signal })

      for (const [, options] of apiClient.request.mock.calls) {
        expect(options?.signal).toBe(controller.signal)
      }
    })
  })
})
