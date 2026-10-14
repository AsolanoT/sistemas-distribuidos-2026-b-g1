import { listCopy } from '../model/listCopy'
import type { SummaryTile, SummaryTileId } from '../model/summary'
import { StatTile } from './StatTile'
import styles from './SummaryTiles.module.css'

interface SummaryTilesProps {
  tiles: SummaryTile[]
  // Each tile retries only its own request.
  onRetry: Partial<Record<SummaryTileId, () => void>>
}

const noop = () => {}

export function SummaryTiles({ tiles, onRetry }: SummaryTilesProps) {
  return (
    <ul aria-label={listCopy.summary} className={styles.tiles}>
      {tiles.map((tile) => (
        <StatTile key={tile.id} tile={tile} onRetry={onRetry[tile.id] ?? noop} />
      ))}
    </ul>
  )
}
