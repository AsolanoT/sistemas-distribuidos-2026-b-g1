import { useCallback } from 'react'
import { createCategory } from '../api/categoryManagement'
import type { CategoryResponse } from '../model/category'
import { categoriesCopy } from '../model/categoriesCopy'
import { useSubmissionIntent } from '../pages/useSubmissionIntent'
import { CategoryNameForm } from './CategoryNameForm'

interface CategoryCreateFormProps {
  onCreated: (category: CategoryResponse) => void
  onCancel: () => void
}

const sendName = ({ name }: { name: string }, idempotencyKey: string) => createCategory(name, idempotencyKey)

// Creates a category, one creation per intent: the same name sent again after a
// failure reuses its Idempotency-Key, so the service creates nothing twice.
export function CategoryCreateForm({ onCreated, onCancel }: CategoryCreateFormProps) {
  const { isPending, submit } = useSubmissionIntent(sendName)
  const submitName = useCallback((name: string) => submit({ name }), [submit])

  return (
    <CategoryNameForm
      title={categoriesCopy.form.createTitle}
      submitLabel={categoriesCopy.form.createSubmit}
      submittingLabel={categoriesCopy.form.creating}
      initialName=""
      isPending={isPending}
      submit={submitName}
      onDone={onCreated}
      onCancel={onCancel}
    />
  )
}
