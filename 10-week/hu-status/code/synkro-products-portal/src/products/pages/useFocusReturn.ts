import { useCallback, useEffect, useRef, type RefObject } from 'react'

interface Origin {
  // The `data-opener` of the control that opened the panel.
  opener: string
  // The `data-focus-fallback` of the region that gets the focus if that control is gone.
  fallback: string
}

// Gives the focus back to the control that opened a panel or dialog when it
// closes. The control is found again by its `data-opener` mark, because a reload
// replaces the rows. When it no longer exists (the row has no actions now, the
// chip is gone) the focus goes to the region marked `data-focus-fallback`, once
// `settled` says the page is not loading, so that region exists to receive it.
export function useFocusReturn(root: RefObject<HTMLElement | null>, settled: boolean) {
  const origin = useRef<Origin | null>(null)
  const pending = useRef<Origin | null>(null)

  const remember = useCallback((opener: string, fallback: string) => {
    origin.current = { opener, fallback }
  }, [])

  const restore = useCallback(() => {
    pending.current = origin.current
    origin.current = null
  }, [])

  // After every render: the controls that were unavailable while the panel was
  // open are available again, and the reload may have brought the list back.
  useEffect(() => {
    const request = pending.current
    const container = root.current
    if (!request || !container) return

    const opener = container.querySelector<HTMLElement>(`[data-opener="${request.opener}"]:not(:disabled)`)
    if (opener) {
      pending.current = null
      opener.focus()
    } else if (settled) {
      pending.current = null
      container.querySelector<HTMLElement>(`[data-focus-fallback="${request.fallback}"]`)?.focus()
    }
  })

  return { remember, restore }
}
