import type { CategoryResponse } from '../model/category'
import { categoriesCopy } from '../model/categoriesCopy'
import type { Loadable } from '../model/loadable'
import { Button } from './Button'
import styles from './CategoriesSection.module.css'
import { Skeleton } from './Skeleton'

const SKELETON_CHIPS = 4

interface CategoriesBodyProps {
  categories: Loadable<CategoryResponse[]>
  busy: boolean
  onRetry: () => void
  onCreate: () => void
  onRename: (category: CategoryResponse) => void
  onDeactivate: (category: CategoryResponse) => void
}

// The three states of the section's own request, and its data: skeleton chips
// while loading, an inline alert with a retry when it failed, an invitation to
// create the first category when none is active, and the chips.
export function CategoriesBody({ categories, busy, onRetry, onCreate, onRename, onDeactivate }: CategoriesBodyProps) {
  if (categories.status === 'loading') {
    return (
      <>
        <p className={styles.visuallyHidden}>
          {categoriesCopy.loading}
        </p>
        <ul aria-hidden="true" className={styles.chips}>
          {Array.from({ length: SKELETON_CHIPS }, (_, index) => (
            <li key={index} className={styles.skeletonChip}>
              <Skeleton shape="chip" />
            </li>
          ))}
        </ul>
      </>
    )
  }

  if (categories.status === 'error') {
    return (
      <div role="alert" className={styles.alert}>
        <p className={styles.message}>{categoriesCopy.failed}</p>
        <Button variant="secondary" onClick={onRetry}>
          {categoriesCopy.retry}
        </Button>
      </div>
    )
  }

  const active = categories.value.filter((category) => category.active)

  if (active.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.message}>{categoriesCopy.empty}</p>
        <Button variant="secondary" disabled={busy} data-opener="category-create" onClick={onCreate}>
          {categoriesCopy.create}
        </Button>
      </div>
    )
  }

  return (
    <ul aria-label={categoriesCopy.list} className={styles.chips}>
      {active.map((category) => (
        <li key={category.categoryId} className={styles.chip}>
          <span className={styles.name}>{category.name}</span>
          <span className={styles.controls}>
            <Button
              variant="ghost"
              size="small"
              disabled={busy}
              data-opener={`category-rename:${category.categoryId}`}
              aria-label={categoriesCopy.renameLabel(category.name)}
              onClick={() => onRename(category)}
            >
              {categoriesCopy.rename}
            </Button>
            <Button
              variant="danger"
              size="small"
              disabled={busy}
              data-opener={`category-deactivate:${category.categoryId}`}
              aria-label={categoriesCopy.deactivateLabel(category.name)}
              onClick={() => onDeactivate(category)}
            >
              {categoriesCopy.deactivate}
            </Button>
          </span>
        </li>
      ))}
    </ul>
  )
}
