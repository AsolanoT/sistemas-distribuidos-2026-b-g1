import { useEffect, type RefObject } from 'react'

// While a modal is open the page behind it stays still and out of reach: it does
// not scroll, nothing in it takes focus or is read by a screen reader (`inert`),
// and the control that had the focus gets it back when the modal closes. The
// modal's own element is excluded, so it is the only thing left to interact with.
export function useModalPage(modal: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const madeInert = Array.from(document.body.children).filter(
      (element) => element !== modal.current && !element.hasAttribute('inert'),
    )
    for (const element of madeInert) element.setAttribute('inert', '')

    return () => {
      document.body.style.overflow = previousOverflow
      for (const element of madeInert) element.removeAttribute('inert')
      if (opener?.isConnected && !(opener as HTMLButtonElement).disabled) opener.focus()
    }
  }, [modal])
}
