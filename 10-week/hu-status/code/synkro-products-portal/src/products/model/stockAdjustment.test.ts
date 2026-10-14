import { managementCopy } from './managementCopy'
import { parseDelta, quantityError, resultingStock, validateAdjustment } from './stockAdjustment'

describe('parseDelta', () => {
  it.each([
    ['5', 5],
    ['+5', 5],
    ['-3', -3],
    ['  12 ', 12],
    ['007', 7],
  ])('reads "%s" as %i', (text, delta) => {
    expect(parseDelta(text)).toEqual({ ok: true, delta })
  })

  it.each([
    ['', 'empty'],
    ['   ', 'empty'],
    ['0', 'zero'],
    ['+0', 'zero'],
    ['-0', 'zero'],
    ['1.5', 'invalid'],
    ['1,5', 'invalid'],
    ['abc', 'invalid'],
    ['5a', 'invalid'],
    ['--3', 'invalid'],
    ['+-3', 'invalid'],
    ['- 3', 'invalid'],
    ['9007199254740993', 'tooLarge'],
    ['-9007199254740993', 'tooLarge'],
  ])('rejects "%s" as %s', (text, error) => {
    expect(parseDelta(text)).toEqual({ ok: false, error })
  })
})

describe('resultingStock', () => {
  it('adds the quantity to the current stock', () => {
    expect(resultingStock(7, '5')).toBe(12)
    expect(resultingStock(7, '+5')).toBe(12)
    expect(resultingStock(7, '-3')).toBe(4)
  })

  it('is exactly zero when the quantity takes all the stock', () => {
    expect(resultingStock(7, '-7')).toBe(0)
  })

  it('is below zero when the quantity is larger than the stock', () => {
    expect(resultingStock(2, '-3')).toBe(-1)
  })

  it.each(['', '0', 'abc', '1.5'])('is unknown while the quantity "%s" is not a valid one', (text) => {
    expect(resultingStock(7, text)).toBeNull()
  })
})

describe('quantityError', () => {
  it('has nothing to say about a valid quantity', () => {
    expect(quantityError('-7', 7)).toBeUndefined()
    expect(quantityError('+5', 0)).toBeUndefined()
  })

  it('says a negative quantity larger than the stock cannot be taken', () => {
    expect(quantityError('-3', 2)).toBe(managementCopy.quantity.exceedsStock)
  })

  it.each([
    ['0', managementCopy.quantity.zero],
    ['1.5', managementCopy.quantity.invalid],
    ['abc', managementCopy.quantity.invalid],
    ['9007199254740993', managementCopy.quantity.tooLarge],
  ])('explains "%s"', (text, message) => {
    expect(quantityError(text, 7)).toBe(message)
  })

  it('stays quiet about an empty field until it is submitted', () => {
    expect(quantityError('', 7)).toBeUndefined()
    expect(quantityError('', 7, { requireValue: true })).toBe(managementCopy.quantity.empty)
  })
})

describe('validateAdjustment', () => {
  it('accepts a quantity and a reason, trimming the reason', () => {
    expect(validateAdjustment({ quantity: '+5', reason: '  Reposición  ' }, 7)).toEqual({
      ok: true,
      adjustment: { delta: 5, reason: 'Reposición' },
    })
  })

  it('reports every invalid field at once', () => {
    expect(validateAdjustment({ quantity: '0', reason: '   ' }, 7)).toEqual({
      ok: false,
      errors: { quantity: managementCopy.quantity.zero, reason: managementCopy.reason.required },
    })
  })

  it('rejects a negative quantity larger than the stock', () => {
    expect(validateAdjustment({ quantity: '-8', reason: 'Daño' }, 7)).toEqual({
      ok: false,
      errors: { quantity: managementCopy.quantity.exceedsStock },
    })
  })

  it('asks for a quantity when it is empty', () => {
    expect(validateAdjustment({ quantity: '', reason: 'Daño' }, 7)).toEqual({
      ok: false,
      errors: { quantity: managementCopy.quantity.empty },
    })
  })

  it('accepts a reason of exactly 255 characters and rejects 256', () => {
    expect(validateAdjustment({ quantity: '1', reason: 'a'.repeat(255) }, 0).ok).toBe(true)
    expect(validateAdjustment({ quantity: '1', reason: 'a'.repeat(256) }, 0)).toEqual({
      ok: false,
      errors: { reason: managementCopy.reason.tooLong },
    })
  })

  it('counts a character outside the basic plane once', () => {
    expect(validateAdjustment({ quantity: '1', reason: '😀'.repeat(255) }, 0).ok).toBe(true)
  })
})
