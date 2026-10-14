// Everything the product list says to the user, in Spanish. Code, tests and
// comments stay in English; only these strings are user-facing.
export const listCopy = {
  title: 'Productos',
  catalogue: 'Catálogo',
  loading: 'Cargando productos…',

  summary: 'Resumen del catálogo',
  tileUnavailable: '—',
  tileUnavailableLabel: 'Dato no disponible',
  retryTile: (label: string) => `Reintentar: ${label}`,

  tiles: {
    activeProducts: 'Productos activos',
    outOfStock: 'Agotados',
    activeCategories: 'Categorías activas',
  },

  tableRegion: 'Tabla de productos',
  columns: {
    product: 'Producto',
    category: 'Categoría',
    price: 'Precio',
    stock: 'Stock',
    status: 'Estado',
    actions: 'Acciones',
  },
  stock: {
    'in-stock': 'En stock',
    'low-stock': 'Stock bajo',
    'out-of-stock': 'Agotado',
  },
  status: {
    active: 'Activo',
    inactive: 'Inactivo',
  },
  filters: {
    name: 'Nombre',
    nameHint: 'Coincidencia parcial, sin distinguir mayúsculas',
    search: 'Buscar',
    category: 'Categoría',
    allCategories: 'Todas las categorías',
    inactiveCategory: (name: string) => `${name} (inactiva)`,
    categoriesLoading: 'Cargando categorías…',
    categoriesUnavailable: 'Categorías no disponibles',
    categoriesFailed: 'No se pudieron cargar las categorías.',
    retryCategories: 'Reintentar categorías',
    status: 'Estado',
    statusOptions: { all: 'Todos', active: 'Activos', inactive: 'Inactivos' },
  },

  pagination: {
    label: 'Paginación',
    previous: 'Anterior',
    next: 'Siguiente',
    page: (page: number, totalPages: number) => `Página ${page} de ${totalPages}`,
  },

  failed: 'No se pudieron cargar los productos.',
  lowStockCheckFailed: 'No se pudo comprobar el stock bajo. La lista sigue disponible.',
  retry: 'Reintentar',
  emptyCatalogue: 'Aún no hay productos registrados',
  noMatch: 'Ningún producto coincide con estos filtros',

  categoryLabel: {
    loading: 'Cargando…',
    unavailable: 'No disponible',
    unknown: 'Categoría desconocida',
  },
} as const
