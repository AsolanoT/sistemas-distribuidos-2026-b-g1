import { useEffect, useId, useState, type FormEvent } from 'react'
import type { CategoryField } from '../api/categoryFailures'
import type { CategoryResponse } from '../model/category'
import { categoriesCopy } from '../model/categoriesCopy'
import { validateCategoryName } from '../model/categoryName'
import { useFormFeedback } from '../pages/useFormFeedback'
import type { SubmitOutcome } from '../pages/useSingleFlight'
import { Field } from './Field'
import { FormShell } from './FormShell'

const FIELDS: readonly CategoryField[] = ['name']

export interface CategoryNameFormProps {
  title: string
  submitLabel: string
  submittingLabel: string
  // What the field holds when the form opens: empty to create, the current name to rename.
  initialName: string
  isPending: boolean
  submit: (name: string) => Promise<SubmitOutcome<CategoryResponse, CategoryField>>
  onDone: (category: CategoryResponse) => void
  // The answer shows the page's categories are out of date: it reloads them.
  onOutdated?: () => void
  onCancel: () => void
}

// The form creating and renaming a category share: one name, 1 to 100 characters.
// It keeps what the user typed whatever the service answers, and shows each error
// next to the field (a duplicate name) or as one alert.
export function CategoryNameForm({
  title,
  submitLabel,
  submittingLabel,
  initialName,
  isPending,
  submit,
  onDone,
  onOutdated,
  onCancel,
}: CategoryNameFormProps) {
  const id = useId()
  const [name, setName] = useState(initialName)
  const { fieldErrors, alert, alertBox, controlRef, showErrors, clearErrors, clearFieldError, focusField } =
    useFormFeedback(FIELDS)

  useEffect(() => {
    focusField('name')
  }, [focusField])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validation = validateCategoryName(name)
    if (!validation.ok) {
      showErrors({ name: validation.error }, null)
      return
    }

    clearErrors()
    const outcome = await submit(validation.name)

    if (outcome.status === 'done') {
      onDone(outcome.value)
      return
    }
    if (outcome.status === 'ignored') return

    showErrors(outcome.failure.fieldErrors, outcome.failure.alert)
    if (outcome.failure.outdated) onOutdated?.()
  }

  return (
    <FormShell
      title={title}
      submitLabel={isPending ? submittingLabel : submitLabel}
      cancelLabel={categoriesCopy.form.cancel}
      isPending={isPending}
      alert={alert}
      alertRef={alertBox}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      <Field id={`${id}-name`} label={categoriesCopy.name.label} hint={categoriesCopy.name.hint} error={fieldErrors.name}>
        {(control) => (
          <input
            {...control}
            ref={controlRef('name')}
            type="text"
            autoComplete="off"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              clearFieldError('name')
            }}
          />
        )}
      </Field>
    </FormShell>
  )
}
