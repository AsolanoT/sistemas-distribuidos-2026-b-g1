import type { CategoryResponse } from './category'
import { listCopy } from './listCopy'
import type { Loadable } from './loadable'
import type { Page, PageMeta } from './page'
import { toProductRow, type ProductFilters, type ProductResponse, type ProductRow } from './product'

// What the list body shows. The four states of the screen, per the frontend guide.
export type ListView =
  | { status: 'loading' }
  | { status: 'error' }
  // `hasFilters` tells an empty catalogue from filters that match nothing.
  | { status: 'empty'; meta: PageMeta; hasFilters: boolean }
  | { status: 'data'; rows: ProductRow[]; meta: PageMeta }

// Products and categories are separate requests, so the table keeps showing
// its rows while the categories load or after they failed.
export function toListView(
  products: Loadable<Page<ProductResponse>>,
  categories: Loadable<CategoryResponse[]>,
  filters: ProductFilters,
  // The stock lookup always asks for active products, which is not a filter the user chose.
  options: { ignoreActive?: boolean; lowStockIds?: ReadonlySet<string> } = {},
): ListView {
  if (products.status === 'loading') return { status: 'loading' }
  if (products.status === 'error') return { status: 'error' }

  const { data, meta } = products.value
  if (data.length === 0) return { status: 'empty', meta, hasFilters: hasActiveFilters(options.ignoreActive ? { ...filters, active: undefined } : filters) }

  const categoryLabel = labelForCategories(categories)
  return { status: 'data', rows: data.map((product) => toProductRow(product, categoryLabel, options.lowStockIds?.has(product.productId))), meta }
}

function labelForCategories(categories: Loadable<CategoryResponse[]>): (categoryId: string) => string {
  switch (categories.status) {
    case 'loading':
      return () => listCopy.categoryLabel.loading
    case 'error':
      return () => listCopy.categoryLabel.unavailable
    case 'ready': {
      const names = new Map(categories.value.map((category) => [category.categoryId, category.name]))
      return (categoryId) => names.get(categoryId) ?? listCopy.categoryLabel.unknown
    }
  }
}

// A blank name or category counts as no filter, the same as when the request is built.
export function hasActiveFilters({ name, categoryId, active }: ProductFilters): boolean {
  return Boolean(name?.trim()) || Boolean(categoryId) || active !== undefined
}
