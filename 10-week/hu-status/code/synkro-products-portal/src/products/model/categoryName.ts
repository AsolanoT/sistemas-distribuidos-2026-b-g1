import { categoriesCopy } from './categoriesCopy'

const NAME_MAX_LENGTH = 100

export type CategoryNameValidation = { ok: true; name: string } | { ok: false; error: string }

// Mirrors CreateCategoryRequest in synkro-products-api.yaml: 1 to 100 characters,
// after trimming. The contract counts characters, so one outside the basic plane counts once.
export function validateCategoryName(text: string): CategoryNameValidation {
  const name = text.trim()

  if (name === '') return { ok: false, error: categoriesCopy.name.required }
  if ([...name].length > NAME_MAX_LENGTH) return { ok: false, error: categoriesCopy.name.tooLong }
  return { ok: true, name }
}
