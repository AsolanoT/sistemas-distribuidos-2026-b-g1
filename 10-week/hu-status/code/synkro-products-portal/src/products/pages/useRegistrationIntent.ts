import { useCallback } from 'react'
import { createProduct } from '../api/createProduct'
import type { CreateProductFailure } from '../model/createProductFailure'
import type { Result } from '../model/formFailure'
import type { ProductResponse } from '../model/product'
import type { NewProduct, ProductField } from '../model/productForm'
import { useSubmissionIntent } from './useSubmissionIntent'

// What one submission came to. "ignored" means nothing happened that the form
// should react to: a submission was already in flight, or the form was closed
// before the answer arrived.
export type SubmitOutcome =
  | { status: 'registered'; product: ProductResponse }
  | { status: 'failed'; failure: CreateProductFailure }
  | { status: 'ignored' }

async function sendProduct(product: NewProduct, idempotencyKey: string): Promise<Result<ProductResponse, ProductField>> {
  const result = await createProduct(product, idempotencyKey)
  return result.ok ? { ok: true, value: result.product } : result
}

// Registers one product per intent (see useSubmissionIntent).
export function useRegistrationIntent() {
  const { isPending, submit: send } = useSubmissionIntent(sendProduct)

  const submit = useCallback(
    async (product: NewProduct): Promise<SubmitOutcome> => {
      const outcome = await send(product)
      if (outcome.status === 'done') return { status: 'registered', product: outcome.value }
      return outcome
    },
    [send],
  )

  return { isPending, submit }
}
