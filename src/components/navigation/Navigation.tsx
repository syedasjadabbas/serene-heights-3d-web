import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import { scrollToId, scrollToTarget, startScroll, stopScroll } from '../../motion/lenis'
import {
  getNavVisibilityProgress,
  subscribeNavVisibilityProgress,
} from '../stage/masterVisualStageState'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import styles from './Navigation.module.css'

interface NavItem {
  label: string
  href: string
  extra?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'ABOUT', href: '#about' },
  { label: 'LIFESTYLE', href: '#lifestyle' },
  { label: 'AMENITIES', href: '#amenities' },
  { label: 'FLOOR PLANS', href: '#floor-plans' },
  { label: 'SMART UNIT', href: '#smart-unit' },
  { label: 'PAYMENT PLAN', href: '#payment-plan' },
  { label: 'PROGRESS', href: '#progress' },
  { label: 'EXHIBITION', href: '#exhibition' },
]

export default function Navigation() {
  const navRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState<string>('about')

  useEffect(() => {
    const ctx = gsap.context(() => {
      registerScrollTrigger()

      const renderNavState = (rawProgress: number) => {
        if (!barRef.current) return

        if (rawProgress <= 0) {
          gsap.set(barRef.current, {
            y: -10,
            opacity: 0,
            pointerEvents: 'none',
          })
          return
        }

        const easeProgress = 1 - Math.pow(1 - rawProgress, 3.4)
        const translateY = -12 * (1 - easeProgress)

        gsap.set(barRef.current, {
          y: translateY,
          opacity: easeProgress,
          pointerEvents: easeProgress > 0.8 ? 'auto' : 'none',
        })
      }

      const unsub = subscribeNavVisibilityProgress((progress) => renderNavState(progress))

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

  // Active section scroll tracking via getBoundingClientRect (reliable across GSAP pin-spacers)
  useEffect(() => {
    const sectionMap: { [key: string]: string } = {
      hero: 'about',
      about: 'about',
      lifestyle: 'lifestyle',
      amenities: 'amenities',
      'floor-plans': 'floor-plans',
      'smart-unit': 'smart-unit',
      'payment-plan': 'payment-plan',
      progress: 'progress',
      exhibition: 'exhibition',
      'curated-exhibits': 'exhibition',
      investment: 'payment-plan',
      contact: 'contact',
    }

    const checkActiveSection = () => {
      const viewportMiddle = window.innerHeight * 0.4
      const sectionElements = Array.from(document.querySelectorAll('section[id], header[id]'))

      let currentActive = 'about'

      for (const el of sectionElements) {
        const rect = el.getBoundingClientRect()
        // If section top is above or near viewport middle AND section bottom is still visible
        if (rect.top <= viewportMiddle && rect.bottom >= 120) {
          const rawId = el.id
          if (sectionMap[rawId]) {
            currentActive = sectionMap[rawId]
          }
        }
      }

      setActiveSectionId(currentActive)
    }

    // Lenis moves the real window scroll, so native scroll events cover
    // every scroll; refresh covers pin-spacer layout changes. One check per
    // frame at most.
    let rafId: number | null = null
    const scheduleCheck = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        checkActiveSection()
      })
    }

    window.addEventListener('scroll', scheduleCheck, { passive: true })
    ScrollTrigger.addEventListener('refresh', scheduleCheck)
    checkActiveSection()

    return () => {
      window.removeEventListener('scroll', scheduleCheck)
      ScrollTrigger.removeEventListener('refresh', scheduleCheck)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    if (isOpen) {
      stopScroll()
      document.body.style.overflow = 'hidden'
      // Visible + interactive immediately (only opacity animates) so the
      // focus effect below can move focus into the panel this same commit.
      gsap.set(panel, { visibility: 'visible', pointerEvents: 'auto' })
      gsap.to(panel, { opacity: 1, duration: 0.35, ease: 'power2.out' })
      gsap.fromTo(
        panel.querySelectorAll(`.${styles.mobileLink}`),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.04, delay: 0.06, ease: 'power2.out' },
      )
    } else {
      startScroll()
      document.body.style.overflow = ''
      gsap.set(panel, { pointerEvents: 'none' })
      gsap.to(panel, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => gsap.set(panel, { visibility: 'hidden' }),
      })
    }
  }, [isOpen])

  // Mobile menu keyboard handling: Escape closes, Tab stays inside the
  // panel, focus moves in on open and back to the toggle on close.
  useEffect(() => {
    if (!isOpen) return
    const panel = panelRef.current
    const toggle = toggleRef.current
    if (!panel) return

    const focusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
    focusables()[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const items = [toggle, ...focusables()].filter((el): el is HTMLElement => !!el)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      toggle?.focus()
    }
  }, [isOpen])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetId = href.replace('#', '')
    if (targetId === 'top' || targetId === 'hero') {
      scrollToTarget(0)
      return
    }
    scrollToId(targetId)
  }

  return (
    <header ref={navRef} className={styles.nav}>
      <div ref={barRef} className={styles.bar}>
        <a href="#top" onClick={(e) => handleNavClick(e, '#top')} className={styles.brand} aria-label="Serene Heights, home">
          <Logo />
        </a>

        <nav className={styles.linksCenter} aria-label="Primary Navigation">
          {NAV_ITEMS.map((item) => {
            const targetId = item.href.replace('#', '')
            const isActive = activeSectionId === targetId

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`${styles.link} ${isActive ? styles.activeLink : ''} ${item.extra ? styles.desktopExtra : ''}`}
              >
                <span>{item.label}</span>
              </a>
            )
          })}
        </nav>

        <div className={styles.actions}>
          <Button href="#contact" onClick={(e) => handleNavClick(e, '#contact')} variant="primary" className={styles.cta}>
            ENQUIRE NOW
          </Button>

          <button
            ref={toggleRef}
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

      <div
        id="mobile-menu"
        ref={panelRef}
        className={styles.mobilePanel}
        aria-hidden={!isOpen}
        inert={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className={styles.mobileLinksContainer}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={styles.mobileLink}
              onClick={(e) => {
                setIsOpen(false)
                handleNavClick(e, item.href)
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className={styles.mobileCtaWrap}>
          <Button
            href="#contact"
            variant="primary"
            onClick={(e) => {
              setIsOpen(false)
              handleNavClick(e, '#contact')
            }}
          >
            ENQUIRE NOW
          </Button>
        </div>
      </div>
    </header>
  )
}
