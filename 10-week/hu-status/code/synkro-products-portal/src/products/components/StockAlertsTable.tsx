import { alertColumns } from '../model/alertColumns'
import { alertsCopy } from '../model/alertsCopy'
import type { AlertRow } from '../model/stockAlert'
import type { ProductNameState } from '../pages/useProductNames'
import { Badge } from './Badge'
import { PortalLink } from './PortalLink'
import styles from './ProductsTable.module.css'
import { TableRegion } from './TableRegion'

interface StockAlertsTableProps {
  rows: AlertRow[]
  nameOf: (productId: string) => ProductNameState
}

// The alerts, read-only: the worker opens and resolves them, so there are no actions.
export function StockAlertsTable({ rows, nameOf }: StockAlertsTableProps) {
  return (
    <TableRegion label={alertsCopy.tableRegion} columns={alertColumns}>
      {rows.map((row) => (
        <tr key={row.alertId}>
          <td className={styles.name}>
            <ProductName state={nameOf(row.productId)} />
          </td>
          <td className={styles.numeric}>{row.stockAtOpening}</td>
          <td>
            <Badge tone={row.status === 'open' ? 'warning' : 'success'}>{alertsCopy.status[row.status]}</Badge>
          </td>
          <td>{row.openedAt}</td>
          <td>{row.resolvedAt ?? alertsCopy.notResolved}</td>
        </tr>
      ))}
    </TableRegion>
  )
}

// The name links to the product in /products, to act on it there (adjust stock).
function ProductName({ state }: { state: ProductNameState }) {
  switch (state.status) {
    case 'loading':
      return <>{alertsCopy.nameLoading}</>
    case 'error':
      return <>{alertsCopy.nameUnavailable}</>
    case 'ready':
      return <PortalLink href={`/products?name=${encodeURIComponent(state.name)}`}>{state.name}</PortalLink>
  }
}
