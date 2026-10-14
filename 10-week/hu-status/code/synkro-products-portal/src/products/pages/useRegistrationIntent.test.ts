import { act, renderHook } from '@testing-library/react'
import { apiClient, hostError } from '../../test-doubles/shellApiClient'
import { deferred, mouse } from '../../test-doubles/productsFixtures'
import { registrationCopy } from '../model/registrationCopy'
import { useRegistrationIntent } from './useRegistrationIntent'

const product = { name: 'Wireless mouse', priceCents: 123_456, categoryId: 'c-1' }

function sentKeys(): (string | undefined)[] {
  return apiClient.request.mock.calls.map(([, options]) => options?.idempotencyKey)
}

function failWithNetworkError() {
  apiClient.request.mockRejectedValueOnce(hostError(0, { error: 'NETWORK_ERROR', message: 'Network error' }))
}

describe('useRegistrationIntent', () => {
  let nextKey: number

  beforeEach(() => {
    apiClient.request.mockReset()
    nextKey = 0
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => `key-${++nextKey}` as ReturnType<typeof crypto.randomUUID>)
  })

  afterEach(() => vi.restoreAllMocks())

  it('starts idle', () => {
    const { result } = renderHook(() => useRegistrationIntent())

    expect(result.current.isPending).toBe(false)
  })

  it('sends the first submission with a freshly generated key', async () => {
    apiClient.request.mockResolvedValue(mouse)
    const { result } = renderHook(() => useRegistrationIntent())

    await act(() => result.current.submit(product))

    expect(sentKeys()).toEqual(['key-1'])
  })

  describe('one key per intent', () => {
    it('reuses the key when the same data is sent again after a failure', async () => {
      failWithNetworkError()
      failWithNetworkError()
      const { result } = renderHook(() => useRegistrationIntent())

      await act(() => result.current.submit(product))
      await act(() => result.current.submit({ ...product }))

      expect(sentKeys()).toEqual(['key-1', 'key-1'])
    })

    it.each([
      ['name', { name: 'Wireless mouse 2' }],
      ['price', { priceCents: 123_457 }],
      ['category', { categoryId: 'c-2' }],
    ])('starts a new intent with a new key when the %s changes', async (_field, change) => {
      failWithNetworkError()
      apiClient.request.mockResolvedValueOnce(mouse)
      const { result } = renderHook(() => useRegistrationIntent())

      await act(() => result.current.submit(product))
      await act(() => result.current.submit({ ...product, ...change }))

      expect(sentKeys()).toEqual(['key-1', 'key-2'])
    })

    it('does not go back to an earlier key when the data returns to what it was', async () => {
      failWithNetworkError()
      failWithNetworkError()
      failWithNetworkError()
      const { result } = renderHook(() => useRegistrationIntent())

      await act(() => result.current.submit(product))
      await act(() => result.current.submit({ ...product, name: 'Other' }))
      await act(() => result.current.submit(product))

      expect(sentKeys()).toEqual(['key-1', 'key-2', 'key-3'])
    })

    it('starts a new intent after a success, even with identical data', async () => {
      apiClient.request.mockResolvedValue(mouse)
      const { result } = renderHook(() => useRegistrationIntent())

      await act(() => result.current.submit(product))
      await act(() => result.current.submit(product))

      expect(sentKeys()).toEqual(['key-1', 'key-2'])
    })

    it('keeps the key after the service answered with a validation error and the data did not change', async () => {
      apiClient.request.mockRejectedValueOnce(hostError(422, { error: 'BUSINESS_RULE_VIOLATION', message: 'No' }))
      apiClient.request.mockResolvedValueOnce(mouse)
      const { result } = renderHook(() => useRegistrationIntent())

      await act(() => result.current.submit(product))
      await act(() => result.current.submit(product))

      expect(sentKeys()).toEqual(['key-1', 'key-1'])
    })
  })

  describe('outcome', () => {
    it('reports the registered product', async () => {
      apiClient.request.mockResolvedValue(mouse)
      const { result } = renderHook(() => useRegistrationIntent())

      const outcome = await act(() => result.current.submit(product))

      expect(outcome).toEqual({ status: 'registered', product: mouse })
    })

    it('reports a failure in the shape the form shows', async () => {
      failWithNetworkError()
      const { result } = renderHook(() => useRegistrationIntent())

      const outcome = await act(() => result.current.submit(product))

      expect(outcome).toEqual({
        status: 'failed',
        failure: { fieldErrors: {}, alert: { title: registrationCopy.offline } },
      })
    })
  })

  describe('pending', () => {
    it('is pending from the submit until the answer arrives', async () => {
      const answer = deferred<typeof mouse>()
      apiClient.request.mockReturnValue(answer.promise)
      const { result } = renderHook(() => useRegistrationIntent())

      let submitted!: Promise<unknown>
      act(() => {
        submitted = result.current.submit(product)
      })
      expect(result.current.isPending).toBe(true)

      await act(async () => {
        answer.resolve(mouse)
        await submitted
      })
      expect(result.current.isPending).toBe(false)
    })

    it('is no longer pending after a failure, so the user can retry', async () => {
      failWithNetworkError()
      const { result } = renderHook(() => useRegistrationIntent())

      await act(() => result.current.submit(product))

      expect(result.current.isPending).toBe(false)
    })

    it('sends exactly one request when submitted twice before the answer', async () => {
      const answer = deferred<typeof mouse>()
      apiClient.request.mockReturnValue(answer.promise)
      const { result } = renderHook(() => useRegistrationIntent())

      let first!: Promise<unknown>
      let second!: Promise<unknown>
      act(() => {
        first = result.current.submit(product)
        second = result.current.submit(product)
      })
      await act(async () => {
        answer.resolve(mouse)
        await Promise.all([first, second])
      })

      expect(apiClient.request).toHaveBeenCalledTimes(1)
      expect(await second).toEqual({ status: 'ignored' })
    })

    it('accepts a new submission once the first one has been answered', async () => {
      apiClient.request.mockResolvedValue(mouse)
      const { result } = renderHook(() => useRegistrationIntent())

      await act(() => result.current.submit(product))
      await act(() => result.current.submit(product))

      expect(apiClient.request).toHaveBeenCalledTimes(2)
    })
  })

  describe('a form that was closed', () => {
    it('ignores the answer that arrives after it unmounted', async () => {
      const answer = deferred<typeof mouse>()
      apiClient.request.mockReturnValue(answer.promise)
      const { result, unmount } = renderHook(() => useRegistrationIntent())

      let submitted!: Promise<unknown>
      act(() => {
        submitted = result.current.submit(product)
      })
      unmount()
      answer.resolve(mouse)

      expect(await submitted).toEqual({ status: 'ignored' })
    })

    it('ignores a failure that arrives after it unmounted', async () => {
      const answer = deferred<typeof mouse>()
      apiClient.request.mockReturnValue(answer.promise)
      const { result, unmount } = renderHook(() => useRegistrationIntent())

      let submitted!: Promise<unknown>
      act(() => {
        submitted = result.current.submit(product)
      })
      unmount()
      answer.reject(hostError(0, { error: 'NETWORK_ERROR', message: 'Network error' }))

      expect(await submitted).toEqual({ status: 'ignored' })
    })
  })
})
