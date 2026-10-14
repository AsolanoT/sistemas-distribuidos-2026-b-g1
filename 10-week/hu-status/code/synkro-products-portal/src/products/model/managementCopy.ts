// Everything the product management flows say to the user, in Spanish: the row
// actions, the edit and stock adjustment forms, and the deactivation dialog.
// Code, tests and comments stay in English; only these strings are user-facing.
export const managementCopy = {
  actions: {
    edit: 'Editar',
    adjust: 'Ajustar stock',
    deactivate: 'Desactivar',
    // The accessible name of a row action says which product it is about.
    labelFor: (action: string, productName: string) => `${action} ${productName}`,
  },

  gone: 'El producto ya no existe',
  forbidden: 'No tienes permiso para realizar esta acción.',

  edit: {
    title: 'Editar producto',
    submit: 'Guardar cambios',
    submitting: 'Guardando…',
    updated: 'Producto actualizado',
    notUpdated: 'No se pudo actualizar el producto.',
    inactiveCategory: 'La categoría actual está inactiva. Elige una categoría activa.',
  },

  adjust: {
    title: 'Ajustar stock',
    product: 'Producto',
    currentStock: 'Stock actual',
    result: (stock: number) => `Quedará en: ${stock}`,
    submit: 'Ajustar stock',
    submitting: 'Ajustando…',
    adjusted: 'Stock ajustado',
    notAdjusted: 'No se pudo ajustar el stock.',
    stockChanged: 'El stock cambió y este ajuste lo dejaría por debajo de cero. Revisa la cantidad.',
  },

  quantity: {
    label: 'Cantidad a ajustar',
    hint: 'Número entero. Usa un signo menos para descontar. Ejemplo: -3',
    empty: 'Escribe la cantidad a ajustar.',
    invalid: 'Escribe un número entero, con signo si quieres descontar. Ejemplo: -3',
    zero: 'La cantidad no puede ser 0.',
    tooLarge: 'La cantidad es demasiado grande.',
    exceedsStock: 'No puedes descontar más unidades de las que hay en stock.',
  },

  reason: {
    label: 'Motivo',
    hint: 'Entre 1 y 255 caracteres.',
    required: 'Escribe el motivo del ajuste.',
    tooLong: 'El motivo no puede superar los 255 caracteres.',
  },

  deactivate: {
    title: (productName: string) => `¿Desactivar "${productName}"?`,
    message: 'El producto dejará de poder agregarse a nuevas ventas. Seguirá visible en el catálogo como inactivo.',
    cancel: 'Cancelar',
    confirm: 'Desactivar',
    confirming: 'Desactivando…',
    deactivated: 'Producto desactivado',
    notDeactivated: 'No se pudo desactivar el producto.',
  },
} as const
