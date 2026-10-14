import { useCallback } from 'react'
import { updateProduct } from '../api/productManagement'
import type { CategoryResponse } from '../model/category'
import type { Loadable } from '../model/loadable'
import { managementCopy } from '../model/managementCopy'
import type { ProductResponse } from '../model/product'
import type { NewProduct, ProductFormValues } from '../model/productForm'
import { formatPriceText } from '../model/priceText'
import { registrationCopy } from '../model/registrationCopy'
import { useSingleFlight } from '../pages/useSingleFlight'
import { ProductForm } from './ProductForm'

interface ProductEditFormProps {
  product: ProductResponse
  categories: Loadable<CategoryResponse[]>
  onRetryCategories: () => void
  onUpdated: (product: ProductResponse) => void
  // The service says the product no longer exists: the page reloads its list.
  onOutdated: () => void
  onCancel: () => void
}

// Edits a product: the shared product form, opened with the product's own data.
// The price is shown as the user would type it, and a category that is no longer
// active is not kept: the field starts empty and says why, since the contract
// requires an active one.
export function ProductEditForm({
  product,
  categories,
  onRetryCategories,
  onUpdated,
  onOutdated,
  onCancel,
}: ProductEditFormProps) {
  const send = useCallback((data: NewProduct) => updateProduct(product.productId, data), [product.productId])
  const { isPending, submit } = useSingleFlight(send)

  const initialValues: ProductFormValues = {
    name: product.name,
    price: formatPriceText(product.priceCents),
    categoryId: product.categoryId,
  }

  return (
    <ProductForm
      title={managementCopy.edit.title}
      submitLabel={managementCopy.edit.submit}
      submittingLabel={managementCopy.edit.submitting}
      cancelLabel={registrationCopy.cancel}
      initialValues={initialValues}
      categories={categories}
      onRetryCategories={onRetryCategories}
      emptyCategoryHint={hasInactiveCategory(product, categories) ? managementCopy.edit.inactiveCategory : undefined}
      isPending={isPending}
      submit={submit}
      onDone={onUpdated}
      onOutdated={onOutdated}
      onCancel={onCancel}
    />
  )
}

function hasInactiveCategory(product: ProductResponse, categories: Loadable<CategoryResponse[]>): boolean {
  if (categories.status !== 'ready') return false
  return !categories.value.some((category) => category.active && category.categoryId === product.categoryId)
}
