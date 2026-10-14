import styles from './Skeleton.module.css'

interface SkeletonProps {
  // text: a line of a cell. badge: the width of a badge. figure: a stat tile number.
  // chip: a category chip.
  shape?: 'text' | 'badge' | 'figure' | 'chip'
}

// A placeholder block for content that is loading. It is decorative: whoever
// renders it says what is loading in text for screen readers.
export function Skeleton({ shape = 'text' }: SkeletonProps) {
  return <span className={`${styles.skeleton} ${styles[shape]}`} aria-hidden="true" />
}
