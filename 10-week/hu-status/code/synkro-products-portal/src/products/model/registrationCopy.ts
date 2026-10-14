// Everything the registration form says to the user, in Spanish. Code, tests and
// comments stay in English; only these strings are user-facing.
export const registrationCopy = {
  openAction: 'Nuevo producto',
  title: 'Nuevo producto',
  submit: 'Registrar producto',
  submitting: 'Registrando…',
  cancel: 'Cancelar',
  retry: 'Reintentar',
  registered: 'Producto registrado',

  nameLabel: 'Nombre',
  nameHint: 'Entre 1 y 150 caracteres.',
  nameRequired: 'Escribe el nombre del producto.',
  nameTooLong: 'El nombre no puede superar los 150 caracteres.',

  priceLabel: 'Precio',
  priceHint: 'En pesos, sin separador de miles. Ejemplo: 12500,50',
  price: {
    empty: 'Escribe el precio.',
    invalid: 'Escribe solo números y, si lleva decimales, un punto o una coma. Ejemplo: 12500,50',
    zero: 'El precio debe ser mayor que cero.',
    tooManyDecimals: 'Usa como máximo dos decimales y escribe el precio sin separador de miles. Ejemplo: 1234,50',
    tooLarge: 'El precio es demasiado alto.',
  },

  categoryLabel: 'Categoría',
  categoryPlaceholder: 'Elige una categoría',
  categoryLoading: 'Cargando categorías…',
  categoryRequired: 'Elige una categoría.',
  categoryNotFound: 'La categoría no existe o está inactiva. Elige otra.',
  categoriesUnavailable: 'Categorías no disponibles',
  categoriesFailed: 'No se pudieron cargar las categorías.',
  categoriesEmpty: 'No hay categorías activas. Crea una antes de registrar productos.',

  notRegistered: 'No se pudo registrar el producto.',
  offline: 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
} as const
