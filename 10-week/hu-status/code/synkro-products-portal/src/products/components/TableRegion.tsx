import type { ReactNode } from 'react'
import { tableColumns, type TableColumn } from '../model/tableColumns'
import styles from './ProductsTable.module.css'
import { ProductsTableHead } from './ProductsTableHead'

interface TableRegionProps {
  label: string
  columns?: TableColumn[]
  // Names where focus falls back to when the control that opened a panel is gone.
  focusFallback?: string
  // The rows, as table rows.
  children: ReactNode
}

// The chrome every table of the portal shares: a labelled, keyboard-reachable
// region that scrolls on its own, so a narrow screen never scrolls the page sideways.
export function TableRegion({ label, columns = tableColumns, focusFallback, children }: TableRegionProps) {
  return (
    <div role="region" aria-label={label} tabIndex={0} data-focus-fallback={focusFallback} className={styles.scroller}>
      <table className={styles.table}>
        <ProductsTableHead columns={columns} />
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
