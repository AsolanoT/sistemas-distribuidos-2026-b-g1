import { alertsCopy } from './alertsCopy'
import type { TableColumn } from './tableColumns'

// The alerts table's columns, in the wireframe's order. The table and its skeleton
// are both built from this list.
export const alertColumns: TableColumn[] = [
  { id: 'product', header: alertsCopy.columns.product, numeric: false },
  { id: 'stockAtOpening', header: alertsCopy.columns.stockAtOpening, numeric: true },
  { id: 'status', header: alertsCopy.columns.status, numeric: false, badge: true },
  { id: 'openedAt', header: alertsCopy.columns.openedAt, numeric: false },
  { id: 'resolvedAt', header: alertsCopy.columns.resolvedAt, numeric: false },
]
