import { render, screen } from '@testing-library/react'
import { Field } from './Field'

describe('Field', () => {
  it('marks its control as required by default', () => {
    render(<Field id="x" label="Nombre">{(control) => <input {...control} />}</Field>)

    expect(screen.getByLabelText('Nombre')).toBeRequired()
  })

  it('leaves the control optional when the field says it is not required', () => {
    render(
      <Field id="x" label="Nombre" required={false}>
        {(control) => <input {...control} />}
      </Field>,
    )

    expect(screen.getByLabelText('Nombre')).not.toBeRequired()
  })
})
