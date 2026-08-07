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

    window.addEventListener('scroll', checkActiveSection, { passive: true })
    checkActiveSection()

    const timer = setInterval(checkActiveSection, 250)

    return () => {
      window.removeEventListener('scroll', checkActiveSection)
      clearInterval(timer)
    }
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetId = href.replace('#', '')
    if (targetId === 'top' || targetId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const targetEl = document.getElementById(targetId)
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' })
    }
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
