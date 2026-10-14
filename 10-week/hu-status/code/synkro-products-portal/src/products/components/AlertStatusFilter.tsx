import { alertsCopy } from '../model/alertsCopy'
import type { AlertStatusFilter as Filter } from '../model/stockAlert'
import { Field } from './Field'

interface AlertStatusFilterProps {
  value: Filter
  onChange: (filter: Filter) => void
}

// Abiertas, Resueltas or Todas. It is not a required field: it always has a value.
export function AlertStatusFilter({ value, onChange }: AlertStatusFilterProps) {
  return (
    <Field id="alert-status" label={alertsCopy.filter.label} required={false}>
      {(control) => (
        <select {...control} value={value} onChange={(event) => onChange(event.target.value as Filter)}>
          <option value="open">{alertsCopy.filter.open}</option>
          <option value="resolved">{alertsCopy.filter.resolved}</option>
          <option value="all">{alertsCopy.filter.all}</option>
        </select>
      )}
    </Field>
  )
}
