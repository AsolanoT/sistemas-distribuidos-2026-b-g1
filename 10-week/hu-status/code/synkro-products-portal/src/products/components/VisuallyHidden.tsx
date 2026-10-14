import type { ReactNode } from 'react'
import styles from './VisuallyHidden.module.css'

// Text for screen readers only: it is in the page and read, but not drawn.
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <p role="status" className={styles.hidden}>
      {children}
    </p>
  )
}
