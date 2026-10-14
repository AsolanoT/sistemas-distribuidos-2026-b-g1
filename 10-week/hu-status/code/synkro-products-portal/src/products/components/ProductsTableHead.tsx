import { tableColumns, type TableColumn } from '../model/tableColumns'
import styles from './ProductsTable.module.css'

interface ProductsTableHeadProps {
  columns?: TableColumn[]
}

// The header row, shared by the table and its skeleton so both have the same columns.
export function ProductsTableHead({ columns = tableColumns }: ProductsTableHeadProps) {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th key={column.id} scope="col" className={headerClass(column)}>
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
  )
}

function headerClass({ numeric, alignEnd }: TableColumn): string | undefined {
  if (numeric) return styles.numericHeader
  return alignEnd ? styles.endHeader : undefined
}
