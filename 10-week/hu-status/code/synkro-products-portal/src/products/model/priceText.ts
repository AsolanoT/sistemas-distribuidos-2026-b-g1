const MINOR_UNITS_PER_UNIT = 100n

// The price as the user would type it, from minor units (1/100 COP): the
// inverse of parsePrice. Only integer arithmetic is used, so no float ever
// rounds a price: 1250050 is "12500,50", 700 is "7" and 7 is "0,07".
export function formatPriceText(priceCents: number): string {
  if (!Number.isSafeInteger(priceCents) || priceCents < 0) return ''

  const minorUnits = BigInt(priceCents)
  const whole = minorUnits / MINOR_UNITS_PER_UNIT
  const cents = minorUnits % MINOR_UNITS_PER_UNIT

  return cents === 0n ? `${whole}` : `${whole},${cents.toString().padStart(2, '0')}`
}
