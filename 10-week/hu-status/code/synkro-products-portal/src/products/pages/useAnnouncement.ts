import { useCallback, useEffect, useRef, useState } from 'react'

const ANNOUNCEMENT_MS = 4_000

// A confirmation the page shows for a few seconds (design-system.md, Feedback:
// confirmations last 4 seconds). The page renders `message` inside a live region
// that stays mounted, so a screen reader reads it when it appears.
export function useAnnouncement() {
  const [message, setMessage] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const announce = useCallback((text: string) => {
    clearTimeout(timer.current)
    setMessage(text)
    timer.current = setTimeout(() => setMessage(''), ANNOUNCEMENT_MS)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return { message, announce }
}
