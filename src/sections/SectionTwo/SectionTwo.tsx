/**
 * Section: Overview
 * Assets: src/assets/overview/
 */
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import styles from './SectionTwo.module.css'

function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true">
      <path
        d="M7 17L17 7M17 7H9M17 7V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const CTA_TONE_CLASS = {
  gold: styles.ctaGold,
  sage: styles.ctaSage,
  mist: styles.ctaMist,
} as const

function CardCta({ href, tone }: { href: string; tone: keyof typeof CTA_TONE_CLASS }) {
  return (
    <a href={href} className={`${styles.cta} ${CTA_TONE_CLASS[tone]}`} aria-label="Learn more">
      <IconArrow />
    </a>
  )
}

function IconBalcony() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
      <path
        d="M3 10h18M4 10v9M20 10v9M8 10v9M12 10v9M16 10v9M3 19h18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 6l6-3 6 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconConcierge() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
      <path d="M12 4a8 8 0 0 0-8 8v4h16v-4a8 8 0 0 0-8-8z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 16h20M12 2v2M12 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconLocation() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
      <path
        d="M12 21s-7-5.5-7-11.5a7 7 0 1 1 14 0C19 15.5 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function IconPark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H7c-1.1 0-2 .9-2 2v7c0 .6.4 1 1 1h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

const RESIDENCE_FACTS: Array<{ icon: ReactNode; headline: string; caption: string }> = [
  { icon: <IconBuilding />, headline: '150+ Hotel Apartments', caption: 'Across 3 signature alpine towers' },
  { icon: <IconBalcony />, headline: 'Mountain-Facing Balconies', caption: '180° pristine pine forest vistas' },
  { icon: <IconConcierge />, headline: '24/7 Concierge Services', caption: 'Turnkey DM Consortium management' },
  { icon: <IconShield />, headline: 'Zero Owner Maintenance', caption: 'No operational fees or owner hassle' },
  { icon: <IconLocation />, headline: '7,906 ft Altitude Location', caption: 'Set in pristine Nathia Gali pine forests' },
  { icon: <IconPark />, headline: 'All-Weather Valet Parking', caption: 'Heavy snow-resistant covered basement parking' },
]

const PAYMENT_FACTS: Array<{ value: string; label: string; tone: string; rotate: number }> = [
  { value: 'PKR 37,000', label: 'Per sq ft base valuation', tone: styles.paymentCardA, rotate: -6 },
  { value: '30%', label: 'Booking initial allocation', tone: styles.paymentCardB, rotate: 4 },
  { value: '36 Months', label: '0% Interest installment timeline', tone: styles.paymentCardC, rotate: -3 },
]

export default function SectionTwo() {
  const sectionRef = useRef<HTMLElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const statementRef = useRef<HTMLHeadingElement>(null)
  const subcopyRef = useRef<HTMLParagraphElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      // Header reveal — softly emerges at ~p=0.85 as Section 2 enters viewport bottom
      gsap.fromTo(
        [eyebrowRef.current, statementRef.current, subcopyRef.current],
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 98%',
            toggleActions: 'play none none reverse',
          },
        },
      )

      // Columns staggered entrance — cascades in as Section 2 rises (around p=0.95)
      if (gridRef.current) {
        const columns = Array.from(gridRef.current.children)
        gsap.fromTo(
          columns,
          { opacity: 0, y: 48, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            stagger: 0.16,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const rectCacheRef = useRef<Map<HTMLDivElement, DOMRect>>(new Map())
  const rafIdRef = useRef<number | null>(null)

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const slab = e.currentTarget
    rectCacheRef.current.set(slab, slab.getBoundingClientRect())
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const slab = e.currentTarget
    let rect = rectCacheRef.current.get(slab)
    if (!rect) {
      rect = slab.getBoundingClientRect()
      rectCacheRef.current.set(slab, rect)
    }

    const clientX = e.clientX
    const clientY = e.clientY

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)

    rafIdRef.current = requestAnimationFrame(() => {
      const px = (clientX - rect.left) / rect.width
      const py = (clientY - rect.top) / rect.height
      const rotateX = (0.5 - py) * 10
      const rotateY = (px - 0.5) * 10
      const shadowX = (0.5 - px) * 16
      const shadowY = (py - 0.5) * 16 + 32
      const parallaxX = (px - 0.5) * 8
      const parallaxY = (py - 0.5) * 8

      slab.style.setProperty('--rotate-x', `${rotateX}deg`)
      slab.style.setProperty('--rotate-y', `${rotateY}deg`)
      slab.style.setProperty('--translate-z', '12px')
      slab.style.setProperty('--light-x', `${px * 100}%`)
      slab.style.setProperty('--light-y', `${py * 100}%`)
      slab.style.setProperty('--shadow-x', `${shadowX}px`)
      slab.style.setProperty('--shadow-y', `${shadowY}px`)
      slab.style.setProperty('--parallax-x', `${parallaxX}px`)
      slab.style.setProperty('--parallax-y', `${parallaxY}px`)
      slab.classList.add(styles.columnHovered)
    })
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const slab = e.currentTarget
    rectCacheRef.current.delete(slab)
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)

    slab.style.setProperty('--rotate-x', '0deg')
    slab.style.setProperty('--rotate-y', '0deg')
    slab.style.setProperty('--translate-z', '0px')
    slab.style.setProperty('--shadow-x', '0px')
    slab.style.setProperty('--shadow-y', '30px')
    slab.style.setProperty('--parallax-x', '0px')
    slab.style.setProperty('--parallax-y', '0px')
    slab.classList.remove(styles.columnHovered)
  }

  return (
    <section ref={sectionRef} id="about" data-alias="overview" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.header}>
          <p ref={eyebrowRef} className={styles.eyebrow}>
            <span className={styles.eyebrowNum}>02</span>
            <span className={styles.eyebrowDivider}>/</span>
            <span>OWNERSHIP &amp; INVESTMENT</span>
          </p>
          <h2 ref={statementRef} className={styles.statement}>
            Own your place in the mountains,
            <br />
            or start with a share of it.
          </h2>
          <p ref={subcopyRef} className={styles.subcopy}>
            Flexible investment structures tailored for Pakistan’s premier winter resort, backed by complete hospitality management.
          </p>
        </div>

        <div ref={gridRef} className={styles.grid}>
          {/* Residences Column */}
          <div
            className={styles.column}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.slabLight} aria-hidden="true" />
            <span className={styles.slabWatermark}>SPEC 01 · TOWER</span>
            <div className={styles.columnTagWrap}>
              <span className={`${styles.columnTag} ${styles.tagGold}`}>RESIDENCES</span>
            </div>
            <h3 className={`${styles.heading} ${styles.headingGold}`}>Luxury Apartments</h3>
            <p className={styles.description}>
              150+ fully managed hotel apartments across 3 towers — 1, 2 and 3-bedroom residences with zero maintenance fees for owners.
            </p>
            <div className={styles.factStack}>
              {RESIDENCE_FACTS.map((fact) => (
                <div key={fact.headline} className={styles.factCard}>
                  <span className={`${styles.factIcon} ${styles.factIconGold}`}>{fact.icon}</span>
                  <div>
                    <span className={styles.factHeadline}>{fact.headline}</span>
                    <span className={styles.factCaption}>{fact.caption}</span>
                  </div>
                </div>
              ))}
            </div>
            <CardCta href="#floor-plans" tone="gold" />
          </div>

          {/* Payment Plan Column */}
          <div
            className={styles.column}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.slabLight} aria-hidden="true" />
            <span className={styles.slabWatermark}>SPEC 02 · FINANCES</span>
            <div className={styles.columnTagWrap}>
              <span className={`${styles.columnTag} ${styles.tagSage}`}>STRUCTURE</span>
            </div>
            <h3 className={`${styles.heading} ${styles.headingSage}`}>Payment Plan</h3>
            <p className={styles.description}>
              A straightforward path to ownership: PKR 37,000 per sq ft, booking from 30%, and 36 monthly installments.
            </p>
            <div className={styles.paymentFan}>
              {PAYMENT_FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className={`${styles.paymentCard} ${fact.tone}`}
                  style={{ '--rotate': `${fact.rotate}deg` } as CSSProperties}
                >
                  <span className={styles.paymentValue}>{fact.value}</span>
                  <span className={styles.paymentLabel}>{fact.label}</span>
                </div>
              ))}
            </div>

            {/* Enriched Editorial Specification Breakdown */}
            <div className={styles.editorialSpecList}>
              <div className={styles.editorialSpecRow}>
                <span className={styles.editorialSpecLabel}>Construction</span>
                <span className={styles.editorialSpecVal}>On Schedule · 36 Months</span>
              </div>
              <div className={styles.editorialSpecRow}>
                <span className={styles.editorialSpecLabel}>Inventory</span>
                <span className={styles.editorialSpecVal}>Towers A, B & C Release</span>
              </div>
              <div className={styles.editorialSpecRow}>
                <span className={styles.editorialSpecLabel}>Facade Glass</span>
                <span className={styles.editorialSpecVal}>Triple-Glazed Thermal</span>
              </div>
              <div className={styles.editorialSpecRow}>
                <span className={styles.editorialSpecLabel}>Yield Target</span>
                <span className={styles.editorialSpecVal}>13–15% Annual ROI</span>
              </div>
            </div>

            <CardCta href="#payment-plan" tone="sage" />
          </div>

          {/* Smart Property Unit Column */}
          <div
            className={styles.column}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.slabLight} aria-hidden="true" />
            <span className={styles.slabWatermark}>SPEC 03 · FRACTIONAL</span>
            <div className={styles.columnTagWrap}>
              <span className={`${styles.columnTag} ${styles.tagMist}`}>FRACTIONAL</span>
            </div>
            <h3 className={`${styles.heading} ${styles.headingMist}`}>Smart Property Unit</h3>
            <p className={styles.description}>
              A smaller way in — own a 50 sq ft Smart Property Unit, managed and rented on your behalf by DM Consortium.
            </p>
            <div className={styles.unitCardWrap}>
              <div className={styles.unitCard}>
                <div className={styles.unitHeader}>
                  <span className={styles.unitHeaderLabel}>Smart Property Unit</span>
                  <span className={styles.unitHeaderTag}>50 sq ft</span>
                </div>
                <div className={styles.unitRoi}>
                  <span className={styles.unitRoiValue}>13–15%</span>
                  <span className={styles.unitRoiCaption}>Projected annual ROI*</span>
                </div>
                <div className={styles.unitDivider} />
                <div className={styles.unitStats}>
                  <div className={styles.unitStatRow}>
                    <span>Unit value</span>
                    <span>PKR 2,250,000</span>
                  </div>
                  <div className={styles.unitStatRow}>
                    <span>Down payment (30%)</span>
                    <span>PKR 675,000</span>
                  </div>
                  <div className={styles.unitStatRow}>
                    <span>36 installments</span>
                    <span>PKR 43,750/mo</span>
                  </div>
                  <div className={styles.unitStatRow}>
                    <span>Projected rental income</span>
                    <span>~PKR 300,000/yr</span>
                  </div>
                  <div className={styles.unitStatRow}>
                    <span>Annual capital gain*</span>
                    <span>5%</span>
                  </div>
                </div>
                <div className={styles.unitFooter}>
                  <span className={styles.unitFooterTag}>Managed by DM Consortium</span>
                  <span className={styles.unitFooterTag}>Transferable</span>
                </div>
              </div>
            </div>

            {/* Enriched Supporting Information Chips */}
            <div className={styles.editorialSpecList}>
              <div className={styles.editorialSpecRow}>
                <span className={styles.editorialSpecLabel}>Approval</span>
                <span className={styles.editorialSpecVal}>GDA Approved</span>
              </div>
              <div className={styles.editorialSpecRow}>
                <span className={styles.editorialSpecLabel}>Ownership</span>
                <span className={styles.editorialSpecVal}>100% Freehold Title</span>
              </div>
              <div className={styles.editorialSpecRow}>
                <span className={styles.editorialSpecLabel}>Operator</span>
                <span className={styles.editorialSpecVal}>DM Consortium</span>
              </div>
              <div className={styles.editorialSpecRow}>
                <span className={styles.editorialSpecLabel}>Transfer</span>
                <span className={styles.editorialSpecVal}>Fully Transferable</span>
              </div>
            </div>

            <p className={styles.disclaimer}>*Projected figures provided by developer, not guaranteed returns.</p>
            <CardCta href="#smart-unit" tone="mist" />
          </div>
        </div>
      </div>
    </section>
  )
}


