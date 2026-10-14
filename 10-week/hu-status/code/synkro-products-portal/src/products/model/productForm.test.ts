import { validateProductForm, type ProductFormValues } from './productForm'
import { registrationCopy } from './registrationCopy'

const CATEGORY_ID = '11111111-1111-4111-8111-111111111111'

const valid: ProductFormValues = { name: 'Wireless mouse', price: '12,5', categoryId: CATEGORY_ID }

describe('validateProductForm', () => {
  it('returns the product to send, with the name trimmed and the price in minor units', () => {
    const result = validateProductForm({ ...valid, name: '  Wireless mouse  ' })

    expect(result).toEqual({
      ok: true,
      product: { name: 'Wireless mouse', priceCents: 1250, categoryId: CATEGORY_ID },
    })
  })

  it('never includes stock in what it sends', () => {
    const result = validateProductForm(valid)

    expect(result.ok && Object.keys(result.product).sort()).toEqual(['categoryId', 'name', 'priceCents'])
  })

  describe('name', () => {
    it.each([
      ['empty', ''],
      ['only spaces', '    '],
    ])('is required when %s', (_label, name) => {
      expect(validateProductForm({ ...valid, name })).toEqual({
        ok: false,
        errors: { name: registrationCopy.nameRequired },
      })
    })

    it('accepts exactly 150 characters once trimmed', () => {
      const name = 'a'.repeat(150)

      expect(validateProductForm({ ...valid, name: ` ${name} ` })).toMatchObject({ ok: true, product: { name } })
    })

    it('rejects 151 characters', () => {
      expect(validateProductForm({ ...valid, name: 'a'.repeat(151) })).toEqual({
        ok: false,
        errors: { name: registrationCopy.nameTooLong },
      })
    })

    it('counts a character outside the basic plane once, as the contract does', () => {
      const name = '😀'.repeat(150)

      expect(validateProductForm({ ...valid, name }).ok).toBe(true)
    })
  })

  describe('price', () => {
    it.each([
      ['', registrationCopy.price.empty],
      ['0', registrationCopy.price.zero],
      ['-3', registrationCopy.price.invalid],
      ['abc', registrationCopy.price.invalid],
      ['1.234', registrationCopy.price.tooManyDecimals],
      ['99999999999999999999', registrationCopy.price.tooLarge],
    ])('reports "%s" with its own message', (price, message) => {
      expect(validateProductForm({ ...valid, price })).toEqual({ ok: false, errors: { price: message } })
    })

    it('asks to type it without thousands separators when the value has three decimals', () => {
      expect(registrationCopy.price.tooManyDecimals).toMatch(/separador de miles/)
    })
  })

  describe('category', () => {
    it('is required', () => {
      expect(validateProductForm({ ...valid, categoryId: '' })).toEqual({
        ok: false,
        errors: { categoryId: registrationCopy.categoryRequired },
      })
    })
  })

  it('reports every invalid field at once, so each can show its own error', () => {
    expect(validateProductForm({ name: ' ', price: 'abc', categoryId: '' })).toEqual({
      ok: false,
      errors: {
        name: registrationCopy.nameRequired,
        price: registrationCopy.price.invalid,
        categoryId: registrationCopy.categoryRequired,
      },
    })
  })
})
