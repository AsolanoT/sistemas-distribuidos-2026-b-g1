import { useCallback, useEffect, useRef, useState } from 'react'
import { getProduct } from '../api/productsApi'

export type ProductNameState = { status: 'loading' } | { status: 'ready'; name: string } | { status: 'error' }

// The name of each product the screen shows, from the product ids it holds. The
// alerts carry only ids, so each id is read once with its own request, in parallel,
// and the answer is kept for the life of the screen. Changing the ids (a new page)
// aborts what is still in flight; an aborted id is asked for again if it comes
// back. A product that cannot be loaded is `error` and affects nothing else.
export function useProductNames(productIds: readonly string[]) {
  const names = useRef(new Map<string, ProductNameState>())
  const [, setVersion] = useState(0)
  const idsKey = [...new Set(productIds)].join(',')

  useEffect(() => {
    const missing = idsKey === '' ? [] : idsKey.split(',').filter((id) => !names.current.has(id))
    if (missing.length === 0) return

    const controller = new AbortController()
    const settle = (id: string, state: ProductNameState) => {
      if (controller.signal.aborted) return
      names.current.set(id, state)
      setVersion((version) => version + 1)
    }

    for (const id of missing) {
      getProduct(id, { signal: controller.signal }).then(
        (product) => settle(id, { status: 'ready', name: product.name }),
        () => settle(id, { status: 'error' }),
      )
    }

    return () => controller.abort()
  }, [idsKey])

  return useCallback((productId: string): ProductNameState => names.current.get(productId) ?? { status: 'loading' }, [])
}
