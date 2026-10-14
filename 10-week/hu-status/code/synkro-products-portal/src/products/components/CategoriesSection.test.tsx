import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiClient, hostError } from '../../test-doubles/shellApiClient'
import { accessories, deferred, peripherals } from '../../test-doubles/productsFixtures'
import type { CategoryResponse } from '../model/category'
import type { Loadable } from '../model/loadable'
import { NO_PANEL, type Panel } from '../model/panel'
import { CategoriesSection } from './CategoriesSection'

const monitors: CategoryResponse = { categoryId: 'c-3', name: 'Monitors', active: true }
const ready = (...categories: CategoryResponse[]): Loadable<CategoryResponse[]> => ({ status: 'ready', value: categories })

interface Overrides {
  categories?: Loadable<CategoryResponse[]>
  panel?: Panel
  busy?: boolean
}

function renderSection({ categories = ready(peripherals, accessories, monitors), panel = NO_PANEL, busy = false }: Overrides = {}) {
  const handlers = {
    onRetry: vi.fn(),
    onCreate: vi.fn(),
    onRename: vi.fn(),
    onDeactivate: vi.fn(),
    onCreated: vi.fn(),
    onRenamed: vi.fn(),
    onDeactivated: vi.fn(),
    onOutdated: vi.fn(),
    onClose: vi.fn(),
  }
  const user = userEvent.setup()
  render(<CategoriesSection categories={categories} panel={panel} busy={busy} {...handlers} />)
  return { ...handlers, user }
}

describe('CategoriesSection', () => {
  beforeEach(() => {
    apiClient.request.mockReset()
  })

  describe('with categories', () => {
    it('is headed "Categorías" and offers "Nueva categoría" as a secondary button', async () => {
      const { user, onCreate } = renderSection()

      expect(screen.getByRole('heading', { level: 2, name: 'Categorías' })).toBeInTheDocument()
      const create = screen.getByRole('button', { name: 'Nueva categoría' })
      expect(create.className).toMatch(/secondary/)

      await user.click(create)
      expect(onCreate).toHaveBeenCalledOnce()
    })

    it('shows the active categories as chips, and not the inactive ones', () => {
      renderSection()

      const chips = within(screen.getByRole('list', { name: 'Categorías activas' })).getAllByRole('listitem')
      expect(chips.map((chip) => within(chip).getByText(/Peripherals|Monitors|Accessories/).textContent)).toEqual([
        'Peripherals',
        'Monitors',
      ])
    })

    it('gives each chip Renombrar and Desactivar controls named after the category', () => {
      renderSection()

      expect(screen.getByRole('button', { name: 'Renombrar categoría Peripherals' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Desactivar categoría Peripherals' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Renombrar categoría Monitors' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Desactivar categoría Monitors' })).toBeInTheDocument()
    })

    it('draws the controls as compact buttons whose text says what they do, not only their colour', () => {
      renderSection()

      const rename = screen.getByRole('button', { name: 'Renombrar categoría Peripherals' })
      const deactivate = screen.getByRole('button', { name: 'Desactivar categoría Peripherals' })
      expect(rename).toHaveTextContent('Renombrar')
      expect(deactivate).toHaveTextContent('Desactivar')
      expect(rename.className).toMatch(/small/)
      expect(deactivate.className).toMatch(/small/)
    })

    it('tells the page which category a control is about', async () => {
      const { user, onRename, onDeactivate } = renderSection()

      await user.click(screen.getByRole('button', { name: 'Renombrar categoría Monitors' }))
      await user.click(screen.getByRole('button', { name: 'Desactivar categoría Peripherals' }))

      expect(onRename).toHaveBeenCalledExactlyOnceWith(monitors)
      expect(onDeactivate).toHaveBeenCalledExactlyOnceWith(peripherals)
    })

    it('marks every control so focus can return to it', () => {
      renderSection()

      expect(screen.getByRole('button', { name: 'Nueva categoría' })).toHaveAttribute('data-opener', 'category-create')
      expect(screen.getByRole('button', { name: 'Renombrar categoría Peripherals' })).toHaveAttribute(
        'data-opener',
        'category-rename:c-1',
      )
      expect(screen.getByRole('button', { name: 'Desactivar categoría Peripherals' })).toHaveAttribute(
        'data-opener',
        'category-deactivate:c-1',
      )
    })

    it('disables every control while something else is open', () => {
      renderSection({ busy: true })

      for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
    })
  })

  describe('its own states', () => {
    it('shows skeleton chips and says it is loading', () => {
      renderSection({ categories: { status: 'loading' } })

      expect(screen.getByText('Cargando categorías…')).toBeInTheDocument()
      expect(screen.queryByRole('list', { name: 'Categorías activas' })).not.toBeInTheDocument()
    })

    it('says it could not load and offers Reintentar', async () => {
      const { user, onRetry } = renderSection({ categories: { status: 'error' } })

      expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las categorías')
      await user.click(screen.getByRole('button', { name: 'Reintentar' }))

      expect(onRetry).toHaveBeenCalledOnce()
    })

    it('can still create a category when it could not load them', () => {
      renderSection({ categories: { status: 'error' } })

      expect(screen.getByRole('button', { name: 'Nueva categoría' })).toBeEnabled()
    })

    it('is empty when no category is active, and points at "Nueva categoría"', async () => {
      const { user, onCreate } = renderSection({ categories: ready(accessories) })

      expect(screen.getByText('Aún no hay categorías')).toBeInTheDocument()
      const create = screen.getAllByRole('button', { name: 'Nueva categoría' })
      expect(create).toHaveLength(1)

      await user.click(create[0])
      expect(onCreate).toHaveBeenCalledOnce()
    })

    it('is empty when there are no categories at all', () => {
      renderSection({ categories: ready() })

      expect(screen.getByText('Aún no hay categorías')).toBeInTheDocument()
    })
  })

  describe('creating', () => {
    it('opens the form inside the section', () => {
      renderSection({ panel: { kind: 'createCategory' }, busy: true })

      expect(screen.getByRole('form', { name: 'Nueva categoría' })).toBeInTheDocument()
    })

    it('tells the page when the category was created', async () => {
      apiClient.request.mockResolvedValue({ categoryId: 'c-9', name: 'Cables', active: true })
      const { user, onCreated } = renderSection({ panel: { kind: 'createCategory' }, busy: true })

      await user.type(screen.getByLabelText('Nombre'), 'Cables')
      await user.click(screen.getByRole('button', { name: 'Crear categoría' }))

      expect(onCreated).toHaveBeenCalledOnce()
    })

    it('closes the form with Cancelar', async () => {
      const { user, onClose } = renderSection({ panel: { kind: 'createCategory' }, busy: true })

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  describe('renaming', () => {
    it('opens the form prefilled with the category name', () => {
      renderSection({ panel: { kind: 'renameCategory', category: monitors }, busy: true })

      expect(screen.getByRole('form', { name: 'Renombrar categoría' })).toBeInTheDocument()
      expect(screen.getByLabelText('Nombre')).toHaveValue('Monitors')
    })

    it('tells the page when it was renamed, and when the category is gone', async () => {
      apiClient.request.mockRejectedValueOnce(hostError(404, { error: 'NOT_FOUND', message: 'Category not found' }))
      const { user, onOutdated, onRenamed } = renderSection({
        panel: { kind: 'renameCategory', category: monitors },
        busy: true,
      })

      await user.click(screen.getByRole('button', { name: 'Guardar nombre' }))

      expect(await screen.findByRole('alert')).toHaveTextContent('La categoría ya no existe')
      expect(onOutdated).toHaveBeenCalledOnce()
      expect(onRenamed).not.toHaveBeenCalled()
    })
  })

  describe('deactivating', () => {
    const panel: Panel = { kind: 'deactivateCategory', category: peripherals }
    const confirm = () => screen.getByRole('button', { name: 'Desactivar' })

    it('asks for confirmation with the category in the title', () => {
      renderSection({ panel, busy: true })

      expect(screen.getByRole('dialog', { name: '¿Desactivar la categoría "Peripherals"?' })).toHaveAccessibleDescription(
        'Dejará de ofrecerse al registrar o editar productos.',
      )
    })

    it('deletes the category and tells the page', async () => {
      apiClient.request.mockResolvedValue({ ...peripherals, active: false })
      const { user, onDeactivated } = renderSection({ panel, busy: true })

      await user.click(confirm())

      expect(apiClient.request).toHaveBeenCalledExactlyOnceWith('/api/v1/products/categories/c-1', { method: 'DELETE' })
      await waitFor(() => expect(onDeactivated).toHaveBeenCalledOnce())
    })

    it('explains a 422 (it still has active products), changes nothing and stays open', async () => {
      apiClient.request.mockRejectedValueOnce(
        hostError(422, { error: 'BUSINESS_RULE_VIOLATION', message: 'The category has active products assigned to it' }),
      )
      const { user, onDeactivated, onOutdated } = renderSection({ panel, busy: true })

      await user.click(confirm())

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'No se puede desactivar: todavía tiene productos activos. Muévelos a otra categoría o desactívalos primero.',
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(onDeactivated).not.toHaveBeenCalled()
      expect(onOutdated).not.toHaveBeenCalled()
    })

    it('tells the page when the category no longer exists', async () => {
      apiClient.request.mockRejectedValueOnce(hostError(404, { error: 'NOT_FOUND', message: 'Category not found' }))
      const { user, onOutdated } = renderSection({ panel, busy: true })

      await user.click(confirm())

      expect(await screen.findByRole('alert')).toHaveTextContent('La categoría ya no existe')
      expect(onOutdated).toHaveBeenCalledOnce()
    })

    it('sends one request for a double click', async () => {
      apiClient.request.mockReturnValue(deferred<CategoryResponse>().promise)
      const { user } = renderSection({ panel, busy: true })

      await user.dblClick(confirm())

      expect(apiClient.request).toHaveBeenCalledOnce()
    })

    it('closes with Cancelar and sends nothing', async () => {
      const { user, onClose } = renderSection({ panel, busy: true })

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(onClose).toHaveBeenCalledOnce()
      expect(apiClient.request).not.toHaveBeenCalled()
    })
  })
})
