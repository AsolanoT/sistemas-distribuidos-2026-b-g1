import { apiClient } from 'shell/apiClient'
import type { Page } from '../model/page'
import type { StockAlertResponse } from '../model/stockAlert'

const ALERTS_PATH = '/api/v1/stock-alerts'
const ALERTS_PAGE_SIZE = 20
const ALL_ALERTS_PAGE_SIZE = 100

interface AlertQuery {
  status?: StockAlertResponse['status']
  page: number
  limit?: number
}

interface ListOptions {
  signal?: AbortSignal
}

// One page of alerts, newest first, through the host's single client.
export function listStockAlerts(
  { status, page, limit = ALERTS_PAGE_SIZE }: AlertQuery,
  options: ListOptions = {},
): Promise<Page<StockAlertResponse>> {
  return apiClient.request<Page<StockAlertResponse>>(ALERTS_PATH, {
    query: { page, limit, status },
    signal: options.signal,
  })
}


// Every open alert, which is what the products list needs to tell which products
// are low on stock. Reads every page, like the categories: a partial answer would
// show a product as healthy when it is not, so any failing page fails the whole call.
export async function listAllOpenAlerts(options: ListOptions = {}): Promise<StockAlertResponse[]> {
  const alerts: StockAlertResponse[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const response = await listStockAlerts({ status: 'OPEN', page, limit: ALL_ALERTS_PAGE_SIZE }, options)
    alerts.push(...response.data)
    totalPages = response.meta.totalPages
    page += 1
  }

  return alerts
}
