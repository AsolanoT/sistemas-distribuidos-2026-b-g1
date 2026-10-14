import { categoriesCopy } from './categoriesCopy'
import { validateCategoryName } from './categoryName'

describe('validateCategoryName', () => {
  it('accepts a name and trims it', () => {
    expect(validateCategoryName('  Periféricos ')).toEqual({ ok: true, name: 'Periféricos' })
  })

  it.each(['', '   '])('asks for a name when it is "%s"', (name) => {
    expect(validateCategoryName(name)).toEqual({ ok: false, error: categoriesCopy.name.required })
  })

  it('accepts 100 characters and rejects 101', () => {
    expect(validateCategoryName('a'.repeat(100)).ok).toBe(true)
    expect(validateCategoryName('a'.repeat(101))).toEqual({ ok: false, error: categoriesCopy.name.tooLong })
  })

  it('counts the trimmed name, not the spaces around it', () => {
    expect(validateCategoryName(` ${'a'.repeat(100)} `).ok).toBe(true)
  })
})
