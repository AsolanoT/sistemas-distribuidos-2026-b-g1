import type { CategoryResponse } from './category'
import { listCopy } from './listCopy'
import type { Loadable } from './loadable'
import { stockCopy } from './stockCopy'

export type SummaryTileId = 'activeProducts' | 'outOfStock' | 'activeCategories' | 'sellable' | 'inStock'

// One stat tile of the list: its label and the state of its own request.
export interface SummaryTile {
  id: SummaryTileId
  label: string
  state: Loadable<number>
}

// The categories are the ones the page already loads for the filter and the
// registration form, so this tile costs no request of its own.
export function countActiveCategories(categories: Loadable<CategoryResponse[]>): Loadable<number> {
  if (categories.status !== 'ready') return categories
  return { status: 'ready', value: categories.value.filter((category) => category.active).length }
}

// The wireframe's three tiles, in order. Each one keeps its own state, so one
// failing never changes the others.
export function toSummaryTiles(
  activeProducts: Loadable<number>,
  outOfStock: Loadable<number>,
  categories: Loadable<CategoryResponse[]>,
): SummaryTile[] {
  return [
    { id: 'activeProducts', label: listCopy.tiles.activeProducts, state: activeProducts },
    { id: 'outOfStock', label: listCopy.tiles.outOfStock, state: outOfStock },
    { id: 'activeCategories', label: listCopy.tiles.activeCategories, state: countActiveCategories(categories) },
  ]
}

// The stock lookup's tiles: the active products are the sellable ones, the sold out
// ones are Agotados, and En stock is the difference, so it needs both counts: it is
// loading while either loads and fails when either fails (an error wins over loading).
export function toLookupTiles(activeProducts: Loadable<number>, outOfStock: Loadable<number>): SummaryTile[] {
  return [
    { id: 'sellable', label: stockCopy.tiles.sellable, state: activeProducts },
    { id: 'inStock', label: stockCopy.tiles.inStock, state: inStockCount(activeProducts, outOfStock) },
    { id: 'outOfStock', label: stockCopy.tiles.outOfStock, state: outOfStock },
  ]
}

function inStockCount(active: Loadable<number>, soldOut: Loadable<number>): Loadable<number> {
  if (active.status === 'error' || soldOut.status === 'error') return { status: 'error' }
  if (active.status === 'loading' || soldOut.status === 'loading') return { status: 'loading' }
  return { status: 'ready', value: Math.max(0, active.value - soldOut.value) }
}
