import { act, renderHook, waitFor } from '@testing-library/react'
import { apiClient, lastRequestUrl } from '../../test-doubles/shellApiClient'
import { deferred, keyboard, mouse, productsPage } from '../../test-doubles/productsFixtures'
import { useProductList } from './useProductList'

describe('useProductList', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  it('is loading first, then holds the page of products', async () => {
    const answer = deferred<unknown>()
    apiClient.request.mockReturnValue(answer.promise)

    const { result } = renderHook(() => useProductList())
    expect(result.current.state).toEqual({ status: 'loading' })

    await act(async () => answer.resolve(productsPage([mouse])))

    expect(result.current.state).toEqual({ status: 'ready', value: productsPage([mouse]) })
  })

  it('asks for the first page with no filters', async () => {
    apiClient.request.mockResolvedValue(productsPage([]))

    renderHook(() => useProductList())

    await waitFor(() => expect(apiClient.request).toHaveBeenCalledTimes(1))
    expect(lastRequestUrl()).toBe('/api/v1/products?page=1&limit=20')
  })

  it('moves to the error state when the request fails', async () => {
    apiClient.request.mockRejectedValue(new Error('gateway down'))

    const { result } = renderHook(() => useProductList())

    await waitFor(() => expect(result.current.state).toEqual({ status: 'error' }))
  })

  it('keeps the filters when the request fails', async () => {
    apiClient.request.mockResolvedValueOnce(productsPage([mouse])).mockRejectedValueOnce(new Error('gateway down'))
    const { result } = renderHook(() => useProductList())
    await waitFor(() => expect(result.current.state.status).toBe('ready'))

    act(() => result.current.updateFilters({ name: 'mouse' }))

    await waitFor(() => expect(result.current.state).toEqual({ status: 'error' }))
    expect(result.current.filters).toMatchObject({ name: 'mouse' })
  })

  it('retry repeats the same request', async () => {
    apiClient.request.mockRejectedValueOnce(new Error('gateway down')).mockResolvedValueOnce(productsPage([mouse]))
    const { result } = renderHook(() => useProductList())
    await waitFor(() => expect(result.current.state).toEqual({ status: 'error' }))
    const failedUrl = lastRequestUrl()

    act(() => result.current.retry())

    await waitFor(() => expect(result.current.state.status).toBe('ready'))
    expect(apiClient.request).toHaveBeenCalledTimes(2)
    expect(lastRequestUrl()).toBe(failedUrl)
  })

  it('a change to a filter goes back to the first page', async () => {
    apiClient.request.mockResolvedValue(productsPage([]))
    const { result } = renderHook(() => useProductList())
    await waitFor(() => expect(result.current.state.status).toBe('ready'))
    act(() => result.current.goToPage(3))
    await waitFor(() => expect(lastRequestUrl()).toBe('/api/v1/products?page=3&limit=20'))

    act(() => result.current.updateFilters({ categoryId: 'c-1' }))

    await waitFor(() => expect(lastRequestUrl()).toBe('/api/v1/products?page=1&limit=20&categoryId=c-1'))
    expect(result.current.filters.page).toBe(1)
  })

  it('moving to another page keeps the filters', async () => {
    apiClient.request.mockResolvedValue(productsPage([]))
    const { result } = renderHook(() => useProductList())
    act(() => result.current.updateFilters({ name: 'mouse' }))
    await waitFor(() => expect(lastRequestUrl()).toBe('/api/v1/products?page=1&limit=20&name=mouse'))

    act(() => result.current.goToPage(2))

    await waitFor(() => expect(lastRequestUrl()).toBe('/api/v1/products?page=2&limit=20&name=mouse'))
  })

  it('reloading starts from the first page and keeps the filters', async () => {
    apiClient.request.mockResolvedValue(productsPage([]))
    const { result } = renderHook(() => useProductList())
    act(() => result.current.updateFilters({ name: 'mouse' }))
    act(() => result.current.goToPage(3))
    await waitFor(() => expect(lastRequestUrl()).toBe('/api/v1/products?page=3&limit=20&name=mouse'))

    act(() => result.current.reloadFromFirstPage())

    await waitFor(() => expect(lastRequestUrl()).toBe('/api/v1/products?page=1&limit=20&name=mouse'))
  })

  it('reloading from the first page asks again even when it is already there', async () => {
    apiClient.request.mockResolvedValue(productsPage([mouse]))
    const { result } = renderHook(() => useProductList())
    await waitFor(() => expect(result.current.state.status).toBe('ready'))

    act(() => result.current.reloadFromFirstPage())

    await waitFor(() => expect(apiClient.request).toHaveBeenCalledTimes(2))
  })

  it('a newer request wins: the table shows the fast answer and the slow late answer is ignored', async () => {
    const slow = deferred<unknown>()
    const fast = deferred<unknown>()
    apiClient.request.mockReturnValueOnce(slow.promise).mockReturnValueOnce(fast.promise)
    const { result } = renderHook(() => useProductList())

    act(() => result.current.updateFilters({ name: 'key' }))
    await act(async () => fast.resolve(productsPage([keyboard])))
    await act(async () => slow.resolve(productsPage([mouse])))

    expect(result.current.state).toEqual({ status: 'ready', value: productsPage([keyboard]) })
  })

  it('aborts the superseded request', async () => {
    apiClient.request.mockReturnValueOnce(deferred<unknown>().promise).mockReturnValueOnce(deferred<unknown>().promise)
    const { result } = renderHook(() => useProductList())

    act(() => result.current.updateFilters({ name: 'key' }))

    const [, supersededOptions] = apiClient.request.mock.calls[0]
    expect(supersededOptions?.signal?.aborted).toBe(true)
    expect(result.current.state).toEqual({ status: 'loading' })
  })

  it('a superseded request that fails later does not change the state', async () => {
    const slow = deferred<unknown>()
    apiClient.request.mockReturnValueOnce(slow.promise).mockResolvedValueOnce(productsPage([keyboard]))
    const { result } = renderHook(() => useProductList())

    act(() => result.current.updateFilters({ name: 'key' }))
    await waitFor(() => expect(result.current.state.status).toBe('ready'))
    await act(async () => slow.reject(new Error('late failure')))

    expect(result.current.state).toEqual({ status: 'ready', value: productsPage([keyboard]) })
  })

  it('aborts the request in flight when unmounted', () => {
    apiClient.request.mockReturnValue(deferred<unknown>().promise)
    const { unmount } = renderHook(() => useProductList())

    unmount()

    const [, options] = apiClient.request.mock.lastCall ?? []
    expect(options?.signal?.aborted).toBe(true)
  })
})
