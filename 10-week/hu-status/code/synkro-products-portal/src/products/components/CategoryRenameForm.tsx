import { useCallback } from 'react'
import { renameCategory } from '../api/categoryManagement'
import type { CategoryResponse } from '../model/category'
import { categoriesCopy } from '../model/categoriesCopy'
import { useSingleFlight } from '../pages/useSingleFlight'
import { CategoryNameForm } from './CategoryNameForm'

interface CategoryRenameFormProps {
  category: CategoryResponse
  onRenamed: (category: CategoryResponse) => void
  // The service says the category no longer exists: the page reloads its categories.
  onOutdated: () => void
  onCancel: () => void
}

// Renames a category: the same form as creating one, opened with the current name.
export function CategoryRenameForm({ category, onRenamed, onOutdated, onCancel }: CategoryRenameFormProps) {
  const send = useCallback((name: string) => renameCategory(category.categoryId, name), [category.categoryId])
  const { isPending, submit } = useSingleFlight(send)

  return (
    <CategoryNameForm
      title={categoriesCopy.form.renameTitle}
      submitLabel={categoriesCopy.form.renameSubmit}
      submittingLabel={categoriesCopy.form.renaming}
      initialName={category.name}
      isPending={isPending}
      submit={submit}
      onDone={onRenamed}
      onOutdated={onOutdated}
      onCancel={onCancel}
    />
  )
}
