import { apiClient } from 'shell/apiClient'
import type { CategoryResponse } from '../model/category'
import type { Result } from '../model/formFailure'
import { toCreateCategoryFailure, toDeactivateCategoryFailure, toRenameCategoryFailure, type CategoryField } from './categoryFailures'

const CATEGORIES_PATH = '/api/v1/products/categories'

const categoryPath = (categoryId: string) => `${CATEGORIES_PATH}/${encodeURIComponent(categoryId)}`

// Creates a category through the host's single client. The service answers 201
// the first time and 200 with the same category when the key repeats; both are
// success here.
export async function createCategory(name: string, idempotencyKey: string): Promise<Result<CategoryResponse, CategoryField>> {
  try {
    const created = await apiClient.request<CategoryResponse>(CATEGORIES_PATH, {
      method: 'POST',
      body: { name },
      idempotencyKey,
    })
    return { ok: true, value: created }
  } catch (error) {
    return { ok: false, failure: toCreateCategoryFailure(error) }
  }
}

// A PUT is idempotent by itself, so renaming carries no Idempotency-Key.
export async function renameCategory(categoryId: string, name: string): Promise<Result<CategoryResponse, CategoryField>> {
  try {
    const renamed = await apiClient.request<CategoryResponse>(categoryPath(categoryId), { method: 'PUT', body: { name } })
    return { ok: true, value: renamed }
  } catch (error) {
    return { ok: false, failure: toRenameCategoryFailure(error) }
  }
}

// Deactivates a category (soft delete). The service answers the category, also
// when it was already inactive, and refuses while it still has active products.
export async function deactivateCategory(categoryId: string): Promise<Result<CategoryResponse>> {
  try {
    const deactivated = await apiClient.request<CategoryResponse>(categoryPath(categoryId), { method: 'DELETE' })
    return { ok: true, value: deactivated }
  } catch (error) {
    return { ok: false, failure: toDeactivateCategoryFailure(error) }
  }
}
