// Mirrors StockAdjustmentResponse in synkro-products-api.yaml.
export interface StockAdjustmentResponse {
  adjustmentId: string
  productId: string
  delta: number
  reason: string
  adjustedBy: string
  adjustedAt: string
  // The stock after this adjustment was applied.
  currentStock: number
}
