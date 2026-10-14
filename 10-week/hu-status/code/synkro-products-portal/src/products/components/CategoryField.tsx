import type { Ref } from 'react'
import type { CategoryResponse } from '../model/category'
import type { Loadable } from '../model/loadable'
import { registrationCopy } from '../model/registrationCopy'
import { Button } from './Button'
import { Field } from './Field'

interface CategoryFieldProps {
  id: string
  categories: Loadable<CategoryResponse[]>
  value: string
  // A message about this field from validation or from the service.
  error: string | undefined
  // Context for the field that is not an error (why it starts empty).
  hint?: string
  selectRef: Ref<HTMLSelectElement>
  onChange: (categoryId: string) => void
  onRetry: () => void
}

// Only active categories can receive a product. The categories are the ones the
// list already loaded; when they failed, the field says so and offers a retry,
// and it stays focusable so that message is reachable from the keyboard.
export function CategoryField({ id, categories, value, error, hint, selectRef, onChange, onRetry }: CategoryFieldProps) {
  const active = categories.status === 'ready' ? categories.value.filter((category) => category.active) : []
  const unavailable = unavailableMessage(categories, active)

  return (
    <Field
      id={id}
      label={registrationCopy.categoryLabel}
      hint={hint}
      error={unavailable ?? error}
      after={
        categories.status === 'error' && (
          <div>
            <Button variant="secondary" onClick={onRetry}>
              {registrationCopy.retry}
            </Button>
          </div>
        )
      }
    >
      {(control) => (
        <select {...control} ref={selectRef} value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">{placeholderFor(categories)}</option>
          {active.map((category) => (
            <option key={category.categoryId} value={category.categoryId}>
              {category.name}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}

function unavailableMessage(categories: Loadable<CategoryResponse[]>, active: CategoryResponse[]): string | undefined {
  if (categories.status === 'error') return registrationCopy.categoriesFailed
  if (categories.status === 'ready' && active.length === 0) return registrationCopy.categoriesEmpty
  return undefined
}

function placeholderFor(categories: Loadable<CategoryResponse[]>): string {
  switch (categories.status) {
    case 'loading':
      return registrationCopy.categoryLoading
    case 'error':
      return registrationCopy.categoriesUnavailable
    case 'ready':
      return registrationCopy.categoryPlaceholder
  }
}
