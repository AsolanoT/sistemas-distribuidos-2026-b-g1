import { buildRequestUrl, hostRequest } from './shellApiClient'

describe('shell/apiClient double', () => {
  describe('buildRequestUrl', () => {
    it('appends the query in order', () => {
      expect(buildRequestUrl('/api/v1/products', { page: 1, name: 'mouse', active: false })).toBe(
        '/api/v1/products?page=1&name=mouse&active=false',
      )
    })

    it('skips undefined and null values, as the host does', () => {
      expect(buildRequestUrl('/api/v1/products', { page: 1, name: undefined, categoryId: null })).toBe(
        '/api/v1/products?page=1',
      )
    })

    it('leaves the path alone when there is no query', () => {
      expect(buildRequestUrl('/api/v1/products')).toBe('/api/v1/products')
    })
  })

  describe('hostRequest', () => {
    it('rejects with the host CANCELLED shape when the signal aborts', async () => {
      const controller = new AbortController()
      const pending = hostRequest('/api/v1/products', { signal: controller.signal })

      controller.abort()

      await expect(pending).rejects.toMatchObject({ status: 0, body: { error: 'CANCELLED' } })
    })

    it('rejects straight away when the signal is already aborted', async () => {
      const controller = new AbortController()
      controller.abort()

      await expect(hostRequest('/api/v1/products', { signal: controller.signal })).rejects.toMatchObject({
        body: { error: 'CANCELLED' },
      })
    })
  })
})
