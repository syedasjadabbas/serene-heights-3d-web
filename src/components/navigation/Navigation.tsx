import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import {
  getNavVisibilityProgress,
  subscribeNavVisibilityProgress,
} from '../stage/masterVisualStageState'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import styles from './Navigation.module.css'

const NAV_ITEMS = [
  { label: 'ABOUT', href: '#about' },
  { label: 'LIFESTYLE', href: '#lifestyle' },
  { label: 'AMENITIES', href: '#amenities' },
  { label: 'FLOOR PLANS', href: '#floor-plans' },
  { label: 'SMART UNIT', href: '#smart-unit', extra: true },
  { label: 'PAYMENT PLAN', href: '#payment-plan' },
  { label: 'PROGRESS', href: '#progress' },
]

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      registerScrollTrigger()

      const renderNavState = (rawProgress: number) => {
        if (!barRef.current) return

        // Throughout Hero & Hero appreciation hold: rawProgress === 0 (Navbar strictly hidden)
        if (rawProgress <= 0) {
          gsap.set(barRef.current, {
            y: -10,
            opacity: 0,
            pointerEvents: 'none',
          })
          return
        }

        // As soon as Hero releases: rawProgress increases from 0 -> 1 as Section 2 enters
        const easeProgress = 1 - Math.pow(1 - rawProgress, 3)
        const translateY = -10 * (1 - easeProgress)

        gsap.set(barRef.current, {
          y: translateY,
          opacity: easeProgress,
          pointerEvents: easeProgress > 0.8 ? 'auto' : 'none',
        })
      }

      // Subscribe to the shared navbar release event state
      const unsub = subscribeNavVisibilityProgress((progress) => renderNavState(progress))

      // Initial check on mount
      renderNavState(getNavVisibilityProgress())

      ScrollTrigger.create({
        start: 'top -60',
        end: 99999,
        toggleClass: { targets: barRef.current, className: styles.scrolled },
      })

      return () => unsub()
    }, navRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      gsap.to(panel, { opacity: 1, visibility: 'visible', duration: 0.35, ease: 'power2.out' })
      gsap.fromTo(
        panel.querySelectorAll(`.${styles.mobileLink}`),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.04, delay: 0.06, ease: 'power2.out' },
      )
    } else {
      document.body.style.overflow = ''
      gsap.to(panel, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => gsap.set(panel, { visibility: 'hidden' }),
      })
    }
  }, [isOpen])

  return (
    <header ref={navRef} className={styles.nav}>
      <div ref={barRef} className={styles.bar}>
        <a href="#top" className={styles.brand} aria-label="Serene Heights, home">
          <Logo />
        </a>

        <nav className={styles.linksCenter} aria-label="Primary Navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`${styles.link} ${item.extra ? styles.desktopExtra : ''}`}
            >
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <Button href="#enquire" variant="primary" className={styles.cta}>
            ENQUIRE NOW
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
      </div>

      <div id="mobile-menu" ref={panelRef} className={styles.mobilePanel} aria-hidden={!isOpen}>
        <div className={styles.mobileLinksContainer}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={styles.mobileLink}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className={styles.mobileCtaWrap}>
          <Button href="#enquire" variant="primary" onClick={() => setIsOpen(false)}>
            ENQUIRE NOW
          </Button>
        </div>
      </div>
    </header>
  )
}
