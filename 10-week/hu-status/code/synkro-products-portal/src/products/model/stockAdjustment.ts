import { managementCopy } from './managementCopy'

// What the user typed, field by field.
export interface AdjustmentValues {
  quantity: string
  reason: string
}

export type AdjustmentField = keyof AdjustmentValues

// The order the fields appear in, which is also the order focus visits an invalid one.
export const ADJUSTMENT_FIELDS: readonly AdjustmentField[] = ['quantity', 'reason']

export type AdjustmentErrors = Partial<Record<AdjustmentField, string>>

// Mirrors CreateStockAdjustmentRequest in synkro-products-api.yaml.
export interface NewAdjustment {
  delta: number
  reason: string
}

export type DeltaError = 'empty' | 'invalid' | 'zero' | 'tooLarge'

export type DeltaParse = { ok: true; delta: number } | { ok: false; error: DeltaError }

export type AdjustmentValidation = { ok: true; adjustment: NewAdjustment } | { ok: false; errors: AdjustmentErrors }

const REASON_MAX_LENGTH = 255
const LARGEST_DELTA = BigInt(Number.MAX_SAFE_INTEGER)

// An optional sign, then digits: no decimals, no separators, no text.
const WHOLE_NUMBER = /^([+-]?)(\d+)$/

// Reads the quantity as a signed whole number. "+5" and "5" are the same.
export function parseDelta(text: string): DeltaParse {
  const typed = text.trim()
  if (typed === '') return { ok: false, error: 'empty' }

  const shape = WHOLE_NUMBER.exec(typed)
  if (!shape) return { ok: false, error: 'invalid' }

  const [, sign, digits] = shape
  const magnitude = BigInt(digits)
  if (magnitude === 0n) return { ok: false, error: 'zero' }
  if (magnitude > LARGEST_DELTA) return { ok: false, error: 'tooLarge' }

  return { ok: true, delta: sign === '-' ? -Number(magnitude) : Number(magnitude) }
}

// The stock after the adjustment, or null while the quantity is not a valid one.
export function resultingStock(currentStock: number, quantity: string): number | null {
  const delta = parseDelta(quantity)
  return delta.ok ? currentStock + delta.delta : null
}

interface QuantityCheck {
  // An empty field is only an error once the user submits.
  requireValue?: boolean
}

// What is wrong with the quantity, if anything. The stock rule is checked here too:
// the server stays authoritative, but nothing is sent that is known to fail.
export function quantityError(
  quantity: string,
  currentStock: number,
  { requireValue = false }: QuantityCheck = {},
): string | undefined {
  const delta = parseDelta(quantity)

  if (!delta.ok) return delta.error === 'empty' && !requireValue ? undefined : managementCopy.quantity[delta.error]
  if (currentStock + delta.delta < 0) return managementCopy.quantity.exceedsStock
  return undefined
}

export function validateAdjustment(values: AdjustmentValues, currentStock: number): AdjustmentValidation {
  const reason = values.reason.trim()
  const delta = parseDelta(values.quantity)

  const errors: AdjustmentErrors = {
    ...optional('quantity', quantityError(values.quantity, currentStock, { requireValue: true })),
    ...optional('reason', reasonError(reason)),
  }

  if (!delta.ok || Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, adjustment: { delta: delta.delta, reason } }
}

function reasonError(reason: string): string | undefined {
  if (reason === '') return managementCopy.reason.required
  if ([...reason].length > REASON_MAX_LENGTH) return managementCopy.reason.tooLong
  return undefined
}

function optional(field: AdjustmentField, message: string | undefined): AdjustmentErrors {
  return message === undefined ? {} : { [field]: message }
}
