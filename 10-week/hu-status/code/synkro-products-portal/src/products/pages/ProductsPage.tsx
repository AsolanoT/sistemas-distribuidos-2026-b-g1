import { useId, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { CategoriesSection } from '../components/CategoriesSection'
import { ProductFilterBar } from '../components/ProductFilterBar'
import { LowStockNotice } from '../components/LowStockNotice'
import { ProductListBody } from '../components/ProductListBody'
import { ProductPanel } from '../components/ProductPanel'
import type { RowActionHandlers } from '../components/RowActions'
import { SummaryTiles } from '../components/SummaryTiles'
import { categoriesCopy } from '../model/categoriesCopy'
import type { CategoryResponse } from '../model/category'
import { initialNameFilter } from '../model/initialFilters'
import { listCopy } from '../model/listCopy'
import { managementCopy } from '../model/managementCopy'
import { openerKey, type RowAction } from '../model/openerKey'
import { isPanelOpen, NO_PANEL, type Panel } from '../model/panel'
import { toListView } from '../model/productList'
import type { ProductFilters, ProductResponse } from '../model/product'
import { registrationCopy } from '../model/registrationCopy'
import { toSummaryTiles } from '../model/summary'
import styles from './ProductsPage.module.css'
import { useAnnouncement } from './useAnnouncement'
import { useCategories } from './useCategories'
import { useFocusReturn } from './useFocusReturn'
import { useOpenAlerts } from './useOpenAlerts'
import { useProductList } from './useProductList'
import { useSummary } from './useSummary'

// The product catalogue screen. Products, categories and each summary tile load
// independently: one failing never changes the others. Registering, editing,
// adjusting stock and the category forms open in the page itself, and
// deactivations ask first in a dialog; only one of them is open at a time, so
// while one is, the controls that open the others are unavailable.
export function ProductsPage() {
  const [initialFilters] = useState<ProductFilters>(() => ({ page: 1, name: initialNameFilter(window.location.search) }))
  const products = useProductList(initialFilters)
  const categories = useCategories()
  const openAlerts = useOpenAlerts()
  const summary = useSummary()
  const announcement = useAnnouncement()
  const catalogueTitleId = useId()
  const view = toListView(products.state, categories.state, products.filters, { lowStockIds: openAlerts.lowStockIds })
  const tiles = toSummaryTiles(summary.activeProducts.state, summary.outOfStock.state, categories.state)

  const root = useRef<HTMLElement>(null)
  const [panel, setPanel] = useState<Panel>(NO_PANEL)
  const isBusy = isPanelOpen(panel)
  const focusReturn = useFocusReturn(root, view.status !== 'loading' && categories.state.status !== 'loading')

  const listedProducts = products.state.status === 'ready' ? products.state.value.data : []
  const currentProduct = (product: ProductResponse) =>
    listedProducts.find((listed) => listed.productId === product.productId) ?? product

  function open(next: Panel, opener: string, fallback: 'catalogue' | 'categories' = 'catalogue') {
    focusReturn.remember(opener, fallback)
    setPanel(next)
  }

  function close() {
    focusReturn.restore()
    setPanel(NO_PANEL)
  }

  // Every successful action closes its panel, reloads what it changed, and says so.
  function finish(message: string, ...reloads: (() => void)[]) {
    close()
    for (const reload of reloads) reload()
    announcement.announce(message)
  }

  function reloadProducts() {
    products.reload()
    summary.reload()
  }

  function openOnProduct(kind: RowAction, productId: string) {
    const product = listedProducts.find((listed) => listed.productId === productId)
    if (product) open({ kind, product }, openerKey(kind, productId))
  }

  const rowActions: RowActionHandlers = {
    onEdit: (productId) => openOnProduct('edit', productId),
    onAdjust: (productId) => openOnProduct('adjust', productId),
    onDeactivate: (productId) => openOnProduct('deactivate', productId),
    disabled: isBusy,
  }

  const openRegistration = () => open({ kind: 'register' }, 'register')
  const openOnCategory = (kind: 'renameCategory' | 'deactivateCategory', category: CategoryResponse) =>
    open({ kind, category }, `${kind === 'renameCategory' ? 'category-rename' : 'category-deactivate'}:${category.categoryId}`, 'categories')

  return (
    <section ref={root}>
      <div className={styles.header}>
        <h1 className={styles.title}>{listCopy.title}</h1>
        {!isBusy && (
          <Button data-opener="register" onClick={openRegistration}>
            {registrationCopy.openAction}
          </Button>
        )}
      </div>

      <div aria-live="polite" aria-atomic="true" className={styles.announcement}>
        {announcement.message}
      </div>

      <SummaryTiles
        tiles={tiles}
        onRetry={{
          activeProducts: summary.activeProducts.retry,
          outOfStock: summary.outOfStock.retry,
          activeCategories: categories.retry,
        }}
      />

      <ProductPanel
        panel={panel}
        categories={categories.state}
        onRetryCategories={categories.retry}
        currentProduct={currentProduct}
        onRegistered={() => finish(registrationCopy.registered, products.reloadFromFirstPage, summary.reload)}
        onUpdated={() => finish(managementCopy.edit.updated, reloadProducts)}
        onAdjusted={() => finish(managementCopy.adjust.adjusted, reloadProducts, openAlerts.reload)}
        onDeactivated={() => finish(managementCopy.deactivate.deactivated, reloadProducts)}
        onOutdated={reloadProducts}
        onClose={close}
      />

      <section aria-labelledby={catalogueTitleId} className={styles.catalogue}>
        <h2 id={catalogueTitleId} className={styles.catalogueTitle}>
          {listCopy.catalogue}
        </h2>
        <ProductFilterBar
          filters={products.filters}
          categories={categories.state}
          onChange={products.updateFilters}
          onRetryCategories={categories.retry}
        />
        {openAlerts.status === 'error' && <LowStockNotice onRetry={openAlerts.reload} />}
        <ProductListBody
          view={view}
          actions={rowActions}
          onRetry={products.retry}
          onPageChange={products.goToPage}
          onRegister={isBusy ? undefined : openRegistration}
        />
      </section>

      <CategoriesSection
        categories={categories.state}
        panel={panel}
        busy={isBusy}
        onRetry={categories.retry}
        onCreate={() => open({ kind: 'createCategory' }, 'category-create', 'categories')}
        onRename={(category) => openOnCategory('renameCategory', category)}
        onDeactivate={(category) => openOnCategory('deactivateCategory', category)}
        onCreated={() => finish(categoriesCopy.created, categories.retry)}
        onRenamed={() => finish(categoriesCopy.renamed, categories.retry)}
        onDeactivated={() => finish(categoriesCopy.deactivated, categories.retry, products.reload)}
        onOutdated={categories.retry}
        onClose={close}
      />
    </section>
  )
}
