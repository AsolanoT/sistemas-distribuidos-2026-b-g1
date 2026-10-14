import { useState } from 'react'
import { listAllOpenAlerts } from '../api/stockAlertsApi'
import { useLoad } from './useLoad'

const NO_PRODUCTS: ReadonlySet<string> = new Set()

const loadOpenProductIds = async (_: null, signal: AbortSignal) =>
  new Set((await listAllOpenAlerts({ signal })).map((alert) => alert.productId))

// The ids of the products with an open alert, which is how the list knows which
// ones are low on stock. It loads on its own, so the table never waits for it. The
// last known ids are kept while it reloads or after a reload fails, so the badges
// do not flicker and "nothing else changes".
export function useOpenAlerts() {
  const { state, retry } = useLoad(null, loadOpenProductIds)
  const [lowStockIds, setLowStockIds] = useState(NO_PRODUCTS)

  if (state.status === 'ready' && state.value !== lowStockIds) setLowStockIds(state.value)

  return { lowStockIds, status: state.status, reload: retry }
}
