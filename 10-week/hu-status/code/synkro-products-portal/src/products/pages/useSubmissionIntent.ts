import { useCallback, useRef } from 'react'
import type { Result } from '../model/formFailure'
import { useSingleFlight } from './useSingleFlight'

interface Intent {
  fingerprint: string
  idempotencyKey: string
}

// Sends one creation per intent. An intent is a piece of data the user means to
// send once: sending the same data again after a failure reuses its
// Idempotency-Key, so the service can recognize a replay and create nothing
// twice. Changed data, or a success, starts a new intent with a new key.
export function useSubmissionIntent<Data extends object, Value, Field extends string>(
  send: (data: Data, idempotencyKey: string) => Promise<Result<Value, Field>>,
) {
  const intent = useRef<Intent | null>(null)

  const sendWithKey = useCallback(
    async (data: Data) => {
      const result = await send(data, keyFor(intent, data))
      if (result.ok) intent.current = null
      return result
    },
    [send],
  )

  return useSingleFlight(sendWithKey)
}

function keyFor(intent: { current: Intent | null }, data: object): string {
  const fingerprint = fingerprintOf(data)

  if (intent.current?.fingerprint !== fingerprint) {
    intent.current = { fingerprint, idempotencyKey: crypto.randomUUID() }
  }
  return intent.current.idempotencyKey
}

// The same data gives the same fingerprint whatever order its properties were written in.
function fingerprintOf(data: object): string {
  return JSON.stringify(data, Object.keys(data).sort())
}
