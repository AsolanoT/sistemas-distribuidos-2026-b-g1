import { useCallback, useState } from 'react'
import { listStockAlerts } from '../api/stockAlertsApi'
import { alertStatusParam, DEFAULT_ALERT_FILTER, type AlertStatusFilter } from '../model/stockAlert'
import { useLoad } from './useLoad'

interface AlertsQuery {
  filter: AlertStatusFilter
  page: number
}

const loadAlerts = ({ filter, page }: AlertsQuery, signal: AbortSignal) =>
  listStockAlerts({ status: alertStatusParam(filter), page }, { signal })

// The alerts screen's state: the status filter and the page, and the answer for
// them. Changing the filter returns to the first page, and the newest request wins.
export function useStockAlerts() {
  const [query, setQuery] = useState<AlertsQuery>({ filter: DEFAULT_ALERT_FILTER, page: 1 })
  const { state, retry } = useLoad(query, loadAlerts)

  const changeFilter = useCallback((filter: AlertStatusFilter) => setQuery({ filter, page: 1 }), [])
  const goToPage = useCallback((page: number) => setQuery((current) => ({ ...current, page })), [])

  return { state, filter: query.filter, changeFilter, goToPage, retry }
}
