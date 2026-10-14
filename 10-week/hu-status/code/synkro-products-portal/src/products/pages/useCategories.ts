import { listAllCategories } from '../api/productsApi'
import { useLoad } from './useLoad'

const loadCategories = (_: null, signal: AbortSignal) => listAllCategories({ signal })

// Every category, loaded once when the screen opens. It is not tied to the
// product filters, so changing a filter never asks for the categories again.
export function useCategories() {
  const { state, retry } = useLoad(null, loadCategories)

  return { state, retry }
}
