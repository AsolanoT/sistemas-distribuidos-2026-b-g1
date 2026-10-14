export type RowAction = 'edit' | 'adjust' | 'deactivate'

// The identity of a control that opens a panel or dialog, so the page can give
// the focus back to it when that panel or dialog closes.
export const openerKey = (action: RowAction, productId: string) => `${action}:${productId}`
