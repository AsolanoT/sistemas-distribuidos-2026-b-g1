import { apiClient, hostError } from '../../test-doubles/shellApiClient'
import { peripherals } from '../../test-doubles/productsFixtures'
import { categoriesCopy } from '../model/categoriesCopy'
import { registrationCopy } from '../model/registrationCopy'
import { createCategory, deactivateCategory, renameCategory } from './categoryManagement'

const KEY = '3f2a9c1e-8b7d-4e5f-9a6b-1c2d3e4f5a6b'
const CATEGORIES_PATH = '/api/v1/products/categories'

function reject(status: number, error: string, message: string, details?: { field: string; message: string }[]) {
  apiClient.request.mockRejectedValue(hostError(status, { error, message, details }))
}

const duplicate = () =>
  reject(422, 'BUSINESS_RULE_VIOLATION', 'An active category with this name already exists', [
    { field: 'name', message: 'already used by an active category' },
  ])

describe('category management calls', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  describe('createCategory', () => {
    it("posts the name through the host's client with the idempotency key", async () => {
      apiClient.request.mockResolvedValue(peripherals)

      await createCategory('Peripherals', KEY)

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith(CATEGORIES_PATH, {
        method: 'POST',
        body: { name: 'Peripherals' },
        idempotencyKey: KEY,
      })
    })

    it('returns the category, the same when the service replays it', async () => {
      apiClient.request.mockResolvedValue(peripherals)

      const first = await createCategory('Peripherals', KEY)
      const replay = await createCategory('Peripherals', KEY)

      expect(first).toEqual({ ok: true, value: peripherals })
      expect(replay).toEqual(first)
    })

    it('shows a duplicate name (422) on the name field, in Spanish', async () => {
      duplicate()

      expect(await createCategory('Peripherals', KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: { name: categoriesCopy.name.duplicate }, alert: null },
      })
    })

    it('shows a 422 that is not about the name as a form alert with the service message', async () => {
      reject(422, 'BUSINESS_RULE_VIOLATION', 'The Idempotency-Key was already used', [
        { field: 'Idempotency-Key', message: 'already used for a different resource' },
      ])

      expect(await createCategory('Peripherals', KEY)).toEqual({
        ok: false,
        failure: {
          fieldErrors: {},
          alert: { title: categoriesCopy.notCreated, detail: 'The Idempotency-Key was already used' },
        },
      })
    })

    it('puts a 400 detail on the name field', async () => {
      reject(400, 'VALIDATION_ERROR', 'Invalid', [{ field: 'name', message: 'required' }])

      expect(await createCategory('', KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: { name: 'required' }, alert: null },
      })
    })

    it('explains a 403 in Spanish', async () => {
      reject(403, 'FORBIDDEN', 'Role is not authorized')

      expect(await createCategory('Peripherals', KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: 'No tienes permiso para realizar esta acción.' } },
      })
    })

    it('says the server could not be reached on status 0', async () => {
      reject(0, 'NETWORK_ERROR', 'Network error')

      expect(await createCategory('Peripherals', KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: registrationCopy.offline } },
      })
    })

    it('shows any other failure as a Spanish title with the service message as the detail', async () => {
      reject(500, 'INTERNAL_ERROR', 'Something broke')

      expect(await createCategory('Peripherals', KEY)).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: categoriesCopy.notCreated, detail: 'Something broke' } },
      })
    })
  })

  describe('renameCategory', () => {
    it('puts the name with no idempotency key', async () => {
      apiClient.request.mockResolvedValue(peripherals)

      await renameCategory('c-1', 'Periféricos')

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith(`${CATEGORIES_PATH}/c-1`, {
        method: 'PUT',
        body: { name: 'Periféricos' },
      })
    })

    it('returns the renamed category', async () => {
      apiClient.request.mockResolvedValue({ ...peripherals, name: 'Periféricos' })

      expect(await renameCategory('c-1', 'Periféricos')).toEqual({
        ok: true,
        value: { ...peripherals, name: 'Periféricos' },
      })
    })

    it('shows a duplicate name (422) on the name field', async () => {
      duplicate()

      expect(await renameCategory('c-1', 'Periféricos')).toEqual({
        ok: false,
        failure: { fieldErrors: { name: categoriesCopy.name.duplicate }, alert: null },
      })
    })

    it('says the category no longer exists on a 404, and marks the list outdated', async () => {
      reject(404, 'NOT_FOUND', 'Category not found')

      expect(await renameCategory('c-1', 'Periféricos')).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: categoriesCopy.gone }, outdated: true },
      })
    })

    it('shows any other failure as a Spanish title with the service message as the detail', async () => {
      reject(500, 'INTERNAL_ERROR', 'Something broke')

      expect(await renameCategory('c-1', 'Periféricos')).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: categoriesCopy.notRenamed, detail: 'Something broke' } },
      })
    })
  })

  describe('deactivateCategory', () => {
    it("deletes the category through the host's client", async () => {
      apiClient.request.mockResolvedValue({ ...peripherals, active: false })

      await deactivateCategory('c-1')

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith(`${CATEGORIES_PATH}/c-1`, { method: 'DELETE' })
    })

    it('returns the deactivated category', async () => {
      apiClient.request.mockResolvedValue({ ...peripherals, active: false })

      expect(await deactivateCategory('c-1')).toEqual({ ok: true, value: { ...peripherals, active: false } })
    })

    it('explains a 422 (it still has active products) and does not blame the service text', async () => {
      reject(422, 'BUSINESS_RULE_VIOLATION', 'The category has active products assigned to it')

      expect(await deactivateCategory('c-1')).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: categoriesCopy.hasActiveProducts } },
      })
    })

    it('says the category no longer exists on a 404, and marks the list outdated', async () => {
      reject(404, 'NOT_FOUND', 'Category not found')

      expect(await deactivateCategory('c-1')).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: categoriesCopy.gone }, outdated: true },
      })
    })

    it('shows any other failure as a Spanish title with the service message as the detail', async () => {
      reject(500, 'INTERNAL_ERROR', 'Something broke')

      expect(await deactivateCategory('c-1')).toEqual({
        ok: false,
        failure: { fieldErrors: {}, alert: { title: categoriesCopy.notDeactivated, detail: 'Something broke' } },
      })
    })
  })
})
