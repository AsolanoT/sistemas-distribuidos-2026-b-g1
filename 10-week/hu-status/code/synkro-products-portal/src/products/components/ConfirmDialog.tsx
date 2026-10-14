import { useEffect, useId, useRef, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import type { FormAlert } from '../model/formFailure'
import { Button } from './Button'
import styles from './ConfirmDialog.module.css'
import { useModalPage } from './useModalPage'

interface ConfirmDialogProps {
  title: string
  message: string
  cancelLabel: string
  confirmLabel: string
  // What the confirm button says while the request is in flight.
  pendingLabel: string
  isPending: boolean
  // Why the last attempt failed. The dialog stays open so the user can retry.
  error: FormAlert | null
  onCancel: () => void
  onConfirm: () => void
}

const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled)'

// A confirmation for a destructive action (design-system.md: Danger only with a
// modal confirmation). It is a native-free modal on purpose: `<dialog>.showModal()`
// is not implemented by the test environment, and this one needs its behaviour
// tested. It is labelled and described, keeps Tab inside, closes with Escape
// (never while a request is pending), starts on the safe choice, gives the focus
// back to the control that opened it, and keeps the page behind still and inert.
export function ConfirmDialog({
  title,
  message,
  cancelLabel,
  confirmLabel,
  pendingLabel,
  isPending,
  error,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const ids = useId()
  const backdrop = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const wasPending = useRef(false)

  useModalPage(backdrop)

  useEffect(() => {
    cancelButton.current?.focus()
  }, [])

  // A pending request disables the focused button, which would drop the focus on
  // the page: the dialog itself holds it meanwhile, and Cancelar gets it back
  // once the request has failed.
  useEffect(() => {
    if (isPending) dialog.current?.focus()
    else if (wasPending.current) cancelButton.current?.focus()
    wasPending.current = isPending
  }, [isPending])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (!isPending) onCancel()
    } else if (event.key === 'Tab') {
      keepTabInside(event, dialog.current)
    }
  }

  const titleId = `${ids}-title`
  const messageId = `${ids}-message`

  return createPortal(
    <div ref={backdrop} data-testid="confirm-backdrop" className={styles.backdrop}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        tabIndex={-1}
        className={styles.dialog}
        onKeyDown={handleKeyDown}
      >
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <p id={messageId} className={styles.message}>
          {message}
        </p>

        {error && (
          <div role="alert" className={styles.alert}>
            <p className={styles.alertTitle}>{error.title}</p>
            {error.detail && <p className={styles.alertDetail}>{error.detail}</p>}
          </div>
        )}

        <div className={styles.actions}>
          <Button ref={cancelButton} variant="secondary" disabled={isPending} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" disabled={isPending} onClick={onConfirm}>
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// Tab at the last control goes to the first, and Shift+Tab at the first goes to
// the last. With nothing to focus (both buttons disabled) the dialog keeps it.
function keepTabInside(event: KeyboardEvent<HTMLDivElement>, dialog: HTMLElement | null) {
  if (!dialog) return
  const controls = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))

  if (controls.length === 0) {
    event.preventDefault()
    dialog.focus()
    return
  }

  const first = controls[0]
  const last = controls[controls.length - 1]
  const active = document.activeElement

  if (event.shiftKey && (active === first || active === dialog)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}
