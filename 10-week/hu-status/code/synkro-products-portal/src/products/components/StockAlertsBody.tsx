import { alertColumns } from '../model/alertColumns'
import { alertsCopy } from '../model/alertsCopy'
import type { Loadable } from '../model/loadable'
import type { Page } from '../model/page'
import type { AlertRow, AlertStatusFilter } from '../model/stockAlert'
import type { ProductNameState } from '../pages/useProductNames'
import { ListEmpty } from './ListEmpty'
import { ListError } from './ListError'
import { Pagination } from './Pagination'
import { ProductsTableSkeleton } from './ProductsTableSkeleton'
import { StockAlertsTable } from './StockAlertsTable'
import { VisuallyHidden } from './VisuallyHidden'

interface StockAlertsBodyProps {
  state: Loadable<Page<AlertRow>>
  filter: AlertStatusFilter
  nameOf: (productId: string) => ProductNameState
  onRetry: () => void
  onPageChange: (page: number) => void
}

// The four states of the alerts list: loading, error with retry, empty, and data.
// The empty message depends on the filter: Abiertas says there is nothing to act on.
export function StockAlertsBody({ state, filter, nameOf, onRetry, onPageChange }: StockAlertsBodyProps) {
  if (state.status === 'loading') {
    return (
      <>
        <VisuallyHidden>{alertsCopy.loading}</VisuallyHidden>
        <ProductsTableSkeleton columns={alertColumns} />
      </>
    )
  }
  if (state.status === 'error') return <ListError message={alertsCopy.failed} onRetry={onRetry} />

  const { data, meta } = state.value
  if (data.length === 0) {
    const message = filter === 'open' ? alertsCopy.emptyOpen : alertsCopy.emptyAll
    return <ListEmpty hasFilters={false} copy={{ empty: message, noMatch: message }} onRegister={undefined} />
  }

  return (
    <>
      <StockAlertsTable rows={data} nameOf={nameOf} />
      <Pagination meta={meta} onPageChange={onPageChange} />
    </>
  )
}
