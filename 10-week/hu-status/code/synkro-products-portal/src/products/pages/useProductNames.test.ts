import { act, renderHook, waitFor } from '@testing-library/react'
import { apiClient, hostError } from '../../test-doubles/shellApiClient'
import { deferred } from '../../test-doubles/productsFixtures'
import type { ProductResponse } from '../model/product'
import { useProductNames } from './useProductNames'

const product = (id: string, name: string): ProductResponse => ({
  productId: id,
  name,
  priceCents: 1,
  stock: 1,
  categoryId: 'c-1',
  active: true,
})

const requestedIds = () => apiClient.request.mock.calls.map(([path]) => String(path).split('/').pop())

describe('useProductNames', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  it('says a name is loading until it arrives, then gives it', async () => {
    apiClient.request.mockResolvedValue(product('p-1', 'Teclado'))
    const { result } = renderHook(() => useProductNames(['p-1']))

    expect(result.current('p-1')).toEqual({ status: 'loading' })
    await waitFor(() => expect(result.current('p-1')).toEqual({ status: 'ready', name: 'Teclado' }))
  })

  it('asks for each id once, in parallel', async () => {
    const first = deferred<ProductResponse>()
    const second = deferred<ProductResponse>()
    apiClient.request.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)

    renderHook(() => useProductNames(['p-1', 'p-2']))

    expect(requestedIds()).toEqual(['p-1', 'p-2'])
  })

  it('asks once for an id that repeats', async () => {
    apiClient.request.mockResolvedValue(product('p-1', 'Teclado'))

    renderHook(() => useProductNames(['p-1', 'p-1']))

    expect(requestedIds()).toEqual(['p-1'])
  })

  it('does not ask again for a name it already has when the ids change', async () => {
    apiClient.request.mockImplementation((path: string) => Promise.resolve(product(path.split('/').pop()!, `Nombre ${path.split('/').pop()}`)))
    const { result, rerender } = renderHook(({ ids }) => useProductNames(ids), { initialProps: { ids: ['p-1', 'p-2'] } })
    await waitFor(() => expect(result.current('p-2').status).toBe('ready'))

    rerender({ ids: ['p-2', 'p-3'] })
    await waitFor(() => expect(result.current('p-3').status).toBe('ready'))

    expect(requestedIds()).toEqual(['p-1', 'p-2', 'p-3'])
    expect(result.current('p-1')).toEqual({ status: 'ready', name: 'Nombre p-1' })
  })

  it('keeps the names for the life of the screen: going back to an earlier page asks for nothing', async () => {
    apiClient.request.mockImplementation((path: string) => Promise.resolve(product(path.split('/').pop()!, 'x')))
    const { result, rerender } = renderHook(({ ids }) => useProductNames(ids), { initialProps: { ids: ['p-1'] } })
    await waitFor(() => expect(result.current('p-1').status).toBe('ready'))
    rerender({ ids: ['p-2'] })
    await waitFor(() => expect(result.current('p-2').status).toBe('ready'))

    rerender({ ids: ['p-1'] })

    expect(result.current('p-1').status).toBe('ready')
    expect(requestedIds()).toEqual(['p-1', 'p-2'])
  })

  it('says a product that cannot be loaded is unavailable, without affecting the others', async () => {
    apiClient.request.mockImplementation((path: string) =>
      path.endsWith('/p-1')
        ? Promise.reject(hostError(404, { error: 'NOT_FOUND', message: 'Product not found' }))
        : Promise.resolve(product('p-2', 'Mouse')),
    )
    const { result } = renderHook(() => useProductNames(['p-1', 'p-2']))

    await waitFor(() => expect(result.current('p-2')).toEqual({ status: 'ready', name: 'Mouse' }))
    expect(result.current('p-1')).toEqual({ status: 'error' })
  })

  it('aborts what is in flight when the page changes, and asks for it again if it comes back', async () => {
    const signals: AbortSignal[] = []
    apiClient.request.mockImplementation((_path: string, options) => {
      signals.push(options?.signal as AbortSignal)
      return new Promise(() => {})
    })
    const { rerender } = renderHook(({ ids }) => useProductNames(ids), { initialProps: { ids: ['p-1'] } })

    rerender({ ids: ['p-2'] })

    expect(signals[0].aborted).toBe(true)
    expect(signals[1].aborted).toBe(false)

    rerender({ ids: ['p-1'] })
    expect(requestedIds()).toEqual(['p-1', 'p-2', 'p-1'])
  })

  it('ignores an answer that arrives after its request was aborted', async () => {
    const late = deferred<ProductResponse>()
    apiClient.request.mockReturnValueOnce(late.promise).mockReturnValue(new Promise(() => {}))
    const { result, rerender } = renderHook(({ ids }) => useProductNames(ids), { initialProps: { ids: ['p-1'] } })
    rerender({ ids: ['p-2'] })

    await act(async () => {
      late.resolve(product('p-1', 'Tarde'))
      await late.promise
    })

    expect(result.current('p-1')).toEqual({ status: 'loading' })
  })

  it('does not fail when the ids are empty', () => {
    const { result } = renderHook(() => useProductNames([]))

    expect(apiClient.request).not.toHaveBeenCalled()
    expect(result.current('p-1')).toEqual({ status: 'loading' })
  })
})
