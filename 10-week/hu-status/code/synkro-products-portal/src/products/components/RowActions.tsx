import { managementCopy } from '../model/managementCopy'
import { openerKey } from '../model/openerKey'
import type { ProductRow } from '../model/product'
import { Button } from './Button'
import styles from './ProductsTable.module.css'

// What the page does for a row's action; `disabled` while a panel or dialog is
// open, since the page shows one at a time.
export interface RowActionHandlers {
  onEdit: (productId: string) => void
  onAdjust: (productId: string) => void
  onDeactivate: (productId: string) => void
  disabled: boolean
}

// The actions of one row: Editar and Ajustar stock are ghost buttons, Desactivar
// is a danger button. Each one is named after the product, so a screen reader
// list of buttons tells them apart. An inactive row offers none: the contract
// has no way to reactivate a product.
export function RowActions({ row, handlers }: { row: ProductRow; handlers: RowActionHandlers }) {
  if (!row.active) return null

  const { actions } = managementCopy
  const { productId, name } = row

  return (
    <div className={styles.actions}>
      <Button
        variant="ghost"
        size="small"
        disabled={handlers.disabled}
        data-opener={openerKey('edit', productId)}
        aria-label={actions.labelFor(actions.edit, name)}
        onClick={() => handlers.onEdit(productId)}
      >
        {actions.edit}
      </Button>
      <Button
        variant="ghost"
        size="small"
        disabled={handlers.disabled}
        data-opener={openerKey('adjust', productId)}
        aria-label={actions.labelFor(actions.adjust, name)}
        onClick={() => handlers.onAdjust(productId)}
      >
        {actions.adjust}
      </Button>
      <Button
        variant="danger"
        size="small"
        disabled={handlers.disabled}
        data-opener={openerKey('deactivate', productId)}
        aria-label={actions.labelFor(actions.deactivate, name)}
        onClick={() => handlers.onDeactivate(productId)}
      >
        {actions.deactivate}
      </Button>
    </div>
  )
}
