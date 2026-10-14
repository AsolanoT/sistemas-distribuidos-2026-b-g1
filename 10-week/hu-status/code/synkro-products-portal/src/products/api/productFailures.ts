import type { CreateProductFailure } from '../model/createProductFailure'
import type { FormFailure } from '../model/formFailure'
import { managementCopy } from '../model/managementCopy'
import { registrationCopy } from '../model/registrationCopy'
import type { AdjustmentField } from '../model/stockAdjustment'
import { FIELD_OF_PRODUCT_PROPERTY } from './createProductFailure'
import { alertOnly, detailsOf, forbidden, messageOf, toFormFailure, type HostError } from './hostFailure'

const CATEGORY_MENTION = /categor/i

// PUT /products/{id} answers 404 both for a missing product and for a category
// that is missing or inactive (products-api: "Category not found or not active").
// The contract's NotFound body has no field to tell them apart, so the service's
// message does: one that names a category blames the category field; anything
// else, including the contract's generic "Resource not found", means the product.
export function toUpdateProductFailure(error: unknown): CreateProductFailure {
  return toFormFailure(error, {
    title: managementCopy.edit.notUpdated,
    fieldOfProperty: FIELD_OF_PRODUCT_PROPERTY,
    byStatus: {
      403: forbidden,
      404: (hostError) => (mentionsCategory(hostError) ? categoryNotFound() : productGone()),
    },
  })
}

const FIELD_OF_ADJUSTMENT_PROPERTY: Record<string, AdjustmentField> = {
  delta: 'quantity',
  reason: 'reason',
}

// A 422 about the delta means the stock changed since the form was opened, so it
// is shown on the quantity field, and the list is stale; any other 422 (a reused
// key) is the form's.
export function toAdjustmentFailure(error: unknown): FormFailure<AdjustmentField> {
  return toFormFailure(error, {
    title: managementCopy.adjust.notAdjusted,
    fieldOfProperty: FIELD_OF_ADJUSTMENT_PROPERTY,
    byStatus: {
      403: forbidden,
      404: productGone,
      422: (hostError) =>
        detailsOf(hostError).some(({ field }) => field === 'delta')
          ? { fieldErrors: { quantity: managementCopy.adjust.stockChanged }, alert: null, outdated: true }
          : alertOnly(managementCopy.adjust.notAdjusted, messageOf(hostError)),
    },
  })
}

export function toDeactivateProductFailure(error: unknown): FormFailure {
  return toFormFailure(error, {
    title: managementCopy.deactivate.notDeactivated,
    byStatus: { 403: forbidden, 404: productGone },
  })
}

function mentionsCategory(error: HostError): boolean {
  return CATEGORY_MENTION.test(messageOf(error) ?? '')
}

function categoryNotFound(): CreateProductFailure {
  return { fieldErrors: { categoryId: registrationCopy.categoryNotFound }, alert: null }
}

function productGone<Field extends string>(): FormFailure<Field> {
  return { ...alertOnly<Field>(managementCopy.gone), outdated: true }
}
