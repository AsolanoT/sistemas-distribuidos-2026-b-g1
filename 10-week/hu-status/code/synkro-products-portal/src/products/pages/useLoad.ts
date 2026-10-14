import { useCallback, useEffect, useState } from 'react'
import type { Loadable } from '../model/loadable'

// Runs `load` for `key`. A new key, a retry or an unmount aborts the request in
// flight, and an answer that arrives after its abort is never shown, so the
// newest request always wins. `load` must be a stable function (defined outside
// the component), so the request runs only when the key or the attempt changes.
export function useLoad<K, T>(key: K, load: (key: K, signal: AbortSignal) => Promise<T>) {
  const [attempt, setAttempt] = useState(0)
  const [answer, setAnswer] = useState<{ key: K; attempt: number; state: Loadable<T> } | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    load(key, controller.signal).then(
      (value) => {
        if (!controller.signal.aborted) setAnswer({ key, attempt, state: { status: 'ready', value } })
      },
      () => {
        if (!controller.signal.aborted) setAnswer({ key, attempt, state: { status: 'error' } })
      },
    )

    return () => controller.abort()
  }, [key, load, attempt])

  // An answer belongs to the key and attempt it was asked for. Until the current
  // one arrives the state is loading, so no stale answer is ever shown.
  const isCurrent = answer !== null && answer.key === key && answer.attempt === attempt
  const state: Loadable<T> = isCurrent ? answer.state : { status: 'loading' }

  const retry = useCallback(() => setAttempt((count) => count + 1), [])

  return { state, retry }
}
