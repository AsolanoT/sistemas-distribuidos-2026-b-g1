import { listCopy } from '../model/listCopy'
import { Button } from './Button'
import styles from './LowStockNotice.module.css'

// The open alerts could not be read, so "Stock bajo" cannot be shown. It says so
// politely above the table, which keeps working, and offers a retry.
export function LowStockNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="status" className={styles.notice}>
      <p className={styles.message}>{listCopy.lowStockCheckFailed}</p>
      <Button variant="secondary" size="small" onClick={onRetry}>
        {listCopy.retry}
      </Button>
    </div>
  )
}
