import { listCopy } from '../model/listCopy'
import { Button } from './Button'
import styles from './ListState.module.css'

// The table could not be loaded: an inline alert in the table area, with a retry.
// The message is ink on the card (error-700 text would be 4.34:1 on the canvas)
// and the red bar carries the kind of message.
export function ListError({ message = listCopy.failed, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div role="alert" className={styles.alert}>
      <p className={styles.message}>{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        {listCopy.retry}
      </Button>
    </div>
  )
}
