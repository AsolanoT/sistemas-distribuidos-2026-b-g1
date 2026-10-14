import { act, renderHook } from '@testing-library/react'
import { deferred } from '../../test-doubles/productsFixtures'
import type { FormFailure, Result } from '../model/formFailure'
import { useSingleFlight } from './useSingleFlight'
import { useSubmissionIntent } from './useSubmissionIntent'

type Send = (data: Data, key: string) => Promise<Result<string, 'name'>>
interface Data {
  name: string
  amount: number
}

const data: Data = { name: 'Mouse', amount: 3 }
const failure: FormFailure<'name'> = { fieldErrors: {}, alert: { title: 'No se pudo' } }
const fails = (): Result<string, 'name'> => ({ ok: false, failure })
const succeeds = (value = 'saved'): Result<string, 'name'> => ({ ok: true, value })

describe('useSingleFlight', () => {
  it('starts idle', () => {
    const { result } = renderHook(() => useSingleFlight(vi.fn()))

    expect(result.current.isPending).toBe(false)
  })

  it('reports the value of a success and the failure of a failure', async () => {
    const send = vi.fn().mockResolvedValueOnce(succeeds('ok')).mockResolvedValueOnce(fails())
    const { result } = renderHook(() => useSingleFlight(send))

    expect(await act(() => result.current.submit(data))).toEqual({ status: 'done', value: 'ok' })
    expect(await act(() => result.current.submit(data))).toEqual({ status: 'failed', failure })
  })

  it('is pending while the request is in flight', async () => {
    const answer = deferred<Result<string, 'name'>>()
    const { result } = renderHook(() => useSingleFlight(() => answer.promise))

    let outcome!: Promise<unknown>
    act(() => {
      outcome = result.current.submit(data)
    })
    expect(result.current.isPending).toBe(true)

    await act(async () => {
      answer.resolve(succeeds())
      await outcome
    })
    expect(result.current.isPending).toBe(false)
  })

  it('sends one request for a double click', async () => {
    const answer = deferred<Result<string, 'name'>>()
    const send = vi.fn(() => answer.promise)
    const { result } = renderHook(() => useSingleFlight(send))

    let first!: Promise<unknown>
    let second!: Promise<unknown>
    await act(async () => {
      first = result.current.submit(data)
      second = result.current.submit(data)
      answer.resolve(succeeds())
      await Promise.all([first, second])
    })

    expect(send).toHaveBeenCalledOnce()
    expect(await second).toEqual({ status: 'ignored' })
  })

  it('lets a new submission go once the earlier one settled', async () => {
    const send = vi.fn().mockResolvedValue(succeeds())
    const { result } = renderHook(() => useSingleFlight(send))

    await act(() => result.current.submit(data))
    await act(() => result.current.submit(data))

    expect(send).toHaveBeenCalledTimes(2)
  })

  it('ignores the answer when it is closed before it arrives', async () => {
    const answer = deferred<Result<string, 'name'>>()
    const { result, unmount } = renderHook(() => useSingleFlight(() => answer.promise))

    let outcome!: Promise<unknown>
    act(() => {
      outcome = result.current.submit(data)
    })
    unmount()
    answer.resolve(succeeds())

    expect(await outcome).toEqual({ status: 'ignored' })
  })
})

describe('useSubmissionIntent', () => {
  let nextKey: number

  const keysOf = (send: ReturnType<typeof vi.fn>) => send.mock.calls.map(([, key]) => key)

  beforeEach(() => {
    nextKey = 0
    vi.spyOn(crypto, 'randomUUID').mockImplementation(() => `key-${++nextKey}` as ReturnType<typeof crypto.randomUUID>)
  })

  afterEach(() => vi.restoreAllMocks())

  it('sends the first submission with a freshly generated key', async () => {
    const send = vi.fn<Send>().mockResolvedValue(succeeds())
    const { result } = renderHook(() => useSubmissionIntent(send))

    await act(() => result.current.submit(data))

    expect(send).toHaveBeenCalledExactlyOnceWith(data, 'key-1')
  })

  it('reuses the key when the same data is sent again after a failure', async () => {
    const send = vi.fn<Send>().mockResolvedValue(fails())
    const { result } = renderHook(() => useSubmissionIntent(send))

    await act(() => result.current.submit(data))
    await act(() => result.current.submit({ ...data }))

    expect(keysOf(send)).toEqual(['key-1', 'key-1'])
  })

  it('reuses the key when the same data arrives with its properties in another order', async () => {
    const send = vi.fn<Send>().mockResolvedValue(fails())
    const { result } = renderHook(() => useSubmissionIntent(send))

    await act(() => result.current.submit(data))
    await act(() => result.current.submit({ amount: 3, name: 'Mouse' }))

    expect(keysOf(send)).toEqual(['key-1', 'key-1'])
  })

  it.each([
    ['name', { name: 'Other' }],
    ['amount', { amount: 4 }],
  ])('starts a new intent with a new key when the %s changes', async (_field, change) => {
    const send = vi.fn<Send>().mockResolvedValue(fails())
    const { result } = renderHook(() => useSubmissionIntent(send))

    await act(() => result.current.submit(data))
    await act(() => result.current.submit({ ...data, ...change }))

    expect(keysOf(send)).toEqual(['key-1', 'key-2'])
  })

  it('does not go back to an earlier key when the data returns to what it was', async () => {
    const send = vi.fn<Send>().mockResolvedValue(fails())
    const { result } = renderHook(() => useSubmissionIntent(send))

    await act(() => result.current.submit(data))
    await act(() => result.current.submit({ ...data, name: 'Other' }))
    await act(() => result.current.submit(data))

    expect(keysOf(send)).toEqual(['key-1', 'key-2', 'key-3'])
  })

  it('starts a new intent after a success, even for the same data', async () => {
    const send = vi.fn<Send>().mockResolvedValue(succeeds())
    const { result } = renderHook(() => useSubmissionIntent(send))

    await act(() => result.current.submit(data))
    await act(() => result.current.submit(data))

    expect(keysOf(send)).toEqual(['key-1', 'key-2'])
  })

  it('sends one request for a double click, with one key', async () => {
    const answer = deferred<Result<string, 'name'>>()
    const send = vi.fn<Send>(() => answer.promise)
    const { result } = renderHook(() => useSubmissionIntent(send))

    await act(async () => {
      const first = result.current.submit(data)
      const second = result.current.submit(data)
      answer.resolve(succeeds())
      await Promise.all([first, second])
    })

    expect(keysOf(send)).toEqual(['key-1'])
  })

  it('is ignored when it is closed before the answer arrives', async () => {
    const answer = deferred<Result<string, 'name'>>()
    const { result, unmount } = renderHook(() => useSubmissionIntent<Data, string, 'name'>(() => answer.promise))

    let outcome!: Promise<unknown>
    act(() => {
      outcome = result.current.submit(data)
    })
    unmount()
    answer.resolve(succeeds())

    expect(await outcome).toEqual({ status: 'ignored' })
  })
})
