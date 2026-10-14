import { formatMinorUnits } from './money'
import { stockStateOf, type StockState } from './stockState'

// Mirrors ProductResponse in synkro-products-api.yaml. The response carries
// only categoryId, so the category name comes from the categories list.
export interface ProductResponse {
  productId: string
  name: string
  priceCents: number
  stock: number
  categoryId: string
  active: boolean
}

// What the list screen filters and pages by. An unset or blank value means "no filter".
export interface ProductFilters {
  name?: string
  categoryId?: string
  active?: boolean
  page: number
}

// A change made by one filter control. Changing a filter always returns to the first page.
export type FilterChange = Partial<Omit<ProductFilters, 'page'>>

// One table row, already formatted for display.
export interface ProductRow {
  productId: string
  name: string
  price: string
  stock: number
  stockState: StockState
  category: string
  active: boolean
}

export function toProductRow(
  product: ProductResponse,
  categoryLabel: (categoryId: string) => string,
  hasOpenAlert = false,
): ProductRow {
  return {
    productId: product.productId,
    name: product.name,
    price: formatMinorUnits(product.priceCents),
    stock: product.stock,
    stockState: stockStateOf(product.stock, hasOpenAlert),
    category: categoryLabel(product.categoryId),
    active: product.active,
  }
}
