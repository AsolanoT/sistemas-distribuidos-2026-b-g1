import { categoriesCopy } from '../model/categoriesCopy'
import type { FormFailure } from '../model/formFailure'
import { alertOnly, detailsOf, forbidden, messageOf, toFormFailure, type HostError } from './hostFailure'

export type CategoryField = 'name'

const FIELD_OF_CATEGORY_PROPERTY: Record<string, CategoryField> = { name: 'name' }

// A 422 about the name is a duplicate among the active categories. Any other 422
// (a reused Idempotency-Key) is the form's, with the service's message as detail.
function duplicateName(title: string) {
  return (error: HostError): FormFailure<CategoryField> =>
    detailsOf(error).some(({ field }) => field === 'name')
      ? { fieldErrors: { name: categoriesCopy.name.duplicate }, alert: null }
      : alertOnly(title, messageOf(error))
}

function categoryGone(): FormFailure<CategoryField> {
  return { ...alertOnly<CategoryField>(categoriesCopy.gone), outdated: true }
}

export function toCreateCategoryFailure(error: unknown): FormFailure<CategoryField> {
  return toFormFailure(error, {
    title: categoriesCopy.notCreated,
    fieldOfProperty: FIELD_OF_CATEGORY_PROPERTY,
    byStatus: { 403: forbidden, 422: duplicateName(categoriesCopy.notCreated) },
  })
}

export function toRenameCategoryFailure(error: unknown): FormFailure<CategoryField> {
  return toFormFailure(error, {
    title: categoriesCopy.notRenamed,
    fieldOfProperty: FIELD_OF_CATEGORY_PROPERTY,
    byStatus: { 403: forbidden, 404: categoryGone, 422: duplicateName(categoriesCopy.notRenamed) },
  })
}

// A 422 here can only mean the category still has active products: the user is
// told what to do about it, and nothing changed.
export function toDeactivateCategoryFailure(error: unknown): FormFailure {
  return toFormFailure(error, {
    title: categoriesCopy.notDeactivated,
    byStatus: {
      403: forbidden,
      404: categoryGone,
      422: () => alertOnly(categoriesCopy.hasActiveProducts),
    },
  })
}
