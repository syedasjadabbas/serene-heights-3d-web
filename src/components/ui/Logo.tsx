import styles from './Logo.module.css'

interface LogoProps {
  className?: string
  markOnly?: boolean
}

/**
 * Coded recreation of the Serene Heights emblem (arch + mountain glyph) and
 * wordmark, standing in until the production SVG/PNG assets are supplied to
 * src/assets/brand. Swapping in the real files only requires editing this
 * component.
 */
export default function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={[styles.logo, className].filter(Boolean).join(' ')}>
      <svg
        className={styles.mark}
        width="26"
        height="30"
        viewBox="0 0 48 56"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M2 40C2 14 10 2 24 2C38 2 46 14 46 40V45C46 50.5228 41.5228 55 36 55H12C6.47715 55 2 50.5228 2 45V40Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M8 38L17.5 25.5L24 33L30.5 21.5L40 38"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      {!markOnly && <span className={styles.wordmark}>Serene Heights</span>}
    </span>
  )
}
