import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CategoryResponse } from '../model/category'
import { ProductFilterBar } from './ProductFilterBar'

const periph: CategoryResponse = { categoryId: 'c-1', name: 'Periféricos', active: true }
const retired: CategoryResponse = { categoryId: 'c-2', name: 'Retirados', active: false }

function renderBar(props: Partial<React.ComponentProps<typeof ProductFilterBar>> = {}) {
  const onChange = vi.fn()
  render(
    <ProductFilterBar
      filters={{ page: 1 }}
      categories={{ status: 'ready', value: [periph, retired] }}
      onChange={onChange}
      onRetryCategories={vi.fn()}
      {...props}
    />,
  )
  return { onChange }
}

const options = () => within(screen.getByLabelText('Categoría')).getAllByRole('option').map((option) => option.textContent)

describe('ProductFilterBar: the inactive category label', () => {
  it('marks an inactive category as inactive in text, in the list filter', () => {
    renderBar()

    expect(options()).toEqual(['Todas las categorías', 'Periféricos', 'Retirados (inactiva)'])
  })
})

describe('ProductFilterBar: as the stock lookup search', () => {
  it('offers active categories only', () => {
    renderBar({ activeCategoriesOnly: true })

    expect(options()).toEqual(['Todas las categorías', 'Periféricos'])
  })

  it('has no status filter', () => {
    renderBar({ showStatus: false })

    expect(screen.queryByLabelText('Estado')).not.toBeInTheDocument()
  })

  it('keeps the status filter by default', () => {
    renderBar()

    expect(screen.getByLabelText('Estado')).toBeInTheDocument()
  })

  it('still searches by name with Buscar and filters by category', async () => {
    const { onChange } = renderBar({ activeCategoriesOnly: true, showStatus: false })

    await userEvent.type(screen.getByLabelText('Nombre'), '  Teclado ')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))
    await userEvent.selectOptions(screen.getByLabelText('Categoría'), 'Periféricos')

    expect(onChange).toHaveBeenNthCalledWith(1, { name: 'Teclado' })
    expect(onChange).toHaveBeenNthCalledWith(2, { categoryId: 'c-1' })
  })
})
