export type StockState = 'in-stock' | 'low-stock' | 'out-of-stock'

// Stock zero is always "Agotado". The worker's threshold is global and the portal
// does not know it, so "Stock bajo" is read from the worker's own verdict: the
// product has an open alert and still has stock. Without alerts to go by (they
// have not arrived, or the caller may not read them) it is "En stock".
export function stockStateOf(stock: number, hasOpenAlert = false): StockState {
  if (stock <= 0) return 'out-of-stock'
  return hasOpenAlert ? 'low-stock' : 'in-stock'
}
