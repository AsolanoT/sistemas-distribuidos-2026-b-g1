import { useId } from 'react'
import { listCopy } from '../model/listCopy'
import type { SummaryTile } from '../model/summary'
import { Button } from './Button'
import { Skeleton } from './Skeleton'
import styles from './StatTile.module.css'

interface StatTileProps {
  tile: SummaryTile
  onRetry: () => void
}

// One stat tile. It loads and fails on its own: loading shows a skeleton, a
// failure shows — with a retry that names the tile it retries.
export function StatTile({ tile, onRetry }: StatTileProps) {
  const labelId = useId()
  const { state } = tile

  return (
    <li className={styles.tile} aria-labelledby={labelId} aria-busy={state.status === 'loading' || undefined}>
      <span id={labelId} className={styles.label}>
        {tile.label}
      </span>
      {state.status === 'loading' && <Skeleton shape="figure" />}
      {state.status === 'ready' && <span className={styles.value}>{state.value}</span>}
      {state.status === 'error' && (
        <>
          <span className={styles.value} role="img" aria-label={listCopy.tileUnavailableLabel}>
            {listCopy.tileUnavailable}
          </span>
          <Button variant="secondary" size="small" aria-label={listCopy.retryTile(tile.label)} onClick={onRetry}>
            {listCopy.retry}
          </Button>
        </>
      )}
    </li>
  )
}
