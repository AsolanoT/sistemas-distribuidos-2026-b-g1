import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiClient } from '../../test-doubles/shellApiClient'
import { CATEGORIES_PATH, CatalogueService, PRODUCTS_PATH } from '../../test-doubles/catalogueService'
import type { CategoryResponse } from '../model/category'
import type { ProductResponse } from '../model/product'
import { ProductsPage } from './ProductsPage'

const peripherals: CategoryResponse = { categoryId: 'c-1', name: 'Periféricos', active: true }
const monitors: CategoryResponse = { categoryId: 'c-2', name: 'Monitores', active: true }
const retired: CategoryResponse = { categoryId: 'c-3', name: 'Retirados', active: false }

const keyboard: ProductResponse = { productId: 'p-1', name: 'Teclado mecánico', priceCents: 1_250_050, stock: 2, categoryId: 'c-1', active: true }
const mouse: ProductResponse = { productId: 'p-2', name: 'Mouse inalámbrico', priceCents: 99_900, stock: 7, categoryId: 'c-1', active: true }
const screen24: ProductResponse = { productId: 'p-3', name: 'Pantalla 24', priceCents: 45_000_000, stock: 0, categoryId: 'c-2', active: true }
const oldMouse: ProductResponse = { productId: 'p-4', name: 'Mouse viejo', priceCents: 5_000, stock: 1, categoryId: 'c-3', active: false }

function start(overrides: { products?: ProductResponse[]; categories?: CategoryResponse[]; pageSize?: number } = {}) {
  const service = new CatalogueService({
    products: [keyboard, mouse, screen24, oldMouse],
    categories: [peripherals, monitors, retired],
    ...overrides,
  })
  const user = userEvent.setup()
  render(<ProductsPage />)
  return { service, user }
}

const tile = (name: string) => screen.getByRole('listitem', { name })
const row = (name: RegExp) => screen.getByRole('row', { name })
const action = (label: string, product: string) => screen.getByRole('button', { name: `${label} ${product}` })
const panelForm = (name: string) => within(screen.getByRole('form', { name }))
const announcement = () => document.querySelector<HTMLElement>('[aria-live="polite"][aria-atomic="true"]')!

async function ready() {
  await screen.findByRole('row', { name: /Teclado mecánico/ })
  await screen.findByRole('list', { name: 'Categorías activas' })
}

describe('ProductsPage: managing products and categories', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  describe('the actions column', () => {
    it('offers the three actions on an active row and none on an inactive one', async () => {
      start()
      await ready()

      expect(action('Editar', 'Teclado mecánico')).toBeInTheDocument()
      expect(action('Ajustar stock', 'Teclado mecánico')).toBeInTheDocument()
      expect(action('Desactivar', 'Teclado mecánico')).toBeInTheDocument()
      expect(within(row(/Mouse viejo/)).queryAllByRole('button')).toEqual([])
    })
  })

  describe('editing a product', () => {
    it('opens the form with the product data, in the slot above the catalogue', async () => {
      const { user } = start()
      await ready()

      await user.click(action('Editar', 'Teclado mecánico'))

      expect(panelForm('Editar producto').getByLabelText('Nombre')).toHaveValue('Teclado mecánico')
      expect(panelForm('Editar producto').getByLabelText('Precio')).toHaveValue('12500,50')
      expect(panelForm('Editar producto').getByLabelText('Categoría')).toHaveValue('c-1')
      expect(panelForm('Editar producto').getByLabelText('Nombre')).toHaveFocus()
    })

    it('saves, closes, refreshes the row and the tiles, and announces it', async () => {
      const { user, service } = start()
      await ready()
      const countsBefore = service.requests('GET', PRODUCTS_PATH).length

      await user.click(action('Editar', 'Teclado mecánico'))
      await user.clear(panelForm('Editar producto').getByLabelText('Nombre'))
      await user.type(panelForm('Editar producto').getByLabelText('Nombre'), 'Teclado gamer')
      await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

      expect(await screen.findByRole('row', { name: /Teclado gamer/ })).toBeInTheDocument()
      expect(screen.queryByRole('form', { name: 'Editar producto' })).not.toBeInTheDocument()
      expect(announcement()).toHaveTextContent('Producto actualizado')
      expect(service.requests('PUT', `${PRODUCTS_PATH}/p-1`)).toHaveLength(1)
      // The list and both counts were asked again.
      expect(service.requests('GET', PRODUCTS_PATH).length).toBeGreaterThanOrEqual(countsBefore + 3)
    })

    it('reloads the page the user was on, with the filters kept, not the first page', async () => {
      const { user, service } = start({ pageSize: 2 })
      await ready()
      await user.click(screen.getByRole('button', { name: 'Siguiente' }))
      await screen.findByRole('row', { name: /Pantalla 24/ })
      apiClient.request.mockClear()

      await user.click(action('Editar', 'Pantalla 24'))
      await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

      await waitFor(() => expect(screen.queryByRole('form', { name: 'Editar producto' })).not.toBeInTheDocument())
      await screen.findByRole('row', { name: /Pantalla 24/ })
      const lists = service.requests('GET', PRODUCTS_PATH).filter(([, options]) => options?.query?.limit !== 1)
      expect(lists.length).toBeGreaterThan(0)
      expect(lists.every(([, options]) => options?.query?.page === 2)).toBe(true)
    })

    it('puts the focus back on the Editar button of the row after saving', async () => {
      const { user } = start()
      await ready()

      await user.click(action('Editar', 'Mouse inalámbrico'))
      await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

      await screen.findByRole('row', { name: /Mouse inalámbrico/ })
      await waitFor(() => expect(action('Editar', 'Mouse inalámbrico')).toHaveFocus())
    })

    it('closes with Cancelar and puts the focus back on the control that opened it', async () => {
      const { user, service } = start()
      await ready()

      await user.click(action('Editar', 'Mouse inalámbrico'))
      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(screen.queryByRole('form', { name: 'Editar producto' })).not.toBeInTheDocument()
      expect(action('Editar', 'Mouse inalámbrico')).toHaveFocus()
      expect(service.requests('PUT')).toHaveLength(0)
    })

    it('shows a server error on its field and keeps the form open', async () => {
      const { user, service } = start()
      await ready()
      service.rejectNext('PUT', /\/p-1$/, 400, 'VALIDATION_ERROR', 'Invalid', [{ field: 'name', message: 'too long' }])

      await user.click(action('Editar', 'Teclado mecánico'))
      await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

      expect(await screen.findByLabelText('Nombre', { selector: 'input[aria-invalid="true"]' })).toBeInTheDocument()
      expect(screen.getByRole('form', { name: 'Editar producto' })).toBeInTheDocument()
    })

    it('says the product no longer exists and reloads the list when it was deleted meanwhile', async () => {
      const { user, service } = start()
      await ready()
      service.rejectNext('PUT', /\/p-1$/, 404, 'NOT_FOUND', 'Product not found')
      const listsBefore = service.requests('GET', PRODUCTS_PATH).length

      await user.click(action('Editar', 'Teclado mecánico'))
      await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

      expect(await screen.findByRole('alert')).toHaveTextContent('El producto ya no existe')
      await waitFor(() => expect(service.requests('GET', PRODUCTS_PATH).length).toBeGreaterThan(listsBefore))
    })
  })

  describe('adjusting stock', () => {
    it('opens with the product and its stock, shows the result live, and saves', async () => {
      const { user, service } = start()
      await ready()

      await user.click(action('Ajustar stock', 'Mouse inalámbrico'))
      const form = panelForm('Ajustar stock')
      expect(form.getByText('Mouse inalámbrico')).toBeInTheDocument()
      await user.type(form.getByLabelText('Cantidad a ajustar'), '-3')
      expect(form.getByText('Quedará en: 4')).toBeInTheDocument()
      await user.type(form.getByLabelText('Motivo'), 'Daño en bodega')
      await user.click(screen.getByRole('button', { name: 'Ajustar stock' }))

      await waitFor(() => expect(screen.queryByRole('form', { name: 'Ajustar stock' })).not.toBeInTheDocument())
      expect(announcement()).toHaveTextContent('Stock ajustado')
      expect(within(await screen.findByRole('row', { name: /Mouse inalámbrico/ })).getByText('4')).toBeInTheDocument()
      expect(service.requests('POST', `${PRODUCTS_PATH}/p-2/stock-adjustments`)).toHaveLength(1)
    })

    it('refreshes the tiles: taking all the stock makes the product sold out', async () => {
      const { user } = start()
      await ready()
      await waitFor(() => expect(within(tile('Agotados')).getByText('1')).toBeInTheDocument())

      await user.click(action('Ajustar stock', 'Teclado mecánico'))
      await user.type(panelForm('Ajustar stock').getByLabelText('Cantidad a ajustar'), '-2')
      await user.type(panelForm('Ajustar stock').getByLabelText('Motivo'), 'Venta mostrador')
      await user.click(screen.getByRole('button', { name: 'Ajustar stock' }))

      await waitFor(() => expect(within(tile('Agotados')).getByText('2')).toBeInTheDocument())
    })

    it('refuses a quantity larger than the stock in real time and sends nothing', async () => {
      const { user, service } = start()
      await ready()

      await user.click(action('Ajustar stock', 'Teclado mecánico'))
      await user.type(panelForm('Ajustar stock').getByLabelText('Cantidad a ajustar'), '-3')

      expect(panelForm('Ajustar stock').getByLabelText('Cantidad a ajustar')).toBeInvalid()
      expect(service.requests('POST')).toHaveLength(0)
    })

    it('shows a 422 on the quantity field and reloads the list: the stock changed meanwhile', async () => {
      const { user, service } = start()
      await ready()
      service.products[0].stock = 0
      const listsBefore = service.requests('GET', PRODUCTS_PATH).length

      await user.click(action('Ajustar stock', 'Teclado mecánico'))
      await user.type(panelForm('Ajustar stock').getByLabelText('Cantidad a ajustar'), '-2')
      await user.type(panelForm('Ajustar stock').getByLabelText('Motivo'), 'Venta')
      await user.click(screen.getByRole('button', { name: 'Ajustar stock' }))

      await waitFor(() =>
        expect(screen.getByLabelText('Cantidad a ajustar')).toHaveAccessibleDescription(
          expect.stringContaining('El stock cambió'),
        ),
      )
      await waitFor(() => expect(service.requests('GET', PRODUCTS_PATH).length).toBeGreaterThan(listsBefore))
    })

    it('sends the same Idempotency-Key when retrying after a dropped response, and a new one after changing the data', async () => {
      const { user, service } = start()
      await ready()
      service.rejectNext('POST', /stock-adjustments$/, 0, 'NETWORK_ERROR', 'Network error')

      await user.click(action('Ajustar stock', 'Mouse inalámbrico'))
      await user.type(panelForm('Ajustar stock').getByLabelText('Cantidad a ajustar'), '5')
      await user.type(panelForm('Ajustar stock').getByLabelText('Motivo'), 'Reposición')
      await user.click(screen.getByRole('button', { name: 'Ajustar stock' }))
      await screen.findByRole('alert')
      await user.click(screen.getByRole('button', { name: 'Ajustar stock' }))

      await waitFor(() => expect(screen.queryByRole('form', { name: 'Ajustar stock' })).not.toBeInTheDocument())
      const keys = service.requests('POST', /stock-adjustments$/).map(([, options]) => options?.idempotencyKey)
      expect(keys).toHaveLength(2)
      expect(keys[0]).toBe(keys[1])

      await user.click(action('Ajustar stock', 'Mouse inalámbrico'))
      await user.type(panelForm('Ajustar stock').getByLabelText('Cantidad a ajustar'), '5')
      await user.type(panelForm('Ajustar stock').getByLabelText('Motivo'), 'Reposición')
      await user.click(screen.getByRole('button', { name: 'Ajustar stock' }))
      await waitFor(() => expect(service.requests('POST', /stock-adjustments$/)).toHaveLength(3))
      const third = service.requests('POST', /stock-adjustments$/)[2][1]?.idempotencyKey
      expect(third).not.toBe(keys[0])
    })
  })

  describe('deactivating a product', () => {
    it('asks first, with the product in the title, and sends nothing until confirmed', async () => {
      const { user, service } = start()
      await ready()

      await user.click(action('Desactivar', 'Mouse inalámbrico'))

      expect(screen.getByRole('dialog', { name: '¿Desactivar "Mouse inalámbrico"?' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()
      expect(service.requests('DELETE')).toHaveLength(0)
    })

    it('closes with Cancelar and puts the focus back on the button that opened it', async () => {
      const { user } = start()
      await ready()

      await user.click(action('Desactivar', 'Mouse inalámbrico'))
      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(action('Desactivar', 'Mouse inalámbrico')).toHaveFocus()
    })

    it('deactivates: the row turns inactive with no actions, the tiles refresh, and it is announced', async () => {
      const { user, service } = start()
      await ready()
      await waitFor(() => expect(within(tile('Productos activos')).getByText('3')).toBeInTheDocument())

      await user.click(action('Desactivar', 'Mouse inalámbrico'))
      await user.click(screen.getByRole('button', { name: 'Desactivar' }))

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      const inactive = await screen.findByRole('row', { name: /Mouse inalámbrico/ })
      await waitFor(() => expect(within(inactive).getByText('Inactivo')).toBeInTheDocument())
      expect(within(inactive).queryAllByRole('button')).toEqual([])
      expect(announcement()).toHaveTextContent('Producto desactivado')
      expect(service.requests('DELETE', `${PRODUCTS_PATH}/p-2`)).toHaveLength(1)
      await waitFor(() => expect(within(tile('Productos activos')).getByText('2')).toBeInTheDocument())
    })

    it('puts the focus on the table after deactivating: the row no longer has actions', async () => {
      const { user } = start()
      await ready()

      await user.click(action('Desactivar', 'Mouse inalámbrico'))
      await user.click(screen.getByRole('button', { name: 'Desactivar' }))

      await waitFor(() => expect(screen.getByRole('region', { name: 'Tabla de productos' })).toHaveFocus())
    })

    it('stays open with the message when it fails, and the retry sends again', async () => {
      const { user, service } = start()
      await ready()
      service.rejectNext('DELETE', /\/p-2$/, 500, 'INTERNAL_ERROR', 'Something broke')

      await user.click(action('Desactivar', 'Mouse inalámbrico'))
      await user.click(screen.getByRole('button', { name: 'Desactivar' }))

      expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo desactivar el producto.')
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Desactivar' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(service.requests('DELETE')).toHaveLength(2)
    })

    it('says the product no longer exists and reloads the list on a 404', async () => {
      const { user, service } = start()
      await ready()
      service.rejectNext('DELETE', /\/p-2$/, 404, 'NOT_FOUND', 'Product not found')
      const listsBefore = service.requests('GET', PRODUCTS_PATH).length

      await user.click(action('Desactivar', 'Mouse inalámbrico'))
      await user.click(screen.getByRole('button', { name: 'Desactivar' }))

      expect(await screen.findByRole('alert')).toHaveTextContent('El producto ya no existe')
      await waitFor(() => expect(service.requests('GET', PRODUCTS_PATH).length).toBeGreaterThan(listsBefore))
    })
  })

  describe('one panel at a time', () => {
    it('makes every other control unavailable while a product panel is open', async () => {
      const { user } = start()
      await ready()

      await user.click(action('Editar', 'Teclado mecánico'))

      expect(screen.queryByRole('button', { name: 'Nuevo producto' })).not.toBeInTheDocument()
      expect(action('Editar', 'Mouse inalámbrico')).toBeDisabled()
      expect(action('Ajustar stock', 'Mouse inalámbrico')).toBeDisabled()
      expect(action('Desactivar', 'Mouse inalámbrico')).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Nueva categoría' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Renombrar categoría Periféricos' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Desactivar categoría Periféricos' })).toBeDisabled()
    })

    it('makes the product controls unavailable while a category panel is open', async () => {
      const { user } = start()
      await ready()

      await user.click(screen.getByRole('button', { name: 'Nueva categoría' }))

      expect(screen.queryByRole('button', { name: 'Nuevo producto' })).not.toBeInTheDocument()
      expect(action('Editar', 'Mouse inalámbrico')).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Nueva categoría' })).toBeDisabled()
    })

    it('restores every control when the panel closes', async () => {
      const { user } = start()
      await ready()
      await user.click(action('Ajustar stock', 'Teclado mecánico'))

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(screen.getByRole('button', { name: 'Nuevo producto' })).toBeInTheDocument()
      expect(action('Editar', 'Mouse inalámbrico')).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Nueva categoría' })).toBeEnabled()
    })

    it('does not offer the empty-state action while a category panel is open', async () => {
      const { user } = start({ products: [] })
      await screen.findByText('Aún no hay productos registrados')
      await screen.findByRole('list', { name: 'Categorías activas' })
      expect(screen.getAllByRole('button', { name: 'Nuevo producto' })).toHaveLength(2)

      await user.click(screen.getByRole('button', { name: 'Nueva categoría' }))

      expect(screen.queryByRole('button', { name: 'Nuevo producto' })).not.toBeInTheDocument()
    })
  })

  describe('the categories section', () => {
    it('lists the active categories as chips below the catalogue', async () => {
      start()
      await ready()

      const chips = within(screen.getByRole('list', { name: 'Categorías activas' })).getAllByRole('listitem')
      expect(chips).toHaveLength(2)
      expect(screen.getByRole('heading', { level: 2, name: 'Categorías' })).toBeInTheDocument()
    })

    it('creates a category: it appears in the chips, the filter and the product forms, and is announced', async () => {
      const { user, service } = start()
      await ready()

      await user.click(screen.getByRole('button', { name: 'Nueva categoría' }))
      await user.type(panelForm('Nueva categoría').getByLabelText('Nombre'), 'Audio')
      await user.click(screen.getByRole('button', { name: 'Crear categoría' }))

      expect(await screen.findByRole('button', { name: 'Renombrar categoría Audio' })).toBeInTheDocument()
      expect(screen.queryByRole('form', { name: 'Nueva categoría' })).not.toBeInTheDocument()
      expect(announcement()).toHaveTextContent('Categoría creada')
      expect(within(screen.getByRole('combobox', { name: 'Categoría' })).getByRole('option', { name: 'Audio' })).toBeInTheDocument()
      expect(service.requests('POST', CATEGORIES_PATH)).toHaveLength(1)

      await user.click(screen.getByRole('button', { name: 'Nuevo producto' }))
      expect(within(panelForm('Nuevo producto').getByLabelText('Categoría')).getByRole('option', { name: 'Audio' })).toBeInTheDocument()
    })

    it('shows a duplicate name on the field and creates nothing', async () => {
      const { user } = start()
      await ready()

      await user.click(screen.getByRole('button', { name: 'Nueva categoría' }))
      await user.type(panelForm('Nueva categoría').getByLabelText('Nombre'), 'Periféricos')
      await user.click(screen.getByRole('button', { name: 'Crear categoría' }))

      await waitFor(() =>
        expect(panelForm('Nueva categoría').getByLabelText('Nombre')).toHaveAccessibleDescription(
          expect.stringContaining('Ya existe una categoría activa con ese nombre.'),
        ),
      )
      expect(screen.getByRole('form', { name: 'Nueva categoría' })).toBeInTheDocument()
    })

    it('renames a category: the chip and the table follow', async () => {
      const { user } = start()
      await ready()

      await user.click(screen.getByRole('button', { name: 'Renombrar categoría Periféricos' }))
      const input = panelForm('Renombrar categoría').getByLabelText('Nombre')
      expect(input).toHaveValue('Periféricos')
      await user.clear(input)
      await user.type(input, 'Accesorios')
      await user.click(screen.getByRole('button', { name: 'Guardar nombre' }))

      expect(await screen.findByRole('button', { name: 'Renombrar categoría Accesorios' })).toBeInTheDocument()
      expect(announcement()).toHaveTextContent('Categoría renombrada')
      await waitFor(() => expect(within(row(/Teclado mecánico/)).getByText('Accesorios')).toBeInTheDocument())
    })

    it('explains why a category with active products cannot be deactivated, and changes nothing', async () => {
      const { user } = start()
      await ready()

      await user.click(screen.getByRole('button', { name: 'Desactivar categoría Periféricos' }))
      await user.click(screen.getByRole('button', { name: 'Desactivar' }))

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'No se puede desactivar: todavía tiene productos activos. Muévelos a otra categoría o desactívalos primero.',
      )
      expect(screen.getByRole('button', { name: 'Renombrar categoría Periféricos' })).toBeInTheDocument()
    })

    it('deactivates a category without active products: the chips, the filter and the list follow', async () => {
      const { user, service } = start({
        products: [keyboard, { ...screen24, active: false }],
      })
      await ready()
      const listsBefore = service.requests('GET', PRODUCTS_PATH).length

      await user.click(screen.getByRole('button', { name: 'Desactivar categoría Monitores' }))
      expect(screen.getByRole('dialog', { name: '¿Desactivar la categoría "Monitores"?' })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Desactivar' }))

      await waitFor(() => expect(screen.queryByRole('button', { name: 'Renombrar categoría Monitores' })).not.toBeInTheDocument())
      expect(announcement()).toHaveTextContent('Categoría desactivada')
      await waitFor(() => expect(service.requests('GET', PRODUCTS_PATH).length).toBeGreaterThan(listsBefore))
    })

    it('puts the focus on the section when the chip that opened the panel is gone', async () => {
      const { user } = start({ products: [keyboard, { ...screen24, active: false }] })
      await ready()

      await user.click(screen.getByRole('button', { name: 'Desactivar categoría Monitores' }))
      await user.click(screen.getByRole('button', { name: 'Desactivar' }))

      await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: 'Categorías' })).toHaveFocus())
    })

    it('puts the focus back on "Nueva categoría" when the form is cancelled', async () => {
      const { user } = start()
      await ready()

      await user.click(screen.getByRole('button', { name: 'Nueva categoría' }))
      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(screen.getByRole('button', { name: 'Nueva categoría' })).toHaveFocus()
    })
  })

  describe('independent blocks', () => {
    it('keeps the categories section working when the catalogue table fails', async () => {
      const service = new CatalogueService({ products: [keyboard], categories: [peripherals] })
      service.rejectNext('GET', PRODUCTS_PATH, 500, 'INTERNAL_ERROR', 'down')
      const user = userEvent.setup()
      render(<ProductsPage />)

      expect(await screen.findByText('No se pudieron cargar los productos.')).toBeInTheDocument()
      expect(await screen.findByRole('button', { name: 'Renombrar categoría Periféricos' })).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Nueva categoría' }))
      expect(screen.getByRole('form', { name: 'Nueva categoría' })).toBeInTheDocument()
    })

    it('keeps the table working when the categories fail, and the section retries on its own', async () => {
      const service = new CatalogueService({ products: [keyboard], categories: [peripherals] })
      service.rejectNext('GET', CATEGORIES_PATH, 500, 'INTERNAL_ERROR', 'down')
      const user = userEvent.setup()
      render(<ProductsPage />)

      expect(await screen.findByRole('row', { name: /Teclado mecánico/ })).toBeInTheDocument()
      const alert = await screen.findByText('No se pudieron cargar las categorías')
      expect(alert).toBeInTheDocument()
      expect(action('Editar', 'Teclado mecánico')).toBeInTheDocument()

      await user.click(within(alert.closest('[role="alert"]') as HTMLElement).getByRole('button', { name: 'Reintentar' }))

      expect(await screen.findByRole('button', { name: 'Renombrar categoría Periféricos' })).toBeInTheDocument()
    })
  })
})
