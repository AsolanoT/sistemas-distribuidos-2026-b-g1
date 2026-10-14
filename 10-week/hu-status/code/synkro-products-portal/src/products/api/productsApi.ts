import { apiClient } from 'shell/apiClient'
import type { CategoryResponse } from '../model/category'
import type { Page } from '../model/page'
import type { ProductFilters, ProductResponse } from '../model/product'

const PRODUCTS_PATH = '/api/v1/products'
const CATEGORIES_PATH = '/api/v1/products/categories'
const PRODUCTS_PAGE_SIZE = 20
const CATEGORIES_PAGE_SIZE = 100

export interface CategoryListQuery {
  page: number
  limit: number
  active?: boolean
}

interface ListOptions {
  signal?: AbortSignal
}

// What `GET /products` accepts besides the screen's filters: stockAtMost
// (products whose stock is at most this value) and a page size.
interface ProductQuery extends ProductFilters {
  stockAtMost?: number
  limit?: number
}

export type ProductCountQuery = Pick<ProductQuery, 'active' | 'stockAtMost'>

// Every call goes through the host's single client, which adds the gateway
// address, credential, correlation id and timeout. The caller passes a signal
// so a superseded request can be aborted.
export function listProducts(filters: ProductFilters, options: ListOptions = {}): Promise<Page<ProductResponse>> {
  return requestProducts(filters, options)
}

// How many products match, for a summary tile. Only `meta.total` is read, so it
// asks for a single row.
export async function countProducts(query: ProductCountQuery, options: ListOptions = {}): Promise<number> {
  const page = await requestProducts({ ...query, page: 1, limit: 1 }, options)
  return page.meta.total
}

function requestProducts(query: ProductQuery, options: ListOptions): Promise<Page<ProductResponse>> {
  return apiClient.request<Page<ProductResponse>>(PRODUCTS_PATH, {
    query: productQuery(query),
    signal: options.signal,
  })
}

// One product by id, which is how a screen that only holds ids (the alerts) learns a name.
export function getProduct(productId: string, options: ListOptions = {}): Promise<ProductResponse> {
  return apiClient.request<ProductResponse>(`${PRODUCTS_PATH}/${encodeURIComponent(productId)}`, { signal: options.signal })
}

export function listCategories(query: CategoryListQuery, options: ListOptions = {}): Promise<Page<CategoryResponse>> {
  return apiClient.request<Page<CategoryResponse>>(CATEGORIES_PATH, {
    query: { ...query },
    signal: options.signal,
  })
}

// The categories list is needed to name each product's category and to fill the
// category filter. Reads every page, so no category is missing from the map.
export async function listAllCategories(options: ListOptions = {}): Promise<CategoryResponse[]> {
  const categories: CategoryResponse[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const response = await listCategories({ page, limit: CATEGORIES_PAGE_SIZE }, options)
    categories.push(...response.data)
    totalPages = response.meta.totalPages
    page += 1
  }

  return categories
}

// A value the host skips when undefined: an unset or blank filter is left out.
function productQuery({ page, limit = PRODUCTS_PAGE_SIZE, name, categoryId, active, stockAtMost }: ProductQuery) {
  return {
    page,
    limit,
    name: textOrUndefined(name),
    categoryId: textOrUndefined(categoryId),
    active,
    stockAtMost,
  }
}

function textOrUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}
