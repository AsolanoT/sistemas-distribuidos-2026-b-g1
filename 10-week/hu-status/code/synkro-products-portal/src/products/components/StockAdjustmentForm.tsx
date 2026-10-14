import { useEffect, useId, useState, type FormEvent } from 'react'
import { createStockAdjustment } from '../api/productManagement'
import type { Result } from '../model/formFailure'
import { managementCopy } from '../model/managementCopy'
import type { ProductResponse } from '../model/product'
import {
  ADJUSTMENT_FIELDS,
  quantityError,
  resultingStock,
  validateAdjustment,
  type AdjustmentField,
  type AdjustmentValues,
} from '../model/stockAdjustment'
import { registrationCopy } from '../model/registrationCopy'
import type { StockAdjustmentResponse } from '../model/stockAdjustmentResponse'
import { useFormFeedback } from '../pages/useFormFeedback'
import { useSubmissionIntent } from '../pages/useSubmissionIntent'
import { Field } from './Field'
import { FormShell } from './FormShell'
import styles from './StockAdjustmentForm.module.css'

interface StockAdjustmentFormProps {
  product: ProductResponse
  onAdjusted: (adjustment: StockAdjustmentResponse) => void
  // The answer shows the page's list is out of date (the product is gone, or its
  // stock changed): the page reloads it, and the stock shown here follows.
  onOutdated: () => void
  onCancel: () => void
}

const EMPTY_VALUES: AdjustmentValues = { quantity: '', reason: '' }

// The product is part of the data: the same quantity and reason for another
// product is another intent, with its own Idempotency-Key.
interface AdjustmentRequest {
  productId: string
  delta: number
  reason: string
}

function sendAdjustment(
  { productId, delta, reason }: AdjustmentRequest,
  idempotencyKey: string,
): Promise<Result<StockAdjustmentResponse, AdjustmentField>> {
  return createStockAdjustment(productId, { delta, reason }, idempotencyKey)
}

// Adjusts the stock of a product by a signed whole number, with a reason. It
// shows what the stock will be as the user types, and refuses at once a quantity
// that would take it below zero; the server stays authoritative, so a 422
// (the stock changed meanwhile) lands on the quantity field.
export function StockAdjustmentForm({ product, onAdjusted, onOutdated, onCancel }: StockAdjustmentFormProps) {
  const ids = useId()
  const [values, setValues] = useState<AdjustmentValues>(EMPTY_VALUES)
  const { fieldErrors, alert, alertBox, controlRef, showErrors, clearErrors, clearFieldError, focusField } =
    useFormFeedback(ADJUSTMENT_FIELDS)
  const { isPending, submit } = useSubmissionIntent(sendAdjustment)

  const fieldId = (field: AdjustmentField) => `${ids}-${field}`
  const stockAfter = resultingStock(product.stock, values.quantity)
  // A message from the service stands until the user edits the quantity; until
  // then the live check has nothing new to say.
  const shownQuantityError = fieldErrors.quantity ?? quantityError(values.quantity, product.stock)

  useEffect(() => {
    focusField('quantity')
  }, [focusField])

  function edit(field: AdjustmentField, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    clearFieldError(field)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validation = validateAdjustment(values, product.stock)
    if (!validation.ok) {
      showErrors(validation.errors, null)
      return
    }

    clearErrors()
    const outcome = await submit({ productId: product.productId, ...validation.adjustment })

    if (outcome.status === 'done') {
      onAdjusted(outcome.value)
      return
    }
    if (outcome.status === 'ignored') return

    showErrors(outcome.failure.fieldErrors, outcome.failure.alert)
    if (outcome.failure.outdated) onOutdated()
  }

  const { adjust, quantity, reason } = managementCopy

  return (
    <FormShell
      title={adjust.title}
      submitLabel={isPending ? adjust.submitting : adjust.submit}
      cancelLabel={registrationCopy.cancel}
      isPending={isPending}
      alert={alert}
      alertRef={alertBox}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      <dl className={styles.product}>
        <div className={styles.fact}>
          <dt>{adjust.product}</dt>
          <dd className={styles.name}>{product.name}</dd>
        </div>
        <div className={styles.fact}>
          <dt>{adjust.currentStock}</dt>
          <dd className={styles.stock}>{product.stock}</dd>
        </div>
      </dl>

      <Field id={fieldId('quantity')} label={quantity.label} hint={quantity.hint} error={shownQuantityError}>
        {(control) => (
          <input
            {...control}
            ref={controlRef('quantity')}
            type="text"
            data-numeric
            autoComplete="off"
            value={values.quantity}
            onChange={(event) => edit('quantity', event.target.value)}
          />
        )}
      </Field>

      {/* Always on the page and empty until there is a valid result, so a screen reader reads it when it appears. */}
      <p role="status" className={styles.result}>
        {stockAfter !== null && stockAfter >= 0 ? adjust.result(stockAfter) : ''}
      </p>

      <Field id={fieldId('reason')} label={reason.label} hint={reason.hint} error={fieldErrors.reason}>
        {(control) => (
          <input
            {...control}
            ref={controlRef('reason')}
            type="text"
            autoComplete="off"
            value={values.reason}
            onChange={(event) => edit('reason', event.target.value)}
          />
        )}
      </Field>
    </FormShell>
  )
}
