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

function IconBed() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
      <path
        d="M3 18v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 18v2M21 18v2M3 11V8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
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

const RESIDENCE_FACTS: Array<{ icon: ReactNode; headline: string; caption: string }> = [
  { icon: <IconBuilding />, headline: '150+ apartments', caption: 'Across 3 towers' },
  { icon: <IconBed />, headline: '1, 2 & 3 bedrooms', caption: 'Fully furnished residences' },
  { icon: <IconShield />, headline: 'Zero owner fees', caption: 'No maintenance costs' },
]

const PAYMENT_FACTS: Array<{ value: string; label: string; tone: string; rotate: number }> = [
  { value: 'PKR 37,000', label: 'Per sq ft', tone: styles.paymentCardA, rotate: -6 },
  { value: '30%', label: 'Booking from', tone: styles.paymentCardB, rotate: 4 },
  { value: '36', label: 'Monthly installments', tone: styles.paymentCardC, rotate: -3 },
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

      // Header reveal
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
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      )

      // Columns staggered entrance
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

  return (
    <section ref={sectionRef} id="overview" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.header}>
          <p ref={eyebrowRef} className={styles.eyebrow}>
            <span className={styles.eyebrowNum}>02</span>
            <span className={styles.eyebrowDivider}>/</span>
            <span>OWNERSHIP & INVESTMENT</span>
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
          <div className={styles.column}>
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
            <CardCta href="#residences" tone="gold" />
          </div>

          {/* Payment Plan Column */}
          <div className={styles.column}>
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
            <CardCta href="#payment-plan" tone="sage" />
          </div>

          {/* Smart Property Unit Column */}
          <div className={styles.column}>
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
            <p className={styles.disclaimer}>*Projected figures provided by developer, not guaranteed returns.</p>
            <CardCta href="#smart-property-unit" tone="mist" />
          </div>
        </div>
      </div>
    </section>
  )
}

