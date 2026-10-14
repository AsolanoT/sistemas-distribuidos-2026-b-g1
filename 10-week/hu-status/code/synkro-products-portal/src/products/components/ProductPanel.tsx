import { deactivateProduct } from '../api/productManagement'
import type { CategoryResponse } from '../model/category'
import type { Loadable } from '../model/loadable'
import { managementCopy } from '../model/managementCopy'
import type { Panel } from '../model/panel'
import type { ProductResponse } from '../model/product'
import { DeactivationDialog } from './DeactivationDialog'
import { ProductEditForm } from './ProductEditForm'
import { ProductRegistrationForm } from './ProductRegistrationForm'
import { StockAdjustmentForm } from './StockAdjustmentForm'
import styles from './ProductPanel.module.css'

interface ProductPanelProps {
  panel: Panel
  categories: Loadable<CategoryResponse[]>
  onRetryCategories: () => void
  // The product as the list holds it now: a reload brings fresher data than the
  // one the panel was opened with.
  currentProduct: (product: ProductResponse) => ProductResponse
  onRegistered: () => void
  onUpdated: () => void
  onAdjusted: () => void
  onDeactivated: () => void
  // The answer shows the list is out of date: the page reloads it.
  onOutdated: () => void
  onClose: () => void
}

// The slot above the catalogue: the form for the panel that is open, or the
// confirmation dialog of a deactivation. Category panels live in their section.
export function ProductPanel({
  panel,
  categories,
  onRetryCategories,
  currentProduct,
  onRegistered,
  onUpdated,
  onAdjusted,
  onDeactivated,
  onOutdated,
  onClose,
}: ProductPanelProps) {
  switch (panel.kind) {
    case 'register':
      return (
        <div className={styles.slot}>
          <ProductRegistrationForm
            categories={categories}
            onRetryCategories={onRetryCategories}
            onRegistered={onRegistered}
            onCancel={onClose}
          />
        </div>
      )

    case 'edit':
      return (
        <div className={styles.slot}>
          <ProductEditForm
            key={panel.product.productId}
            product={currentProduct(panel.product)}
            categories={categories}
            onRetryCategories={onRetryCategories}
            onUpdated={onUpdated}
            onOutdated={onOutdated}
            onCancel={onClose}
          />
        </div>
      )

    case 'adjust':
      return (
        <div className={styles.slot}>
          <StockAdjustmentForm
            key={panel.product.productId}
            product={currentProduct(panel.product)}
            onAdjusted={onAdjusted}
            onOutdated={onOutdated}
            onCancel={onClose}
          />
        </div>
      )

    case 'deactivate':
      return (
        <DeactivationDialog
          title={managementCopy.deactivate.title(panel.product.name)}
          message={managementCopy.deactivate.message}
          request={() => deactivateProduct(panel.product.productId)}
          onDeactivated={onDeactivated}
          onOutdated={onOutdated}
          onCancel={onClose}
        />
      )

    default:
      return null
  }
}
