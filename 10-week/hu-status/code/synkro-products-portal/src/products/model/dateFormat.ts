const EMPTY = '—'

// Writes an ISO instant as a medium date and a short time in Spanish (Colombia).
// The time zone is a parameter, so a test is deterministic; the browser's own
// zone is used when none is given. A value that is not a date is a dash.
export function createDateFormatter(timeZone?: string): (iso: string) => string {
  const formatter = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone })

  return (iso) => {
    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? EMPTY : formatter.format(date)
  }
}
