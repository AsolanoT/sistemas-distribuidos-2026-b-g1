export type PriceError = 'empty' | 'invalid' | 'zero' | 'tooManyDecimals' | 'tooLarge'

export type PriceParse = { ok: true; priceCents: number } | { ok: false; error: PriceError }

const MINOR_UNITS_PER_UNIT = 100n
const LARGEST_MINOR_UNITS = BigInt(Number.MAX_SAFE_INTEGER)

// Digits, then optionally one "." or "," and one or two decimals.
const PRICE_SHAPE = /^(\d+)(?:[.,](\d{1,2}))?$/
// The same shape with three or more decimals: "1.234" is ambiguous between a
// thousand and a fraction, so it gets its own message instead of a guess.
const TOO_MANY_DECIMALS = /^\d+[.,]\d{3,}$/

// Reads the price the user typed as an integer count of minor units (1/100 COP).
// The integer comes from the digits with BigInt arithmetic, never from a float,
// so 0.07 is exactly 7.
export function parsePrice(text: string): PriceParse {
  const typed = text.trim()
  if (typed === '') return { ok: false, error: 'empty' }

  const shape = PRICE_SHAPE.exec(typed)
  if (!shape) {
    return { ok: false, error: TOO_MANY_DECIMALS.test(typed) ? 'tooManyDecimals' : 'invalid' }
  }

  const [, whole, decimals = ''] = shape
  const minorUnits = BigInt(whole) * MINOR_UNITS_PER_UNIT + BigInt(decimals.padEnd(2, '0'))

  if (minorUnits === 0n) return { ok: false, error: 'zero' }
  if (minorUnits > LARGEST_MINOR_UNITS) return { ok: false, error: 'tooLarge' }
  return { ok: true, priceCents: Number(minorUnits) }
}
