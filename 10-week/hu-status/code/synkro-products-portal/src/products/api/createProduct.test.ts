import { apiClient, hostError } from '../../test-doubles/shellApiClient'
import { mouse } from '../../test-doubles/productsFixtures'
import { registrationCopy } from '../model/registrationCopy'
import { createProduct } from './createProduct'

const product = { name: 'Wireless mouse', priceCents: 123_456, categoryId: 'c-1' }
const KEY = '3f2a9c1e-8b7d-4e5f-9a6b-1c2d3e4f5a6b'

describe('createProduct', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  describe('the request', () => {
    it("posts the product through the host's client with the idempotency key", async () => {
      apiClient.request.mockResolvedValue(mouse)

      await createProduct(product, KEY)

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith('/api/v1/products', {
        method: 'POST',
        body: { name: 'Wireless mouse', priceCents: 123_456, categoryId: 'c-1' },
        idempotencyKey: KEY,
      })
    })

    it('sends only name, priceCents and categoryId, never stock', async () => {
      apiClient.request.mockResolvedValue(mouse)

      await createProduct(product, KEY)

      const [, options] = apiClient.request.mock.lastCall ?? []
      expect(Object.keys(options?.body as object).sort()).toEqual(['categoryId', 'name', 'priceCents'])
    })
  })

  describe('success', () => {
    it('returns the created product', async () => {
      apiClient.request.mockResolvedValue(mouse)

      expect(await createProduct(product, KEY)).toEqual({ ok: true, product: mouse })
    })

    it('returns the same product when the service replays an earlier answer', async () => {
      apiClient.request.mockResolvedValue(mouse)

      const first = await createProduct(product, KEY)
      const replay = await createProduct(product, KEY)

      expect(replay).toEqual(first)
    })
  })

  describe('400 with details', () => {
    it('puts each message on its own field, as the service wrote it', async () => {
      apiClient.request.mockRejectedValue(
        hostError(400, {
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [
            { field: 'name', message: 'name is required' },
            { field: 'priceCents', message: 'must be at least 1' },
            { field: 'categoryId', message: 'must be a UUID' },
          ],
        }),
      )

      expect(await createProduct(product, KEY)).toEqual({
        ok: false,
        failure: {
          fieldErrors: { name: 'name is required', price: 'must be at least 1', categoryId: 'must be a UUID' },
          alert: null,
        },
      })
    })

    it('keeps a message about a field the form does not have in the form alert', async () => {
      apiClient.request.mockRejectedValue(
        hostError(400, {
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [
            { field: 'name', message: 'name is required' },
            { field: 'stock', message: 'unknown field' },
          ],
        }),
      )

      expect(await createProduct(product, KEY)).toEqual({
        ok: false,
        failure: {
          fieldErrors: { name: 'name is required' },
          alert: { title: registrationCopy.notRegistered, detail: 'unknown field' },
        },
      })
    })

    it('shows a form alert with the service message when there are no details', async () => {
      apiClient.request.mockRejectedValue(
        hostError(400, { error: 'VALIDATION_ERROR', message: 'Idempotency-Key header is required' }),
      )

      expect(await createProduct(product, KEY)).toEqual({
        ok: false,
        failure: {
          fieldErrors: {},
          alert: { title: registrationCopy.notRegistered, detail: 'Idempotency-Key header is required' },
        },
      })
    })
  })

  describe('404', () => {
    it('blames the category: it is missing or inactive', async () => {
      apiClient.request.mockRejectedValue(hostError(404, { error: 'NOT_FOUND', message: 'Resource not found' }))

      expect(await createProduct(product, KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: { categoryId: registrationCopy.categoryNotFound }, alert: null },
      })
    })
  })

  describe('422 and anything else', () => {
    it.each([
      [422, 'BUSINESS_RULE_VIOLATION', 'The product breaks a business rule'],
      [403, 'FORBIDDEN', 'Role is not authorized'],
      [500, 'INTERNAL_ERROR', 'Unexpected error'],
    ])('answers %i with a form alert carrying the service message', async (status, error, message) => {
      apiClient.request.mockRejectedValue(hostError(status, { error, message }))

      expect(await createProduct(product, KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: registrationCopy.notRegistered, detail: message } },
      })
    })

    it('says the server could not be reached when the host reports status 0', async () => {
      apiClient.request.mockRejectedValue(hostError(0, { error: 'NETWORK_ERROR', message: 'Network error' }))

      expect(await createProduct(product, KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: registrationCopy.offline } },
      })
    })

    it('treats a timeout like any other lost connection', async () => {
      apiClient.request.mockRejectedValue(hostError(0, { error: 'TIMEOUT', message: 'Request timed out' }))

      expect(await createProduct(product, KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: registrationCopy.offline } },
      })
    })

    it('still reports a failure when the rejection is not the host error shape', async () => {
      apiClient.request.mockRejectedValue(new TypeError('boom'))

      expect(await createProduct(product, KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: registrationCopy.notRegistered } },
      })
    })
  })
})
