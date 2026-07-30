import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import styles from './Navigation.module.css'

const LEFT_LINKS = ['Stay', 'Experience', 'Dining']
const RIGHT_LINKS = ['Gallery', 'About', 'Contact']

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      registerScrollTrigger()

      gsap.fromTo(
        barRef.current,
        { yPercent: -140, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.1, delay: 0.15, ease: 'power3.out' },
      )

      ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: { targets: barRef.current, className: styles.scrolled },
      })
    }, navRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    if (isOpen) {
      gsap.to(panel, { opacity: 1, visibility: 'visible', duration: 0.45, ease: 'power2.out' })
      gsap.fromTo(
        panel.querySelectorAll(`.${styles.mobileLink}`),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, delay: 0.1, ease: 'power2.out' },
      )
    } else {
      gsap.to(panel, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => gsap.set(panel, { visibility: 'hidden' }),
      })
    }
  }, [isOpen])

  const allLinks = [...LEFT_LINKS, ...RIGHT_LINKS]

  return (
    <header ref={navRef} className={styles.nav}>
      <div ref={barRef} className={styles.bar}>
        <nav className={styles.linksLeft} aria-label="Primary">
          {LEFT_LINKS.map((label) => (
            <a key={label} href={`#${label.toLowerCase()}`} className={styles.link}>
              {label}
            </a>
          ))}
        </nav>

        <a href="#top" className={styles.brand} aria-label="Serene Heights, home">
          <Logo />
        </a>

        <nav className={styles.linksRight} aria-label="Secondary">
          {RIGHT_LINKS.map((label) => (
            <a key={label} href={`#${label.toLowerCase()}`} className={styles.link}>
              {label}
            </a>
          ))}
        </nav>

        <Button href="#book" variant="primary" className={styles.cta}>
          Book Now
        </Button>

        <button
          type="button"
          className={styles.menuToggle}
          data-open={isOpen}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span />
          <span />
        </button>
      </div>

      <div id="mobile-menu" ref={panelRef} className={styles.mobilePanel}>
        {allLinks.map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            className={styles.mobileLink}
            onClick={() => setIsOpen(false)}
          >
            {label}
          </a>
        ))}
        <Button href="#book" variant="primary" onClick={() => setIsOpen(false)}>
          Book Now
        </Button>
      </div>
    </header>
  )
}
