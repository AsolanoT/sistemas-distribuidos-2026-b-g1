const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integer = new Intl.NumberFormat('es-CO');

const dateTime = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? money.format(n) : '—';
}

export function formatNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? integer.format(n) : '—';
}

/**
 * The API sends a local ISO timestamp with no offset (2026-08-29T21:41:46.335),
 * which Date parses as local time — exactly what we want to show back.
 */
export function formatDateTime(value) {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : dateTime.format(parsed);
}

export function initials(name) {
  return (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
