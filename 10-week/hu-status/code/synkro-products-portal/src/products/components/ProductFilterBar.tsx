import { useState, type FormEvent } from 'react'
import type { CategoryResponse } from '../model/category'
import { listCopy } from '../model/listCopy'
import type { Loadable } from '../model/loadable'
import type { FilterChange, ProductFilters } from '../model/product'
import { Button } from './Button'
import { Field } from './Field'
import styles from './ProductFilterBar.module.css'

interface ProductFilterBarProps {
  filters: ProductFilters
  categories: Loadable<CategoryResponse[]>
  onChange: (change: FilterChange) => void
  onRetryCategories: () => void
  // The stock lookup shows active products only: no status filter, and no inactive category to pick.
  showStatus?: boolean
  activeCategoriesOnly?: boolean
}

type StatusChoice = 'all' | 'active' | 'inactive'

// Name is applied on submit (a search), the other two filters apply as soon as they change.
// None of them is a required field.
export function ProductFilterBar({
  filters,
  categories,
  onChange,
  onRetryCategories,
  showStatus = true,
  activeCategoriesOnly = false,
}: ProductFilterBarProps) {
  const [nameDraft, setNameDraft] = useState(filters.name ?? '')

  function submitName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onChange({ name: nameDraft.trim() })
  }

  return (
    <form role="search" onSubmit={submitName} className={styles.filters}>
      <div className={styles.name}>
        <Field id="product-name" label={listCopy.filters.name} hint={listCopy.filters.nameHint} required={false}>
          {(control) => (
            <div className={styles.search}>
              <div className={styles.grow}>
                <input {...control} type="text" value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} />
              </div>
              <Button type="submit" variant="secondary">
                {listCopy.filters.search}
              </Button>
            </div>
          )}
        </Field>
      </div>

      <CategoryFilter
        categoryId={filters.categoryId}
        categories={categories}
        activeOnly={activeCategoriesOnly}
        onChange={onChange}
        onRetry={onRetryCategories}
      />

      {showStatus && (
      <Field id="product-status" label={listCopy.filters.status} required={false}>
        {(control) => (
          <select
            {...control}
            value={statusChoice(filters.active)}
            onChange={(event) => onChange({ active: activeFrom(event.target.value as StatusChoice) })}
          >
            <option value="all">{listCopy.filters.statusOptions.all}</option>
            <option value="active">{listCopy.filters.statusOptions.active}</option>
            <option value="inactive">{listCopy.filters.statusOptions.inactive}</option>
          </select>
        )}
      </Field>
      )}
    </form>
  )
}

interface CategoryFilterProps {
  categoryId: string | undefined
  categories: Loadable<CategoryResponse[]>
  activeOnly: boolean
  onChange: (change: FilterChange) => void
  onRetry: () => void
}

function CategoryFilter({ categoryId, categories, activeOnly, onChange, onRetry }: CategoryFilterProps) {
  const failed = categories.status === 'error'

  return (
    <Field
      id="product-category"
      label={listCopy.filters.category}
      required={false}
      after={
        failed && (
          <div role="alert" className={styles.categoriesFailed}>
            <p className={styles.failedMessage}>{listCopy.filters.categoriesFailed}</p>
            <Button variant="secondary" onClick={onRetry}>
              {listCopy.filters.retryCategories}
            </Button>
          </div>
        )
      }
    >
      {(control) => (
        <select
          {...control}
          value={categoryId ?? ''}
          disabled={categories.status !== 'ready'}
          onChange={(event) => onChange({ categoryId: event.target.value || undefined })}
        >
          {categories.status === 'loading' && <option value="">{listCopy.filters.categoriesLoading}</option>}
          {failed && <option value="">{listCopy.filters.categoriesUnavailable}</option>}
          {categories.status === 'ready' && (
            <>
              <option value="">{listCopy.filters.allCategories}</option>
              {categories.value
                .filter((category) => !activeOnly || category.active)
                .map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.active ? category.name : listCopy.filters.inactiveCategory(category.name)}
                  </option>
                ))}
            </>
          )}
        </select>
      )}
    </Field>
  )
}

function statusChoice(active: boolean | undefined): StatusChoice {
  if (active === undefined) return 'all'
  return active ? 'active' : 'inactive'
}

function activeFrom(choice: StatusChoice): boolean | undefined {
  if (choice === 'all') return undefined
  return choice === 'active'
}
