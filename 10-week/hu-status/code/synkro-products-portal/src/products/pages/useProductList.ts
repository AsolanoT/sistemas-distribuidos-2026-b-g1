import { useCallback, useState } from 'react'
import { listProducts } from '../api/productsApi'
import { lastValidPage } from '../model/page'
import type { FilterChange, ProductFilters } from '../model/product'
import { useLoad } from './useLoad'

const FIRST_PAGE_WITHOUT_FILTERS: ProductFilters = { page: 1 }

const loadProducts = (filters: ProductFilters, signal: AbortSignal) => listProducts(filters, { signal })

// The product list screen's state: the filters and page, and the answer for them.
// It starts from the filters it is given (a link may ask for a name).
// The filters stay when a request fails, so a retry asks the same question again.
export function useProductList(initialFilters: ProductFilters = FIRST_PAGE_WITHOUT_FILTERS) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters)
  const { state, retry } = useLoad(filters, loadProducts)

  // A reload can leave the user on a page that no longer exists: go to the last one.
  const validPage = state.status === 'ready' ? lastValidPage(filters.page, state.value.meta.totalPages) : filters.page
  if (validPage !== filters.page) setFilters((current) => ({ ...current, page: validPage }))

  const updateFilters = useCallback((change: FilterChange) => {
    setFilters((current) => ({ ...current, ...change, page: 1 }))
  }, [])

  const goToPage = useCallback((page: number) => {
    setFilters((current) => ({ ...current, page }))
  }, [])

  // The newest product is on the first page. A new object is a new key, so this
  // asks again even when the list is already on the first page.
  const reloadFromFirstPage = useCallback(() => {
    setFilters((current) => ({ ...current, page: 1 }))
  }, [])

  // Asks again for the page the user is on, with the same filters: what an edit, a
  // stock adjustment or a deactivation needs, so the row changes in place.
  return { state, filters, updateFilters, goToPage, reloadFromFirstPage, reload: retry, retry }
}
