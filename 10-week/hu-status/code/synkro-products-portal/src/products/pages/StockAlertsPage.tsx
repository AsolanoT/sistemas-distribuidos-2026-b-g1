import { useMemo } from 'react'
import { AlertStatusFilter } from '../components/AlertStatusFilter'
import { StockAlertsBody } from '../components/StockAlertsBody'
import { alertsCopy } from '../model/alertsCopy'
import { createDateFormatter } from '../model/dateFormat'
import type { Loadable } from '../model/loadable'
import type { Page } from '../model/page'
import { toAlertRow, type AlertRow, type StockAlertResponse } from '../model/stockAlert'
import styles from './StockAlertsPage.module.css'
import { useProductNames } from './useProductNames'
import { useStockAlerts } from './useStockAlerts'

interface StockAlertsPageProps {
  // The time zone dates are written in. The browser's by default; tests pass one.
  timeZone?: string
}

// The stock alerts list (/stock-alerts): read-only, since the worker opens and
// resolves alerts. The service answers only product ids, so the names are loaded
// for the page's alerts and each name links to the product in /products.
export function StockAlertsPage({ timeZone }: StockAlertsPageProps) {
  const alerts = useStockAlerts()
  const formatDate = useMemo(() => createDateFormatter(timeZone), [timeZone])
  const rows = useMemo(() => toRows(alerts.state, formatDate), [alerts.state, formatDate])
  const nameOf = useProductNames(rows.status === 'ready' ? rows.value.data.map((row) => row.productId) : [])

  return (
    <section>
      <header className={styles.header}>
        <h1 className={styles.title}>{alertsCopy.title}</h1>
        <p className={styles.subtitle}>{alertsCopy.subtitle}</p>
      </header>

      <section className={styles.card}>
        <AlertStatusFilter value={alerts.filter} onChange={alerts.changeFilter} />
        <StockAlertsBody
          state={rows}
          filter={alerts.filter}
          nameOf={nameOf}
          onRetry={alerts.retry}
          onPageChange={alerts.goToPage}
        />
      </section>
    </section>
  )
}

function toRows(state: Loadable<Page<StockAlertResponse>>, formatDate: (iso: string) => string): Loadable<Page<AlertRow>> {
  if (state.status !== 'ready') return state
  return { status: 'ready', value: { ...state.value, data: state.value.data.map((alert) => toAlertRow(alert, formatDate)) } }
}
