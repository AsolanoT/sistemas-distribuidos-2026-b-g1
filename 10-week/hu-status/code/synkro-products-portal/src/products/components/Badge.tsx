import type { ReactNode } from 'react'
import styles from './Badge.module.css'

interface BadgeProps {
  tone: 'success' | 'warning' | 'error' | 'neutral'
  // A dot in the tone's colour next to the label. A plain label leaves it out.
  marker?: boolean
  children: ReactNode
}

// The label always says the state in words. The design system pairs -700 text with
// a -50 background, which measures below 4.5:1 in the light theme, so the text
// keeps the ink colour and the tone is carried by the background and the dot.
export function Badge({ tone, marker = true, children }: BadgeProps) {
  return (
    <span className={styles.badge} data-tone={tone}>
      {marker && <span className={styles.mark} data-mark aria-hidden="true" />}
      {children}
    </span>
  )
}
