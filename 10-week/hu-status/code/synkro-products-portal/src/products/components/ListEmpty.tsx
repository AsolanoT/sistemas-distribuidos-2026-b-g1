import { listCopy } from '../model/listCopy'
import { registrationCopy } from '../model/registrationCopy'
import { Button } from './Button'
import styles from './ListState.module.css'

export interface EmptyCopy {
  empty: string
  noMatch: string
}

interface ListEmptyProps {
  hasFilters: boolean
  copy?: EmptyCopy
  // Opens the registration form. Left out while registering is not possible.
  onRegister: (() => void) | undefined
}

const defaultCopy: EmptyCopy = { empty: listCopy.emptyCatalogue, noMatch: listCopy.noMatch }

// An empty catalogue points at "Nuevo producto"; filters that match nothing do not.
// The header's action is the view's one primary, so this one is secondary.
export function ListEmpty({ hasFilters, copy = defaultCopy, onRegister }: ListEmptyProps) {
  if (hasFilters) {
    return (
      <div className={styles.empty}>
        <p className={styles.message}>{copy.noMatch}</p>
      </div>
    )
  }

  return (
    <div className={styles.empty}>
      <p className={styles.message}>{copy.empty}</p>
      {onRegister && (
        <Button variant="secondary" data-opener="register" onClick={onRegister}>
          {registrationCopy.openAction}
        </Button>
      )}
    </div>
  )
}
