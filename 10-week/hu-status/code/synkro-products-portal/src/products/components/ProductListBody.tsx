import { listCopy } from '../model/listCopy'
import type { ListView } from '../model/productList'
import type { TableColumn } from '../model/tableColumns'
import { ListEmpty, type EmptyCopy } from './ListEmpty'
import { ListError } from './ListError'
import { Pagination } from './Pagination'
import styles from './ProductListBody.module.css'
import { ProductsTable } from './ProductsTable'
import { ProductsTableSkeleton } from './ProductsTableSkeleton'
import type { RowActionHandlers } from './RowActions'

interface ProductListBodyProps {
  view: ListView
  // What the row actions do; undefined when the rows offer none.
  actions?: RowActionHandlers
  // The columns to show; the catalogue's by default.
  columns?: TableColumn[]
  emptyCopy?: EmptyCopy
  tableLabel?: string
  onRetry: () => void
  onPageChange: (page: number) => void
  // Opens the registration form from the empty state; undefined while it cannot open.
  onRegister: (() => void) | undefined
}

// The four states of the list: loading, error with retry, empty, and data.
export function ProductListBody({
  view,
  actions,
  columns,
  emptyCopy,
  tableLabel,
  onRetry,
  onPageChange,
  onRegister,
}: ProductListBodyProps) {
  switch (view.status) {
    case 'loading':
      return (
        <>
          <p role="status" className={styles.visuallyHidden}>
            {listCopy.loading}
          </p>
          <ProductsTableSkeleton columns={columns} />
        </>
      )

    case 'error':
      return <ListError onRetry={onRetry} />

    case 'empty':
      return (
        <>
          <ListEmpty hasFilters={view.hasFilters} copy={emptyCopy} onRegister={onRegister} />
          {view.meta.totalPages > 0 && <Pagination meta={view.meta} onPageChange={onPageChange} />}
        </>
      )

    case 'data':
      return (
        <>
          <ProductsTable rows={view.rows} columns={columns} actions={actions} label={tableLabel} />
          <Pagination meta={view.meta} onPageChange={onPageChange} />
        </>
      )
  }
}
