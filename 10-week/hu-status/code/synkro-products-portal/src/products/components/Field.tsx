import type { ReactNode } from 'react'
import styles from './Field.module.css'

// What a control needs to belong to its field: the id its label points at, and
// the hint and error that describe it.
export interface FieldControlProps {
  id: string
  'aria-describedby': string | undefined
  'aria-invalid': true | undefined
  'aria-required': true | undefined
}

interface FieldProps {
  id: string
  label: string
  hint?: string
  // Whether the control must be filled in. A filter is not a required field.
  required?: boolean
  error?: string
  // Rendered after the error, for an action that belongs to the field (a retry).
  after?: ReactNode
  children: (control: FieldControlProps) => ReactNode
}

// One labelled field. The label is tied to the control with for/id, and the hint
// and the error with aria-describedby, in that order. The error sits below the
// control, in the error colour, and the control's border turns the same colour.
export function Field({ id, label, hint, error, required = true, after, children }: FieldProps) {
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children({
        id,
        'aria-describedby': describedBy || undefined,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
      })}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
      {after}
    </div>
  )
}
