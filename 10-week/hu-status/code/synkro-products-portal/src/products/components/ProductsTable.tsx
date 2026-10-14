import type { ReactNode } from 'react'
import { listCopy } from '../model/listCopy'
import type { ProductRow } from '../model/product'
import { tableColumns, type TableColumn } from '../model/tableColumns'
import { Badge } from './Badge'
import { RowActions, type RowActionHandlers } from './RowActions'
import styles from './ProductsTable.module.css'
import { TableRegion } from './TableRegion'

interface ProductsTableProps {
  rows: ProductRow[]
  // The columns to show, in order. The catalogue's by default.
  columns?: TableColumn[]
  // What the row actions do. Without it (or without an actions column) the rows offer none.
  actions?: RowActionHandlers
  label?: string
}

// The table scrolls inside its own region, so a narrow screen never scrolls the
// page sideways. The region takes the keyboard focus so the scroll is reachable,
// and it is where focus falls back to when the control that opened a panel is gone.
export function ProductsTable({ rows, columns = tableColumns, actions, label = listCopy.tableRegion }: ProductsTableProps) {
  return (
    <TableRegion label={label} columns={columns} focusFallback="catalogue">
      {rows.map((row) => (
        <tr key={row.productId}>
          {columns.map((column) => (
            <td key={column.id} className={cellClass(column)}>
              {cellContent(column.id, row, actions)}
            </td>
          ))}
        </tr>
      ))}
    </TableRegion>
  )
}

const stockTone = { 'in-stock': 'success', 'low-stock': 'warning', 'out-of-stock': 'error' } as const

function cellClass({ id, numeric, alignEnd }: TableColumn): string | undefined {
  if (numeric) return styles.numeric
  if (alignEnd) return styles.actionsCell
  return id === 'product' ? styles.name : undefined
}

function cellContent(columnId: string, row: ProductRow, actions: RowActionHandlers | undefined): ReactNode {
  switch (columnId) {
    case 'product':
      return row.name
    case 'category':
      return (
        <Badge tone="neutral" marker={false}>
          {row.category}
        </Badge>
      )
    case 'price':
      return row.price
    case 'stock':
      return (
        <span className={styles.stock}>
          <Badge tone={stockTone[row.stockState]}>{listCopy.stock[row.stockState]}</Badge>
          {row.stock}
        </span>
      )
    case 'status':
      return (
        <Badge tone={row.active ? 'success' : 'neutral'}>
          {row.active ? listCopy.status.active : listCopy.status.inactive}
        </Badge>
      )
    case 'actions':
      return actions && <RowActions row={row} handlers={actions} />
    default:
      return null
  }
}
