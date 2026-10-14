import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormFailure, Result } from '../model/formFailure'

// What one submission came to. "ignored" means nothing happened that the form
// should react to: a submission was already in flight, or the form was closed
// before the answer arrived.
export type SubmitOutcome<Value, Field extends string = never> =
  | { status: 'done'; value: Value }
  | { status: 'failed'; failure: FormFailure<Field> }
  | { status: 'ignored' }

// Sends a form's data one request at a time. While a request is in flight any
// other submission is ignored, so a double click sends one request, and an answer
// that arrives after the form was closed is never reported.
export function useSingleFlight<Data, Value, Field extends string>(
  send: (data: Data) => Promise<Result<Value, Field>>,
) {
  const [isPending, setIsPending] = useState(false)
  // A ref, not state: two clicks in the same tick both see the old state.
  const inFlight = useRef(false)
  const isOpen = useRef(true)
  const latestSend = useRef(send)

  useEffect(() => {
    latestSend.current = send
  })

  useEffect(() => {
    isOpen.current = true
    return () => {
      isOpen.current = false
    }
  }, [])

  const submit = useCallback(async (data: Data): Promise<SubmitOutcome<Value, Field>> => {
    if (inFlight.current) return { status: 'ignored' }
    inFlight.current = true
    setIsPending(true)

    const result = await latestSend.current(data)

    inFlight.current = false
    if (!isOpen.current) return { status: 'ignored' }

    setIsPending(false)
    return result.ok ? { status: 'done', value: result.value } : { status: 'failed', failure: result.failure }
  }, [])

  return { isPending, submit }
}
