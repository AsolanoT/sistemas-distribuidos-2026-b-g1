import { apiClient } from 'shell/apiClient'
import type { Result } from '../model/formFailure'
import type { ProductResponse } from '../model/product'
import type { NewProduct, ProductField } from '../model/productForm'
import type { AdjustmentField, NewAdjustment } from '../model/stockAdjustment'
import type { StockAdjustmentResponse } from '../model/stockAdjustmentResponse'
import { toAdjustmentFailure, toDeactivateProductFailure, toUpdateProductFailure } from './productFailures'

const PRODUCTS_PATH = '/api/v1/products'

const productPath = (productId: string) => `${PRODUCTS_PATH}/${encodeURIComponent(productId)}`

// Updates a product's catalogue data through the host's single client. A PUT is
// idempotent by itself, so it carries no Idempotency-Key. Stock is never sent:
// it changes only through stock adjustments.
export async function updateProduct(productId: string, product: NewProduct): Promise<Result<ProductResponse, ProductField>> {
  try {
    const updated = await apiClient.request<ProductResponse>(productPath(productId), {
      method: 'PUT',
      body: { name: product.name, priceCents: product.priceCents, categoryId: product.categoryId },
    })
    return { ok: true, value: updated }
  } catch (error) {
    return { ok: false, failure: toUpdateProductFailure(error) }
  }
}

// Deactivates a product (soft delete). The service answers the product, also
// when it was already inactive.
export async function deactivateProduct(productId: string): Promise<Result<ProductResponse>> {
  try {
    const deactivated = await apiClient.request<ProductResponse>(productPath(productId), { method: 'DELETE' })
    return { ok: true, value: deactivated }
  } catch (error) {
    return { ok: false, failure: toDeactivateProductFailure(error) }
  }
}

// Records a manual stock adjustment. The service answers 201 the first time and
// 200 with the same adjustment when the key repeats; both are success here.
export async function createStockAdjustment(
  productId: string,
  adjustment: NewAdjustment,
  idempotencyKey: string,
): Promise<Result<StockAdjustmentResponse, AdjustmentField>> {
  try {
    const recorded = await apiClient.request<StockAdjustmentResponse>(`${productPath(productId)}/stock-adjustments`, {
      method: 'POST',
      body: { delta: adjustment.delta, reason: adjustment.reason },
      idempotencyKey,
    })
    return { ok: true, value: recorded }
  } catch (error) {
    return { ok: false, failure: toAdjustmentFailure(error) }
  }
}
