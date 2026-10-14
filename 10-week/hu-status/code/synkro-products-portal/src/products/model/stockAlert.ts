// Mirrors StockAlertResponse in synkro-products-api.yaml. It carries only the
// product id: the name comes from the product itself.
export interface StockAlertResponse {
  alertId: string
  productId: string
  status: 'OPEN' | 'RESOLVED'
  stockAtOpening: number
  openedAt: string
  // Present only when the alert is resolved.
  resolvedAt?: string
}

// What the screen's Estado filter offers. "all" omits the status.
export type AlertStatusFilter = 'open' | 'resolved' | 'all'

export const DEFAULT_ALERT_FILTER: AlertStatusFilter = 'open'

export function alertStatusParam(filter: AlertStatusFilter): StockAlertResponse['status'] | undefined {
  if (filter === 'all') return undefined
  return filter === 'open' ? 'OPEN' : 'RESOLVED'
}

// One table row, with the dates already written for display.
export interface AlertRow {
  alertId: string
  productId: string
  stockAtOpening: number
  status: 'open' | 'resolved'
  openedAt: string
  // Null while the alert is open.
  resolvedAt: string | null
}

export function toAlertRow(alert: StockAlertResponse, formatDate: (iso: string) => string): AlertRow {
  const resolved = alert.status === 'RESOLVED'

  return {
    alertId: alert.alertId,
    productId: alert.productId,
    stockAtOpening: alert.stockAtOpening,
    status: resolved ? 'resolved' : 'open',
    openedAt: formatDate(alert.openedAt),
    resolvedAt: resolved && alert.resolvedAt ? formatDate(alert.resolvedAt) : null,
  }
}
