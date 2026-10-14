import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { accessories, peripherals } from '../../test-doubles/productsFixtures'
import { ProductFilterBar } from './ProductFilterBar'

type Props = ComponentProps<typeof ProductFilterBar>

function renderBar(overrides: Partial<Props> = {}) {
  const props: Props = {
    filters: { page: 1 },
    categories: { status: 'ready', value: [peripherals, accessories] },
    onChange: vi.fn(),
    onRetryCategories: vi.fn(),
    ...overrides,
  }
  render(<ProductFilterBar {...props} />)
  return props
}

describe('ProductFilterBar', () => {
  it('labels each filter and describes the name field', () => {
    renderBar()

    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Categoría')).toBeInTheDocument()
    expect(screen.getByLabelText('Estado')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveAccessibleDescription('Coincidencia parcial, sin distinguir mayúsculas')
  })

  it('is a search landmark, and none of its filters is a required field', () => {
    renderBar()

    expect(screen.getByRole('search')).toBeInTheDocument()
    for (const label of ['Nombre', 'Categoría', 'Estado']) expect(screen.getByLabelText(label)).not.toBeRequired()
  })

  it('sends the typed name when Buscar is used', async () => {
    const user = userEvent.setup()
    const { onChange } = renderBar()

    await user.type(screen.getByLabelText('Nombre'), 'mouse')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(onChange).toHaveBeenLastCalledWith({ name: 'mouse' })
  })

  it('sends the typed name when Enter is pressed', async () => {
    const user = userEvent.setup()
    const { onChange } = renderBar()

    await user.type(screen.getByLabelText('Nombre'), 'mouse{Enter}')

    expect(onChange).toHaveBeenLastCalledWith({ name: 'mouse' })
  })

  it('sends the chosen category', async () => {
    const user = userEvent.setup()
    const { onChange } = renderBar()

    await user.selectOptions(screen.getByLabelText('Categoría'), 'c-1')

    expect(onChange).toHaveBeenLastCalledWith({ categoryId: 'c-1' })
  })

  it('offers every category, with Todas las categorías first and the inactive ones marked', () => {
    renderBar()

    const options = screen.getByLabelText('Categoría').querySelectorAll('option')
    expect([...options].map((option) => option.textContent)).toEqual([
      'Todas las categorías',
      'Peripherals',
      'Accessories (inactiva)',
    ])
  })

  it('offers Todos, Activos and Inactivos for the status', () => {
    renderBar()

    const options = screen.getByLabelText('Estado').querySelectorAll('option')
    expect([...options].map((option) => option.textContent)).toEqual(['Todos', 'Activos', 'Inactivos'])
  })

  it('sends Activos and Inactivos, and clears the status filter for Todos', async () => {
    const user = userEvent.setup()
    const { onChange } = renderBar()

    await user.selectOptions(screen.getByLabelText('Estado'), 'active')
    expect(onChange).toHaveBeenLastCalledWith({ active: true })

    await user.selectOptions(screen.getByLabelText('Estado'), 'inactive')
    expect(onChange).toHaveBeenLastCalledWith({ active: false })

    await user.selectOptions(screen.getByLabelText('Estado'), 'all')
    expect(onChange).toHaveBeenLastCalledWith({ active: undefined })
  })

  it('shows the category list as loading and disables the category choice', () => {
    renderBar({ categories: { status: 'loading' } })

    expect(screen.getByLabelText('Categoría')).toBeDisabled()
    expect(screen.getByRole('option', { name: 'Cargando categorías…' })).toBeInTheDocument()
  })

  it('shows the categories as unavailable with a retry that repeats their request', async () => {
    const user = userEvent.setup()
    const { onRetryCategories } = renderBar({ categories: { status: 'error' } })

    expect(screen.getByText('No se pudieron cargar las categorías.')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Categorías no disponibles' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reintentar categorías' }))

    expect(onRetryCategories).toHaveBeenCalledOnce()
  })

  it('shows the status the filters hold, Activos or Inactivos', () => {
    renderBar({ filters: { page: 1, active: false } })

    expect(screen.getByLabelText('Estado')).toHaveValue('inactive')
  })

  it('keeps the name the person typed in the field', () => {
    renderBar({ filters: { page: 1, name: 'mouse' } })

    expect(screen.getByLabelText('Nombre')).toHaveValue('mouse')
  })
})
