import { act, renderHook, waitFor } from '@testing-library/react'
import { apiClient } from '../../test-doubles/shellApiClient'
import { deferred } from '../../test-doubles/productsFixtures'
import { useOpenAlerts } from './useOpenAlerts'

const alert = (n: number, productId: string) => ({
  alertId: `a-${n}`,
  productId,
  status: 'OPEN' as const,
  stockAtOpening: n,
  openedAt: '2026-10-10T15:49:00Z',
})

const page = (data: unknown[]) => ({ data, meta: { page: 1, limit: 100, total: data.length, totalPages: 1 } })

describe('useOpenAlerts', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  it('has no product ids until the alerts arrive, then the ids of the products with an open alert', async () => {
    apiClient.request.mockResolvedValue(page([alert(1, 'p-1'), alert(2, 'p-2'), alert(3, 'p-1')]))
    const { result } = renderHook(() => useOpenAlerts())

    expect(result.current.lowStockIds.size).toBe(0)
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect([...result.current.lowStockIds].sort()).toEqual(['p-1', 'p-2'])
  })

  it('asks for every open alert, 100 at a time', async () => {
    apiClient.request.mockResolvedValue(page([]))

    renderHook(() => useOpenAlerts())

    await waitFor(() => expect(apiClient.request).toHaveBeenCalled())
    expect(apiClient.request.mock.calls[0][0]).toBe('/api/v1/stock-alerts')
    expect(apiClient.request.mock.calls[0][1]?.query).toEqual({ page: 1, limit: 100, status: 'OPEN' })
  })

  it('says it failed, with no ids, and recovers with a retry', async () => {
    apiClient.request.mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce(page([alert(1, 'p-1')]))
    const { result } = renderHook(() => useOpenAlerts())

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.lowStockIds.size).toBe(0)

    act(() => result.current.reload())

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect([...result.current.lowStockIds]).toEqual(['p-1'])
  })

  it('keeps the last known ids while it reloads, so the badges do not flicker', async () => {
    apiClient.request.mockResolvedValueOnce(page([alert(1, 'p-1')]))
    const { result } = renderHook(() => useOpenAlerts())
    await waitFor(() => expect(result.current.status).toBe('ready'))
    const second = deferred<unknown>()
    apiClient.request.mockReturnValueOnce(second.promise)

    act(() => result.current.reload())

    expect(result.current.status).toBe('loading')
    expect([...result.current.lowStockIds]).toEqual(['p-1'])
    await act(async () => {
      second.resolve(page([alert(2, 'p-2')]))
      await second.promise
    })
    await waitFor(() => expect([...result.current.lowStockIds]).toEqual(['p-2']))
  })

  it('keeps the last known ids when a reload fails, and says so', async () => {
    apiClient.request.mockResolvedValueOnce(page([alert(1, 'p-1')])).mockRejectedValueOnce(new Error('down'))
    const { result } = renderHook(() => useOpenAlerts())
    await waitFor(() => expect(result.current.status).toBe('ready'))

    act(() => result.current.reload())

    await waitFor(() => expect(result.current.status).toBe('error'))
    expect([...result.current.lowStockIds]).toEqual(['p-1'])
  })
})
