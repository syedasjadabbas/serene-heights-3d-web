import logoSvg from '../../assets/branding/serene-heights-logo.svg'
import styles from './Logo.module.css'

interface LogoProps {
  className?: string
  markOnly?: boolean
}

/**
 * Official Serene Heights Brand Logo Component.
 * Consumes src/assets/branding/serene-heights-logo.svg as the single source of truth.
 */
export default function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={[styles.logo, className].filter(Boolean).join(' ')}>
      <img
        src={logoSvg}
        className={styles.mark}
        alt="Serene Heights Logo Mark"
        aria-hidden="true"
      />
      {!markOnly && <span className={styles.wordmark}>Serene Heights</span>}
    </span>
  )
}
