import { tableColumns, type TableColumn } from '../model/tableColumns'
import styles from './ProductsTable.module.css'
import { ProductsTableHead } from './ProductsTableHead'
import { Skeleton } from './Skeleton'

const SKELETON_ROWS = 8

interface ProductsTableSkeletonProps {
  columns?: TableColumn[]
}

// The loading shape of a table: the same columns and headers, with a placeholder
// in every cell. It is hidden from screen readers, which hear the loading status
// instead, and it takes no focus.
export function ProductsTableSkeleton({ columns = tableColumns }: ProductsTableSkeletonProps) {
  return (
    <div aria-hidden="true" className={styles.scroller}>
      <table className={styles.table}>
        <ProductsTableHead columns={columns} />
        <tbody>
          {Array.from({ length: SKELETON_ROWS }, (_, row) => (
            <tr key={row}>
              {columns.map((column) => (
                <td key={column.id} className={cellClass(column)}>
                  <Skeleton shape={column.badge ? 'badge' : 'text'} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function cellClass({ numeric, alignEnd }: TableColumn): string | undefined {
  if (numeric) return styles.numeric
  return alignEnd ? styles.actionsCell : undefined
}
