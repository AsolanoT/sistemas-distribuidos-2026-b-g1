import type { CategoryResponse } from './category'
import type { ProductResponse } from './product'

// What the page has open above the catalogue or in front of it. Only one thing is
// open at a time, so opening any of them leaves the controls that open the others
// unavailable until it closes. The product or category the panel is about travels
// with it.
export type Panel =
  | { kind: 'none' }
  | { kind: 'register' }
  | { kind: 'edit'; product: ProductResponse }
  | { kind: 'adjust'; product: ProductResponse }
  | { kind: 'deactivate'; product: ProductResponse }
  | { kind: 'createCategory' }
  | { kind: 'renameCategory'; category: CategoryResponse }
  | { kind: 'deactivateCategory'; category: CategoryResponse }

export const NO_PANEL: Panel = { kind: 'none' }

export const isPanelOpen = (panel: Panel) => panel.kind !== 'none'
