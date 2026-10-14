import type { FormAlert, FormFailure } from './formFailure'
import type { ProductField } from './productForm'

export type { FormAlert }

// How a failed registration or update is shown: next to the fields it names,
// and/or as one alert for the form.
export type CreateProductFailure = FormFailure<ProductField>
