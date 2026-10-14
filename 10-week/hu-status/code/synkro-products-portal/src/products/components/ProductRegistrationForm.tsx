import { useCallback } from 'react'
import type { CategoryResponse } from '../model/category'
import type { Loadable } from '../model/loadable'
import type { ProductResponse } from '../model/product'
import type { NewProduct, ProductField, ProductFormValues } from '../model/productForm'
import { registrationCopy } from '../model/registrationCopy'
import type { SubmitOutcome } from '../pages/useSingleFlight'
import { useRegistrationIntent } from '../pages/useRegistrationIntent'
import { ProductForm } from './ProductForm'

interface ProductRegistrationFormProps {
  categories: Loadable<CategoryResponse[]>
  onRetryCategories: () => void
  onRegistered: (product: ProductResponse) => void
  onCancel: () => void
}

const EMPTY_VALUES: ProductFormValues = { name: '', price: '', categoryId: '' }

// Registers a product: the shared product form, sent as one registration per
// intent (the same data sent again after a failure reuses its Idempotency-Key).
export function ProductRegistrationForm({
  categories,
  onRetryCategories,
  onRegistered,
  onCancel,
}: ProductRegistrationFormProps) {
  const { isPending, submit: register } = useRegistrationIntent()

  const submit = useCallback(
    async (product: NewProduct): Promise<SubmitOutcome<ProductResponse, ProductField>> => {
      const outcome = await register(product)
      return outcome.status === 'registered' ? { status: 'done', value: outcome.product } : outcome
    },
    [register],
  )

  return (
    <ProductForm
      title={registrationCopy.title}
      submitLabel={registrationCopy.submit}
      submittingLabel={registrationCopy.submitting}
      cancelLabel={registrationCopy.cancel}
      initialValues={EMPTY_VALUES}
      categories={categories}
      onRetryCategories={onRetryCategories}
      isPending={isPending}
      submit={submit}
      onDone={onRegistered}
      onCancel={onCancel}
    />
  )
}
