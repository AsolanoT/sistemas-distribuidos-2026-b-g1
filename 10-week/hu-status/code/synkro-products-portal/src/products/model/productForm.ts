import { parsePrice } from './price'
import { registrationCopy } from './registrationCopy'

// What the user typed, field by field.
export interface ProductFormValues {
  name: string
  price: string
  categoryId: string
}

export type ProductField = keyof ProductFormValues

// The order the fields appear in, which is also the order focus visits an invalid one.
export const PRODUCT_FIELDS: readonly ProductField[] = ['name', 'price', 'categoryId']

export type FieldErrors = Partial<Record<ProductField, string>>

// Mirrors CreateProductRequest in synkro-products-api.yaml. A new product starts
// with stock 0 on the server, so stock is never part of what the form sends.
export interface NewProduct {
  name: string
  priceCents: number
  categoryId: string
}

export type ProductFormValidation = { ok: true; product: NewProduct } | { ok: false; errors: FieldErrors }

const NAME_MAX_LENGTH = 150

export function validateProductForm(values: ProductFormValues): ProductFormValidation {
  const name = values.name.trim()
  const price = parsePrice(values.price)

  const errors: FieldErrors = {
    ...nameError(name),
    ...(price.ok ? {} : { price: registrationCopy.price[price.error] }),
    ...(values.categoryId === '' ? { categoryId: registrationCopy.categoryRequired } : {}),
  }

  if (!price.ok || Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, product: { name, priceCents: price.priceCents, categoryId: values.categoryId } }
}

function nameError(name: string): FieldErrors {
  if (name === '') return { name: registrationCopy.nameRequired }
  // The contract counts characters, so a character outside the basic plane counts once.
  if ([...name].length > NAME_MAX_LENGTH) return { name: registrationCopy.nameTooLong }
  return {}
}
