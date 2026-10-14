import { apiClient, hostError } from '../../test-doubles/shellApiClient'
import { mouse } from '../../test-doubles/productsFixtures'
import { managementCopy } from '../model/managementCopy'
import { registrationCopy } from '../model/registrationCopy'
import { createStockAdjustment, deactivateProduct, updateProduct } from './productManagement'

const KEY = '3f2a9c1e-8b7d-4e5f-9a6b-1c2d3e4f5a6b'
const update = { name: 'Wireless mouse 2', priceCents: 99_900, categoryId: 'c-1' }
const adjustment = { delta: -3, reason: 'Daño en bodega' }

const adjustmentResponse = {
  adjustmentId: 'a-1',
  productId: 'p-1',
  delta: -3,
  reason: 'Daño en bodega',
  adjustedBy: 'u-1',
  adjustedAt: '2026-10-10T10:00:00Z',
  currentStock: 4,
}

function reject(status: number, error: string, message: string, details?: { field: string; message: string }[]) {
  apiClient.request.mockRejectedValue(hostError(status, { error, message, details }))
}

describe('product management calls', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  describe('updateProduct', () => {
    it("puts name, priceCents and categoryId through the host's client, with no idempotency key", async () => {
      apiClient.request.mockResolvedValue(mouse)

      await updateProduct('p-1', update)

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith('/api/v1/products/p-1', {
        method: 'PUT',
        body: { name: 'Wireless mouse 2', priceCents: 99_900, categoryId: 'c-1' },
      })
    })

    it('never sends stock', async () => {
      apiClient.request.mockResolvedValue(mouse)

      await updateProduct('p-1', { ...update, stock: 99 } as typeof update)

      const [, options] = apiClient.request.mock.lastCall ?? []
      expect(Object.keys(options?.body as object).sort()).toEqual(['categoryId', 'name', 'priceCents'])
    })

    it('returns the updated product', async () => {
      apiClient.request.mockResolvedValue(mouse)

      expect(await updateProduct('p-1', update)).toEqual({ ok: true, value: mouse })
    })

    it('puts each 400 detail on its own field', async () => {
      reject(400, 'VALIDATION_ERROR', 'Invalid', [
        { field: 'name', message: 'too long' },
        { field: 'priceCents', message: 'must be positive' },
      ])

      expect(await updateProduct('p-1', update)).toEqual({
        ok: false,
        failure: { fieldErrors: { name: 'too long', price: 'must be positive' }, alert: null },
      })
    })

    it('keeps a detail about a field the form does not have in the form alert', async () => {
      reject(400, 'VALIDATION_ERROR', 'Invalid', [{ field: 'stock', message: 'not allowed' }])

      expect(await updateProduct('p-1', update)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: managementCopy.edit.notUpdated, detail: 'not allowed' } },
      })
    })

    it('shows a form alert with the service message when a 400 has no details', async () => {
      reject(400, 'VALIDATION_ERROR', 'Malformed body')

      expect(await updateProduct('p-1', update)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: managementCopy.edit.notUpdated, detail: 'Malformed body' } },
      })
    })

    describe('404', () => {
      it('blames the category when the service says the category is missing or inactive', async () => {
        reject(404, 'NOT_FOUND', 'Category not found or not active')

        expect(await updateProduct('p-1', update)).toEqual({
          ok: false,
          failure: { fieldErrors: { categoryId: registrationCopy.categoryNotFound }, alert: null },
        })
      })

      it('says the product no longer exists when the service names the product', async () => {
        reject(404, 'NOT_FOUND', 'Product not found')

        expect(await updateProduct('p-1', update)).toEqual({
          ok: false,
          failure: { fieldErrors: {}, alert: { title: managementCopy.gone }, outdated: true },
        })
      })

      it('says the product no longer exists when the message names neither (the contract generic body)', async () => {
        reject(404, 'NOT_FOUND', 'Resource not found')

        expect(await updateProduct('p-1', update)).toEqual({
          ok: false,
          failure: { fieldErrors: {}, alert: { title: managementCopy.gone }, outdated: true },
        })
      })
    })

    it('explains a 403 in Spanish, without the service text', async () => {
      reject(403, 'FORBIDDEN', 'Role SALESPERSON is not authorized')

      expect(await updateProduct('p-1', update)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: managementCopy.forbidden } },
      })
    })

    it('says the server could not be reached when the host reports status 0', async () => {
      reject(0, 'NETWORK_ERROR', 'Network error')

      expect(await updateProduct('p-1', update)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: registrationCopy.offline } },
      })
    })

    it('shows any other status as a Spanish title with the service message as the detail', async () => {
      reject(500, 'INTERNAL_ERROR', 'Something broke')

      expect(await updateProduct('p-1', update)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: managementCopy.edit.notUpdated, detail: 'Something broke' } },
      })
    })

    it('still reports a failure when the rejection is not the host error shape', async () => {
      apiClient.request.mockRejectedValue(new Error('boom'))

      expect(await updateProduct('p-1', update)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: managementCopy.edit.notUpdated } },
      })
    })

    it('escapes the id in the path', async () => {
      apiClient.request.mockResolvedValue(mouse)

      await updateProduct('a/b', update)

      expect(apiClient.request.mock.lastCall?.[0]).toBe('/api/v1/products/a%2Fb')
    })
  })

  describe('deactivateProduct', () => {
    it("deletes the product through the host's client", async () => {
      apiClient.request.mockResolvedValue({ ...mouse, active: false })

      await deactivateProduct('p-1')

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith('/api/v1/products/p-1', { method: 'DELETE' })
    })

    it('returns the deactivated product', async () => {
      apiClient.request.mockResolvedValue({ ...mouse, active: false })

      expect(await deactivateProduct('p-1')).toEqual({ ok: true, value: { ...mouse, active: false } })
    })

    it('says the product no longer exists on a 404, and marks it gone', async () => {
      reject(404, 'NOT_FOUND', 'Product not found')

      expect(await deactivateProduct('p-1')).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: managementCopy.gone }, outdated: true },
      })
    })

    it('explains a 403 in Spanish', async () => {
      reject(403, 'FORBIDDEN', 'Role is not authorized')

      expect(await deactivateProduct('p-1')).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: managementCopy.forbidden } },
      })
    })

    it('says the server could not be reached on status 0', async () => {
      reject(0, 'TIMEOUT', 'Request timed out')

      expect(await deactivateProduct('p-1')).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: registrationCopy.offline } },
      })
    })

    it('shows any other failure as a Spanish title with the service message as the detail', async () => {
      reject(500, 'INTERNAL_ERROR', 'Something broke')

      expect(await deactivateProduct('p-1')).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: managementCopy.deactivate.notDeactivated, detail: 'Something broke' } },
      })
    })
  })

  describe('createStockAdjustment', () => {
    it('posts delta and reason with the idempotency key', async () => {
      apiClient.request.mockResolvedValue(adjustmentResponse)

      await createStockAdjustment('p-1', adjustment, KEY)

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith('/api/v1/products/p-1/stock-adjustments', {
        method: 'POST',
        body: { delta: -3, reason: 'Daño en bodega' },
        idempotencyKey: KEY,
      })
    })

    it('returns the adjustment, the same when the service replays it', async () => {
      apiClient.request.mockResolvedValue(adjustmentResponse)

      const first = await createStockAdjustment('p-1', adjustment, KEY)
      const replay = await createStockAdjustment('p-1', adjustment, KEY)

      expect(first).toEqual({ ok: true, value: adjustmentResponse })
      expect(replay).toEqual(first)
    })

    it('puts each 400 detail on its own field', async () => {
      reject(400, 'VALIDATION_ERROR', 'Invalid', [
        { field: 'delta', message: 'must not be 0' },
        { field: 'reason', message: 'required' },
      ])

      expect(await createStockAdjustment('p-1', adjustment, KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: { quantity: 'must not be 0', reason: 'required' }, alert: null },
      })
    })

    it('shows a 422 about the delta on the quantity field, in Spanish', async () => {
      reject(422, 'BUSINESS_RULE_VIOLATION', 'The adjustment would take stock below 0', [
        { field: 'delta', message: 'exceeds the current stock' },
      ])

      expect(await createStockAdjustment('p-1', adjustment, KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: { quantity: managementCopy.adjust.stockChanged }, alert: null, outdated: true },
      })
    })

    it('shows a 422 that is not about the delta as a form alert with the service message', async () => {
      reject(422, 'BUSINESS_RULE_VIOLATION', 'The Idempotency-Key was already used', [
        { field: 'Idempotency-Key', message: 'already used for a different resource' },
      ])

      expect(await createStockAdjustment('p-1', adjustment, KEY)).toEqual({
        ok: false,
        failure: {
          fieldErrors: {},
          alert: { title: managementCopy.adjust.notAdjusted, detail: 'The Idempotency-Key was already used' },
        },
      })
    })

    it('says the product no longer exists on a 404, and marks it gone', async () => {
      reject(404, 'NOT_FOUND', 'Product not found')

      expect(await createStockAdjustment('p-1', adjustment, KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: managementCopy.gone }, outdated: true },
      })
    })

    it('explains a 403 in Spanish', async () => {
      reject(403, 'FORBIDDEN', 'Role is not authorized')

      expect(await createStockAdjustment('p-1', adjustment, KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: managementCopy.forbidden } },
      })
    })

    it('says the server could not be reached on status 0', async () => {
      reject(0, 'NETWORK_ERROR', 'Network error')

      expect(await createStockAdjustment('p-1', adjustment, KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: registrationCopy.offline } },
      })
    })

    it('shows any other failure as a Spanish title with the service message as the detail', async () => {
      reject(500, 'INTERNAL_ERROR', 'Something broke')

      expect(await createStockAdjustment('p-1', adjustment, KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: managementCopy.adjust.notAdjusted, detail: 'Something broke' } },
      })
    })
  })
})
