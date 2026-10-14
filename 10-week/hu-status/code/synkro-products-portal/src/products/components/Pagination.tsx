import { listCopy } from '../model/listCopy'
import type { PageMeta } from '../model/page'
import { Button } from './Button'
import styles from './Pagination.module.css'

interface PaginationProps {
  meta: PageMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  return (
    <nav aria-label={listCopy.pagination.label} className={styles.pagination}>
      <Button variant="secondary" onClick={() => onPageChange(meta.page - 1)} disabled={meta.page <= 1}>
        {listCopy.pagination.previous}
      </Button>
      <span aria-live="polite" className={styles.position}>
        {listCopy.pagination.page(meta.page, meta.totalPages)}
      </span>
      <Button variant="secondary" onClick={() => onPageChange(meta.page + 1)} disabled={meta.page >= meta.totalPages}>
        {listCopy.pagination.next}
      </Button>
    </nav>
  )
}
