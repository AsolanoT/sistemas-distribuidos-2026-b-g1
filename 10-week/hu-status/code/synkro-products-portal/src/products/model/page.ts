// Pagination shape of every list in the products API (_shared.yaml, PageMeta).
export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Page<T> {
  data: T[]
  meta: PageMeta
}

// After a reload the page the user was on may no longer exist (the only product of
// the last page was deactivated under a filter that hides it). It then goes back to
// the last page there is. With no pages at all there is nothing to go back to.
export function lastValidPage(page: number, totalPages: number): number {
  return totalPages > 0 && page > totalPages ? totalPages : page
}
