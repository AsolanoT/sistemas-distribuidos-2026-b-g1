import type { RequestOptions } from 'shell/apiClient'
import { apiClient, hostError } from './shellApiClient'
import type { CategoryResponse } from '../products/model/category'
import type { ProductResponse } from '../products/model/product'
import type { StockAlertResponse } from '../products/model/stockAlert'

// Test data only: this file is excluded from the coverage gate and never shipped.
export const PRODUCTS_PATH = '/api/v1/products'
export const CATEGORIES_PATH = '/api/v1/products/categories'
export const ALERTS_PATH = '/api/v1/stock-alerts'

interface Rejection {
  matches: (method: string, path: string, options: RequestOptions) => boolean
  error: Error
}

// The products service as the page sees it, with the rules the real one has:
// products and categories to list, idempotent creations (a key it has seen
// answers the same thing again), a duplicate category name is a 422, a category
// with active products cannot be deactivated, and stock never goes negative.
// A test makes the next matching request fail with `rejectNext`.
export class CatalogueService {
  products: ProductResponse[]
  categories: CategoryResponse[]
  alerts: StockAlertResponse[]
  private readonly pageSize: number
  private readonly seen = new Map<string, unknown>()
  private readonly rejections: Rejection[] = []
  private nextId = 100

  constructor({
    products,
    categories,
    alerts = [],
    pageSize = 20,
  }: {
    products: ProductResponse[]
    categories: CategoryResponse[]
    alerts?: StockAlertResponse[]
    pageSize?: number
  }) {
    this.products = products.map((product) => ({ ...product }))
    this.categories = categories.map((category) => ({ ...category }))
    this.alerts = alerts.map((alert) => ({ ...alert }))
    this.pageSize = pageSize
    apiClient.request.mockImplementation((path: string, options?: RequestOptions) => this.handle(path, options ?? {}))
  }

  rejectNext(method: string, path: RegExp | string, status: number, error: string, message: string, details?: { field: string; message: string }[]) {
    this.rejections.push({
      matches: (requestMethod, requestPath) =>
        requestMethod === method && (typeof path === 'string' ? requestPath === path : path.test(requestPath)),
      error: hostError(status, { error, message, details }),
    })
  }

  // Fails the next request the predicate accepts, whatever its path.
  rejectNextWhere(matches: (method: string, path: string, options: RequestOptions) => boolean, status: number, error: string, message: string) {
    this.rejections.push({ matches, error: hostError(status, { error, message }) })
  }

  requests(method: string, path?: RegExp | string) {
    return apiClient.request.mock.calls.filter(([requestPath, options]) => {
      if ((options?.method ?? 'GET') !== method) return false
      if (path === undefined) return true
      return typeof path === 'string' ? requestPath === path : path.test(requestPath)
    })
  }

  private handle(path: string, options: RequestOptions): Promise<unknown> {
    const method = options.method ?? 'GET'
    const index = this.rejections.findIndex((rejection) => rejection.matches(method, path, options))
    if (index !== -1) return Promise.reject(this.rejections.splice(index, 1)[0].error)

    const body = (options.body ?? {}) as Record<string, unknown>
    const key = options.idempotencyKey

    if (path === CATEGORIES_PATH && method === 'GET') return this.ok(this.page(this.categories, 1, 100))
    if (path === CATEGORIES_PATH && method === 'POST') return this.once(key, () => this.createCategory(String(body.name)))
    if (path.startsWith(`${CATEGORIES_PATH}/`)) return this.category(path.slice(CATEGORIES_PATH.length + 1), method, body)
    if (path === PRODUCTS_PATH && method === 'GET') return this.listProducts(options.query ?? {})
    if (path === ALERTS_PATH && method === 'GET') return this.listAlerts(options.query ?? {})
    if (path.endsWith('/stock-adjustments')) {
      const id = path.slice(PRODUCTS_PATH.length + 1, -'/stock-adjustments'.length)
      return this.once(key, () => this.adjust(id, Number(body.delta), String(body.reason)))
    }
    if (path.startsWith(`${PRODUCTS_PATH}/`)) return this.product(path.slice(PRODUCTS_PATH.length + 1), method, body)
    return Promise.reject(hostError(404, { error: 'NOT_FOUND', message: 'Resource not found' }))
  }

  private ok<T>(value: T) {
    return Promise.resolve(value)
  }

  private fail(status: number, error: string, message: string, details?: { field: string; message: string }[]) {
    return Promise.reject(hostError(status, { error, message, details }))
  }

  private page<T>(items: T[], page: number, limit: number) {
    const start = (page - 1) * limit
    // A copy, as if it had crossed the wire: later changes to the service do not reach what a page already holds.
    return {
      data: structuredClone(items.slice(start, start + limit)),
      meta: { page, limit, total: items.length, totalPages: Math.ceil(items.length / limit) },
    }
  }

  private once(key: string | undefined, create: () => Promise<unknown>): Promise<unknown> {
    if (key !== undefined && this.seen.has(key)) return this.ok(this.seen.get(key))
    return create().then((created) => {
      if (key !== undefined) this.seen.set(key, created)
      return created
    })
  }

  private listProducts(query: NonNullable<RequestOptions['query']>) {
    const name = typeof query.name === 'string' ? query.name.toLowerCase() : undefined
    const matching = this.products.filter(
      (product) =>
        (name === undefined || product.name.toLowerCase().includes(name)) &&
        (query.categoryId === undefined || product.categoryId === query.categoryId) &&
        (query.active === undefined || product.active === query.active) &&
        (query.stockAtMost === undefined || product.stock <= Number(query.stockAtMost)),
    )
    // A count asks for a single row; a list gets the service page size.
    const limit = Number(query.limit) === 1 ? 1 : this.pageSize
    return this.ok(this.page(matching, Number(query.page ?? 1), limit))
  }

  private listAlerts(query: NonNullable<RequestOptions['query']>) {
    const matching = this.alerts.filter((alert) => query.status === undefined || alert.status === query.status)
    return this.ok(this.page(matching, Number(query.page ?? 1), Number(query.limit ?? this.pageSize)))
  }

  private product(id: string, method: string, body: Record<string, unknown>) {
    const product = this.products.find((candidate) => candidate.productId === id)
    if (!product) return this.fail(404, 'NOT_FOUND', 'Product not found')

    if (method === 'GET') return this.ok(structuredClone(product))
    if (method === 'DELETE') {
      product.active = false
      return this.ok({ ...product })
    }
    const category = this.categories.find((candidate) => candidate.categoryId === body.categoryId)
    if (!category?.active) return this.fail(404, 'NOT_FOUND', 'Category not found or not active')

    Object.assign(product, { name: body.name, priceCents: body.priceCents, categoryId: body.categoryId })
    return this.ok({ ...product })
  }

  private adjust(id: string, delta: number, reason: string) {
    const product = this.products.find((candidate) => candidate.productId === id)
    if (!product) return this.fail(404, 'NOT_FOUND', 'Product not found')
    if (product.stock + delta < 0) {
      return this.fail(422, 'BUSINESS_RULE_VIOLATION', 'The adjustment would take stock below 0', [
        { field: 'delta', message: 'exceeds the current stock' },
      ])
    }
    product.stock += delta
    return this.ok({
      adjustmentId: `a-${this.nextId++}`,
      productId: id,
      delta,
      reason,
      adjustedBy: 'u-1',
      adjustedAt: '2026-10-10T10:00:00Z',
      currentStock: product.stock,
    })
  }

  private createCategory(name: string) {
    if (this.nameTaken(name)) return this.duplicate()
    const category = { categoryId: `c-${this.nextId++}`, name, active: true }
    this.categories.push(category)
    return this.ok({ ...category })
  }

  private category(id: string, method: string, body: Record<string, unknown>) {
    const category = this.categories.find((candidate) => candidate.categoryId === id)
    if (!category) return this.fail(404, 'NOT_FOUND', 'Category not found')

    if (method === 'PUT') {
      if (this.nameTaken(String(body.name), id)) return this.duplicate()
      category.name = String(body.name)
      return this.ok({ ...category })
    }
    if (this.products.some((product) => product.active && product.categoryId === id)) {
      return this.fail(422, 'BUSINESS_RULE_VIOLATION', 'The category has active products assigned to it')
    }
    category.active = false
    return this.ok({ ...category })
  }

  private nameTaken(name: string, exceptId?: string) {
    return this.categories.some(
      (category) => category.active && category.categoryId !== exceptId && category.name.toLowerCase() === name.toLowerCase(),
    )
  }

  private duplicate() {
    return this.fail(422, 'BUSINESS_RULE_VIOLATION', 'An active category with this name already exists', [
      { field: 'name', message: 'already used by an active category' },
    ])
  }
}
