// Everything the categories section says to the user, in Spanish. Code, tests
// and comments stay in English; only these strings are user-facing.
export const categoriesCopy = {
  title: 'Categorías',
  list: 'Categorías activas',
  loading: 'Cargando categorías…',
  failed: 'No se pudieron cargar las categorías',
  retry: 'Reintentar',
  empty: 'Aún no hay categorías',
  create: 'Nueva categoría',

  rename: 'Renombrar',
  deactivate: 'Desactivar',
  // The accessible names of a chip's controls say which category they are about.
  renameLabel: (name: string) => `Renombrar categoría ${name}`,
  deactivateLabel: (name: string) => `Desactivar categoría ${name}`,

  form: {
    createTitle: 'Nueva categoría',
    createSubmit: 'Crear categoría',
    creating: 'Creando…',
    renameTitle: 'Renombrar categoría',
    renameSubmit: 'Guardar nombre',
    renaming: 'Guardando…',
    cancel: 'Cancelar',
  },

  name: {
    label: 'Nombre',
    hint: 'Entre 1 y 100 caracteres.',
    required: 'Escribe el nombre de la categoría.',
    tooLong: 'El nombre no puede superar los 100 caracteres.',
    duplicate: 'Ya existe una categoría activa con ese nombre.',
  },

  created: 'Categoría creada',
  renamed: 'Categoría renombrada',
  deactivated: 'Categoría desactivada',

  gone: 'La categoría ya no existe',
  notCreated: 'No se pudo crear la categoría.',
  notRenamed: 'No se pudo renombrar la categoría.',
  notDeactivated: 'No se pudo desactivar la categoría.',
  hasActiveProducts:
    'No se puede desactivar: todavía tiene productos activos. Muévelos a otra categoría o desactívalos primero.',

  dialog: {
    title: (name: string) => `¿Desactivar la categoría "${name}"?`,
    message: 'Dejará de ofrecerse al registrar o editar productos.',
  },
} as const
