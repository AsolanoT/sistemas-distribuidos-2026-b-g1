import type { CreateProductFailure } from '../model/createProductFailure'
import type { ProductField } from '../model/productForm'
import { registrationCopy } from '../model/registrationCopy'
import { toFormFailure } from './hostFailure'

export const FIELD_OF_PRODUCT_PROPERTY: Record<string, ProductField> = {
  name: 'name',
  priceCents: 'price',
  categoryId: 'categoryId',
}

// A product is created in an active category: a 404 can only be about the category.
export function toCreateProductFailure(error: unknown): CreateProductFailure {
  return toFormFailure(error, {
    title: registrationCopy.notRegistered,
    fieldOfProperty: FIELD_OF_PRODUCT_PROPERTY,
    byStatus: { 404: () => ({ fieldErrors: { categoryId: registrationCopy.categoryNotFound }, alert: null }) },
  })
}
