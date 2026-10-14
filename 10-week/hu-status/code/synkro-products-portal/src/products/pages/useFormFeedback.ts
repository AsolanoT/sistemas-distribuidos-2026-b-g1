import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormAlert } from '../model/formFailure'

// What a form tells the user about a failed attempt: an error next to each field
// it is about and/or one alert for the whole form. Focus goes to the first
// invalid field (in the order the fields appear), or to the alert when the error
// is not about a field.
export function useFormFeedback<Field extends string>(fieldOrder: readonly Field[]) {
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({})
  const [alert, setAlert] = useState<FormAlert | null>(null)

  const controls = useRef<Partial<Record<Field, HTMLElement | null>>>({})
  const alertBox = useRef<HTMLDivElement>(null)
  const focusAfterRender = useRef(false)

  const controlRef = (field: Field) => (element: HTMLElement | null) => {
    controls.current[field] = element
  }

  // Focus waits for the render that shows the errors: an invalid field must
  // already be marked, and the alert must exist, before it receives focus.
  useEffect(() => {
    if (!focusAfterRender.current) return
    focusAfterRender.current = false

    const firstInvalid = fieldOrder.find((field) => fieldErrors[field] !== undefined)
    if (firstInvalid) controls.current[firstInvalid]?.focus()
    else alertBox.current?.focus()
  }, [fieldErrors, alert, fieldOrder])

  const showErrors = useCallback((errors: Partial<Record<Field, string>>, formAlert: FormAlert | null) => {
    focusAfterRender.current = true
    setFieldErrors(errors)
    setAlert(formAlert)
  }, [])

  const clearErrors = useCallback(() => {
    setFieldErrors({})
    setAlert(null)
  }, [])

  // Editing a field is the answer to its error.
  const clearFieldError = useCallback((field: Field) => {
    setFieldErrors(({ [field]: _edited, ...others }) => others as Partial<Record<Field, string>>)
  }, [])

  const focusField = useCallback((field: Field) => controls.current[field]?.focus(), [])

  return { fieldErrors, alert, alertBox, controlRef, showErrors, clearErrors, clearFieldError, focusField }
}
