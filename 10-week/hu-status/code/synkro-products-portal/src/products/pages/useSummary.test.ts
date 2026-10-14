import { act, renderHook, waitFor } from '@testing-library/react'
import { apiClient } from '../../test-doubles/shellApiClient'
import { deferred } from '../../test-doubles/productsFixtures'
import { useSummary } from './useSummary'

const totalPage = (total: number) => ({ data: [], meta: { page: 1, limit: 1, total, totalPages: total } })
const isOutOfStock = (options?: { query?: Record<string, unknown> }) => options?.query?.stockAtMost === 0

// Active products and out-of-stock products are the two requests the hook makes.
function answerCounts({ active = 12, outOfStock = 3 } = {}) {
  apiClient.request.mockImplementation((_path: string, options) =>
    Promise.resolve(totalPage(isOutOfStock(options) ? outOfStock : active)),
  )
}

const callsFor = (outOfStock: boolean) =>
  apiClient.request.mock.calls.filter(([, options]) => isOutOfStock(options) === outOfStock)

describe('useSummary', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  it('loads the two product counts, each from its own request with limit 1', async () => {
    answerCounts()

    const { result } = renderHook(() => useSummary())

    expect(result.current.activeProducts.state).toEqual({ status: 'loading' })
    await waitFor(() => expect(result.current.activeProducts.state).toEqual({ status: 'ready', value: 12 }))
    expect(result.current.outOfStock.state).toEqual({ status: 'ready', value: 3 })
    expect(callsFor(false)[0][1]?.query).toEqual({ page: 1, limit: 1, active: true })
    expect(callsFor(true)[0][1]?.query).toEqual({ page: 1, limit: 1, active: true, stockAtMost: 0 })
  })

  it('keeps one count when the other fails', async () => {
    apiClient.request.mockImplementation((_path: string, options) =>
      isOutOfStock(options) ? Promise.reject(new Error('down')) : Promise.resolve(totalPage(12)),
    )

    const { result } = renderHook(() => useSummary())

    await waitFor(() => expect(result.current.outOfStock.state).toEqual({ status: 'error' }))
    expect(result.current.activeProducts.state).toEqual({ status: 'ready', value: 12 })
  })

  it('retries only the count that failed', async () => {
    let outOfStockCalls = 0
    apiClient.request.mockImplementation((_path: string, options) => {
      if (!isOutOfStock(options)) return Promise.resolve(totalPage(12))
      outOfStockCalls += 1
      return outOfStockCalls === 1 ? Promise.reject(new Error('down')) : Promise.resolve(totalPage(4))
    })
    const { result } = renderHook(() => useSummary())
    await waitFor(() => expect(result.current.outOfStock.state).toEqual({ status: 'error' }))

    act(() => result.current.outOfStock.retry())

    await waitFor(() => expect(result.current.outOfStock.state).toEqual({ status: 'ready', value: 4 }))
    expect(callsFor(false)).toHaveLength(1)
    expect(callsFor(true)).toHaveLength(2)
  })

  it('reloads both counts, which is what a registered product asks for', async () => {
    answerCounts({ active: 12, outOfStock: 3 })
    const { result } = renderHook(() => useSummary())
    await waitFor(() => expect(result.current.outOfStock.state.status).toBe('ready'))

    answerCounts({ active: 13, outOfStock: 4 })
    act(() => result.current.reload())

    await waitFor(() => expect(result.current.activeProducts.state).toEqual({ status: 'ready', value: 13 }))
    expect(result.current.outOfStock.state).toEqual({ status: 'ready', value: 4 })
  })

  it('ignores an answer that arrives after a newer one was asked for', async () => {
    const first = deferred<ReturnType<typeof totalPage>>()
    apiClient.request.mockImplementationOnce(() => first.promise).mockImplementationOnce(() => Promise.resolve(totalPage(3)))
    const { result } = renderHook(() => useSummary())

    answerCounts({ active: 13, outOfStock: 4 })
    act(() => result.current.reload())
    await waitFor(() => expect(result.current.activeProducts.state).toEqual({ status: 'ready', value: 13 }))
    await act(async () => first.resolve(totalPage(99)))

    expect(result.current.activeProducts.state).toEqual({ status: 'ready', value: 13 })
  })
})
