import { useId, type FormEvent, type ReactNode, type RefObject } from 'react'
import type { FormAlert } from '../model/formFailure'
import { Button } from './Button'
import styles from './FormShell.module.css'

interface FormShellProps {
  title: string
  submitLabel: string
  cancelLabel: string
  isPending: boolean
  // The alert for an error that is not about a single field.
  alert: FormAlert | null
  alertRef: RefObject<HTMLDivElement | null>
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  children: ReactNode
}

// The panel every form of the page shares: a card with a title, the fields, an
// inline alert and the two buttons. The host no longer restyles a portal's
// headings, paragraphs or code, so the panel styles its own title and alert.
export function FormShell({
  title,
  submitLabel,
  cancelLabel,
  isPending,
  alert,
  alertRef,
  onSubmit,
  onCancel,
  children,
}: FormShellProps) {
  const titleId = useId()

  return (
    <form className={styles.form} aria-labelledby={titleId} noValidate onSubmit={onSubmit}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>

      {children}

      {alert && (
        <div role="alert" tabIndex={-1} ref={alertRef} className={styles.alert}>
          <p className={styles.alertTitle}>{alert.title}</p>
          {alert.detail && <p className={styles.alertDetail}>{alert.detail}</p>}
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" disabled={isPending} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="submit" disabled={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
