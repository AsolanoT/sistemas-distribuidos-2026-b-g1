import { apiClient } from 'shell/apiClient'
import type { CreateProductFailure } from '../model/createProductFailure'
import type { NewProduct } from '../model/productForm'
import type { ProductResponse } from '../model/product'
import { toCreateProductFailure } from './createProductFailure'

const PRODUCTS_PATH = '/api/v1/products'

export type CreateProductResult = { ok: true; product: ProductResponse } | { ok: false; failure: CreateProductFailure }

// Registers a product through the host's single client. The service answers 201
// the first time and 200 with the same product when the key repeats; both are
// success here. Every failure comes back as the shape the form shows.
export async function createProduct(product: NewProduct, idempotencyKey: string): Promise<CreateProductResult> {
  try {
    const created = await apiClient.request<ProductResponse>(PRODUCTS_PATH, {
      method: 'POST',
      body: { name: product.name, priceCents: product.priceCents, categoryId: product.categoryId },
      idempotencyKey,
    })
    return { ok: true, product: created }
  } catch (error) {
    return { ok: false, failure: toCreateProductFailure(error) }
  }
}
