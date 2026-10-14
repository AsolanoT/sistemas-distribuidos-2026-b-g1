// Everything the stock alerts screen says to the user, in Spanish. Code, tests
// and comments stay in English; only these strings are user-facing.
export const alertsCopy = {
  title: 'Alertas de stock',
  subtitle: 'Se abren automáticamente cuando el stock de un producto baja al umbral o por debajo.',
  loading: 'Cargando alertas…',
  failed: 'No se pudieron cargar las alertas.',
  retry: 'Reintentar',
  emptyOpen: 'No hay alertas abiertas por ahora',
  emptyAll: 'Aún no hay alertas registradas',
  tableRegion: 'Tabla de alertas de stock',

  filter: {
    label: 'Estado',
    open: 'Abiertas',
    resolved: 'Resueltas',
    all: 'Todas',
  },

  columns: {
    product: 'Producto',
    stockAtOpening: 'Stock al abrir',
    status: 'Estado',
    openedAt: 'Abierta el',
    resolvedAt: 'Resuelta el',
  },

  status: {
    open: 'Abierta',
    resolved: 'Resuelta',
  },

  nameLoading: 'Cargando…',
  nameUnavailable: 'Producto no disponible',
  notResolved: '—',
} as const
