import { useCallback } from 'react'
import { countProducts, type ProductCountQuery } from '../api/productsApi'
import { useLoad } from './useLoad'

// The two counts the tiles show. Constants, so the request runs again only on a
// retry or a reload, not on every render.
const ACTIVE_PRODUCTS: ProductCountQuery = { active: true }
const OUT_OF_STOCK: ProductCountQuery = { active: true, stockAtMost: 0 }

const loadCount = (query: ProductCountQuery, signal: AbortSignal) => countProducts(query, { signal })

// The product counts of the summary tiles. Each count loads, fails and retries
// on its own, and the newest answer wins (useLoad). The categories tile needs no
// request here: it counts the categories the page already holds.
export function useSummary() {
  const activeProducts = useLoad(ACTIVE_PRODUCTS, loadCount)
  const outOfStock = useLoad(OUT_OF_STOCK, loadCount)

  const reloadActive = activeProducts.retry
  const reloadOutOfStock = outOfStock.retry
  // A registered product changes both counts: it is active, and starts with stock 0.
  const reload = useCallback(() => {
    reloadActive()
    reloadOutOfStock()
  }, [reloadActive, reloadOutOfStock])

  return { activeProducts, outOfStock, reload }
}
