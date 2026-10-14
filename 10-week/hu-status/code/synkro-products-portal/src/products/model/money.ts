// Money is an integer count of minor units (1/100 of a Colombian peso), so the
// formatting uses only integer arithmetic: BigInt quotient and remainder, never
// a float division or multiplication. Colombian conventions: "." groups
// thousands and "," separates the centavos.
const CURRENCY_CODE = 'COP'
const MINOR_UNITS_PER_UNIT = 100n

export function formatMinorUnits(minorUnits: number): string {
  if (!Number.isSafeInteger(minorUnits) || minorUnits < 0) {
    throw new RangeError(`Expected a non-negative integer of minor units, got ${minorUnits}`)
  }

  const amount = BigInt(minorUnits)
  const units = amount / MINOR_UNITS_PER_UNIT
  const centavos = amount % MINOR_UNITS_PER_UNIT

  return `${CURRENCY_CODE} ${groupThousands(units.toString())},${centavos.toString().padStart(2, '0')}`
}

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
