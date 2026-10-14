// Everything the stock lookup says to the user, in Spanish. Code, tests and
// comments stay in English; only these strings are user-facing.
export const stockCopy = {
  title: 'Existencias',
  tiles: {
    sellable: 'Productos vendibles',
    inStock: 'En stock',
    outOfStock: 'Agotados',
  },
  tableRegion: 'Tabla de existencias',
  empty: 'Aún no hay productos disponibles',
  noMatch: 'Ningún producto coincide con la búsqueda',
} as const
