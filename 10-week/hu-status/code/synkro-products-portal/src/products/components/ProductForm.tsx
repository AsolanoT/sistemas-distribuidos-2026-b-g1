import { useEffect, useId, useState, type FormEvent } from 'react'
import type { CategoryResponse } from '../model/category'
import type { Loadable } from '../model/loadable'
import type { ProductResponse } from '../model/product'
import {
  PRODUCT_FIELDS,
  validateProductForm,
  type NewProduct,
  type ProductField,
  type ProductFormValues,
} from '../model/productForm'
import { registrationCopy } from '../model/registrationCopy'
import { useFormFeedback } from '../pages/useFormFeedback'
import type { SubmitOutcome } from '../pages/useSingleFlight'
import { CategoryField } from './CategoryField'
import { Field } from './Field'
import { FormShell } from './FormShell'

export interface ProductFormProps {
  title: string
  submitLabel: string
  submittingLabel: string
  cancelLabel: string
  // What the fields hold when the form opens: empty to register, the product's own to edit.
  initialValues: ProductFormValues
  categories: Loadable<CategoryResponse[]>
  onRetryCategories: () => void
  // Explains an empty category field that is not the user's doing.
  emptyCategoryHint?: string
  isPending: boolean
  submit: (product: NewProduct) => Promise<SubmitOutcome<ProductResponse, ProductField>>
  onDone: (product: ProductResponse) => void
  // The answer shows the page's list is out of date: it reloads it.
  onOutdated?: () => void
  onCancel: () => void
}

// The form registering and editing a product share: the same three fields with
// the same rules. It keeps what the user typed whatever the service answers; each
// error appears next to the field it is about, and focus goes to the first
// invalid field (or to the form alert, when the error is not about a field).
// How the data is sent is the caller's: `submit` is a registration with its
// idempotency key, or an update.
export function ProductForm({
  title,
  submitLabel,
  submittingLabel,
  cancelLabel,
  initialValues,
  categories,
  onRetryCategories,
  emptyCategoryHint,
  isPending,
  submit,
  onDone,
  onOutdated,
  onCancel,
}: ProductFormProps) {
  const ids = useId()
  const [values, setValues] = useState<ProductFormValues>(initialValues)
  const { fieldErrors, alert, alertBox, controlRef, showErrors, clearErrors, clearFieldError, focusField } =
    useFormFeedback(PRODUCT_FIELDS)

  const fieldId = (field: ProductField) => `${ids}-${field}`
  const categoryId = chosenCategory(values.categoryId, categories)

  useEffect(() => {
    focusField('name')
  }, [focusField])

  function edit(field: ProductField, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    clearFieldError(field)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validation = validateProductForm({ ...values, categoryId })
    if (!validation.ok) {
      showErrors(validation.errors, null)
      return
    }

    clearErrors()
    const outcome = await submit(validation.product)

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
      cancelLabel={cancelLabel}
      isPending={isPending}
      alert={alert}
      alertRef={alertBox}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      <Field
        id={fieldId('name')}
        label={registrationCopy.nameLabel}
        hint={registrationCopy.nameHint}
        error={fieldErrors.name}
      >
        {(control) => (
          <input
            {...control}
            ref={controlRef('name')}
            type="text"
            autoComplete="off"
            value={values.name}
            onChange={(event) => edit('name', event.target.value)}
          />
        )}
      </Field>

      <Field
        id={fieldId('price')}
        label={registrationCopy.priceLabel}
        hint={registrationCopy.priceHint}
        error={fieldErrors.price}
      >
        {(control) => (
          <input
            {...control}
            ref={controlRef('price')}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={values.price}
            onChange={(event) => edit('price', event.target.value)}
          />
        )}
      </Field>

      <CategoryField
        id={fieldId('categoryId')}
        categories={categories}
        value={categoryId}
        error={fieldErrors.categoryId}
        hint={categoryId === '' ? emptyCategoryHint : undefined}
        selectRef={controlRef('categoryId')}
        onChange={(chosen) => edit('categoryId', chosen)}
        onRetry={onRetryCategories}
      />
    </FormShell>
  )
}

// Only an active category can receive a product, so a category that is inactive,
// missing, or not yet known leaves the field empty.
function chosenCategory(categoryId: string, categories: Loadable<CategoryResponse[]>): string {
  if (categories.status !== 'ready') return ''
  return categories.value.some((category) => category.active && category.categoryId === categoryId) ? categoryId : ''
}
