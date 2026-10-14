import { useId } from 'react'
import { deactivateCategory } from '../api/categoryManagement'
import type { CategoryResponse } from '../model/category'
import { categoriesCopy } from '../model/categoriesCopy'
import type { Loadable } from '../model/loadable'
import type { Panel } from '../model/panel'
import { Button } from './Button'
import { CategoriesBody } from './CategoriesBody'
import styles from './CategoriesSection.module.css'
import { CategoryCreateForm } from './CategoryCreateForm'
import { CategoryRenameForm } from './CategoryRenameForm'
import { DeactivationDialog } from './DeactivationDialog'

interface CategoriesSectionProps {
  categories: Loadable<CategoryResponse[]>
  // What the page has open. The section shows the category panels; any other
  // panel only makes its controls unavailable (`busy`).
  panel: Panel
  busy: boolean
  onRetry: () => void
  onCreate: () => void
  onRename: (category: CategoryResponse) => void
  onDeactivate: (category: CategoryResponse) => void
  onCreated: (category: CategoryResponse) => void
  onRenamed: (category: CategoryResponse) => void
  onDeactivated: () => void
  onOutdated: () => void
  onClose: () => void
}

// The categories of the catalogue, below the table. It reads the page's one
// categories state but has its own loading, error and empty states, so the table
// and this section fail and load independently.
export function CategoriesSection({
  categories,
  panel,
  busy,
  onRetry,
  onCreate,
  onRename,
  onDeactivate,
  onCreated,
  onRenamed,
  onDeactivated,
  onOutdated,
  onClose,
}: CategoriesSectionProps) {
  const titleId = useId()
  const isEmpty = categories.status === 'ready' && categories.value.every((category) => !category.active)

  return (
    <section aria-labelledby={titleId} className={styles.section}>
      <div className={styles.header}>
        <h2 id={titleId} tabIndex={-1} data-focus-fallback="categories" className={styles.title}>
          {categoriesCopy.title}
        </h2>
        {/* An empty section points at the same action in its body, so it is offered once. */}
        {!isEmpty && (
          <Button variant="secondary" disabled={busy} data-opener="category-create" onClick={onCreate}>
            {categoriesCopy.create}
          </Button>
        )}
      </div>

      {panel.kind === 'createCategory' && (
        <div className={styles.formSlot}>
          <CategoryCreateForm onCreated={onCreated} onCancel={onClose} />
        </div>
      )}
      {panel.kind === 'renameCategory' && (
        <div className={styles.formSlot}>
          <CategoryRenameForm
            key={panel.category.categoryId}
            category={panel.category}
            onRenamed={onRenamed}
            onOutdated={onOutdated}
            onCancel={onClose}
          />
        </div>
      )}

      <CategoriesBody
        categories={categories}
        busy={busy}
        onRetry={onRetry}
        onCreate={onCreate}
        onRename={onRename}
        onDeactivate={onDeactivate}
      />

      {panel.kind === 'deactivateCategory' && (
        <DeactivationDialog
          title={categoriesCopy.dialog.title(panel.category.name)}
          message={categoriesCopy.dialog.message}
          request={() => deactivateCategory(panel.category.categoryId)}
          onDeactivated={onDeactivated}
          onOutdated={onOutdated}
          onCancel={onClose}
        />
      )}
    </section>
  )
}
