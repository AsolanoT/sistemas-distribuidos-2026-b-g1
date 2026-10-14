import { act, renderHook, waitFor } from '@testing-library/react'
import { apiClient } from '../../test-doubles/shellApiClient'
import { accessories, categoriesPage, deferred, peripherals } from '../../test-doubles/productsFixtures'
import { useCategories } from './useCategories'

describe('useCategories', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  it('loads every category once, however often the screen re-renders', async () => {
    apiClient.request.mockResolvedValue(categoriesPage([peripherals, accessories]))

    const { result, rerender } = renderHook(() => useCategories())
    await waitFor(() => expect(result.current.state.status).toBe('ready'))
    rerender()
    rerender()

    expect(apiClient.request).toHaveBeenCalledTimes(1)
    expect(result.current.state).toEqual({ status: 'ready', value: [peripherals, accessories] })
  })

  it('reads every page of categories', async () => {
    apiClient.request
      .mockResolvedValueOnce(categoriesPage([peripherals], 2))
      .mockResolvedValueOnce(categoriesPage([accessories], 2))

    const { result } = renderHook(() => useCategories())

    await waitFor(() => expect(result.current.state).toEqual({ status: 'ready', value: [peripherals, accessories] }))
  })

  it('moves to the error state when the categories fail, and retry loads them again', async () => {
    apiClient.request
      .mockRejectedValueOnce(new Error('gateway down'))
      .mockResolvedValueOnce(categoriesPage([peripherals]))
    const { result } = renderHook(() => useCategories())
    await waitFor(() => expect(result.current.state).toEqual({ status: 'error' }))

    act(() => result.current.retry())

    await waitFor(() => expect(result.current.state).toEqual({ status: 'ready', value: [peripherals] }))
  })

  it('aborts the request in flight when unmounted', () => {
    const answer = deferred<unknown>()
    apiClient.request.mockReturnValue(answer.promise)
    const { unmount } = renderHook(() => useCategories())

    unmount()

    const [, options] = apiClient.request.mock.lastCall ?? []
    expect(options?.signal?.aborted).toBe(true)
  })
})
