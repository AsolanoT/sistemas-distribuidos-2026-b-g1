import type { CategoryResponse } from '../products/model/category'
import type { Page } from '../products/model/page'
import type { ProductResponse } from '../products/model/product'

// Test data only: this file is excluded from the coverage gate and never shipped.
export const peripherals: CategoryResponse = { categoryId: 'c-1', name: 'Peripherals', active: true }
export const accessories: CategoryResponse = { categoryId: 'c-2', name: 'Accessories', active: false }

export const mouse: ProductResponse = {
  productId: 'p-1',
  name: 'Wireless mouse',
  priceCents: 123_456,
  stock: 7,
  categoryId: 'c-1',
  active: true,
}

export const keyboard: ProductResponse = {
  productId: 'p-2',
  name: 'Mechanical keyboard',
  priceCents: 0,
  stock: 0,
  categoryId: 'c-404',
  active: false,
}

export function productsPage(data: ProductResponse[]): Page<ProductResponse> {
  return { data, meta: { page: 1, limit: 20, total: data.length, totalPages: data.length > 0 ? 1 : 0 } }
}

export function categoriesPage(data: CategoryResponse[], totalPages = 1): Page<CategoryResponse> {
  return { data, meta: { page: 1, limit: 100, total: data.length, totalPages } }
}

// A request the test settles by hand, to control the order of answers.
export function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}
