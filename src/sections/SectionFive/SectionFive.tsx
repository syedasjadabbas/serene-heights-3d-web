/**
 * Section: Smart Investment (ownership tiers: whole apartment, Smart Property Unit, managed operations)
 * Assets: src/assets/amenities/
 */
import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
const SectionFiveCanvas = lazy(() => import('./SectionFiveCanvas'))
import styles from './SectionFive.module.css'

interface InvestmentTier {
  id: string
  num: string
  tag: string
  statValue: string
  statLabel: string
  title: string
  description: string
  watermark: string
  specs: { label: string; value: string }[]
  isHero?: boolean
  tagStyle: string
}

const INVESTMENT_TIERS: InvestmentTier[] = [
  {
    id: 'whole-suite',
    num: '01',
    tag: 'WHOLE APARTMENT',
    statValue: '5–8%',
    statLabel: 'ANNUAL APPRECIATION',
    title: 'Full Residence Ownership',
    description:
      'Own a whole fully furnished 1, 2, or 3-bedroom hotel apartment with zero maintenance fees and quarterly profit distribution.',
    watermark: 'SPEC 01 · WHOLE UNIT',
    tagStyle: styles.tagGold,
    specs: [
      { label: 'PRICE', value: 'PKR 40,000 / SQ FT' },
      { label: 'RENTAL INCOME', value: 'PKR 80–120K / MO' },
      { label: 'OWNER STAY', value: '28 FREE NIGHTS / YR' },
    ],
  },
  {
    id: 'spu-fractional',
    num: '02',
    tag: 'SMART PROPERTY UNIT · FEATURED HERO',
    statValue: '13–15%',
    statLabel: 'PROJECTED ANNUAL ROI',
    title: 'Co-Owned Smart Units',
    description:
      'Entry-level co-ownership in fixed 50 sq ft Smart Property Units, with rentals, maintenance and returns managed by DM Consortium.',
    watermark: 'SPEC 02 · CO-OWNERSHIP',
    isHero: true,
    tagStyle: styles.tagHero,
    specs: [
      { label: 'UNIT VALUE', value: 'PKR 2.25M' },
      { label: 'RENTAL INCOME', value: 'PKR 300K / YR' },
      { label: 'MANAGEMENT', value: 'DM CONSORTIUM' },
    ],
  },
  {
    id: 'dm-hospitality',
    num: '03',
    tag: 'HOSPITALITY MANAGEMENT',
    statValue: '15+',
    statLabel: 'DM CONSORTIUM PROJECTS',
    title: 'Managed Suite Operations',
    description:
      'Rentals, maintenance and returns managed by DM Consortium, with profit sharing from hotel revenue streams.',
    watermark: 'SPEC 03 · OPERATOR',
    tagStyle: styles.tagSage,
    specs: [
      { label: 'FRONT DESK', value: '24/7 CONCIERGE' },
      { label: 'OWNER MAINTENANCE', value: 'ZERO FEES' },
      { label: 'PAYOUT CYCLE', value: 'QUARTERLY' },
    ],
  },
]

export default function SectionFive() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const rectCacheRef = useRef<Map<HTMLDivElement, DOMRect>>(new Map())
  const rafIdRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      // Header entrance reveal
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      }

      // Staggered Cards Entrance Reveal
      cardsRef.current.forEach((card, idx) => {
        if (!card) return
        const rotateStart = idx === 0 ? -2.5 : idx === 2 ? 2.5 : 0

        gsap.fromTo(
          card,
          { opacity: 0, y: 60, scale: idx === 1 ? 0.96 : 0.92, rotate: rotateStart },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 1.0,
            delay: idx * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    rectCacheRef.current.set(card, card.getBoundingClientRect())
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    let rect = rectCacheRef.current.get(card)
    if (!rect) {
      rect = card.getBoundingClientRect()
      rectCacheRef.current.set(card, rect)
    }

    const clientX = e.clientX
    const clientY = e.clientY

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)

    rafIdRef.current = requestAnimationFrame(() => {
      const px = (clientX - rect.left) / rect.width
      const py = (clientY - rect.top) / rect.height
      const rotateX = (0.5 - py) * 14
      const rotateY = (px - 0.5) * 16
      const shadowX = (0.5 - px) * 18
      const shadowY = (py - 0.5) * 18 + 32
      const parallaxX = (px - 0.5) * 8
      const parallaxY = (py - 0.5) * 8

      card.style.setProperty('--rotate-x', `${rotateX}deg`)
      card.style.setProperty('--rotate-y', `${rotateY}deg`)
      card.style.setProperty('--translate-z', '18px')
      card.style.setProperty('--light-x', `${px * 100}%`)
      card.style.setProperty('--light-y', `${py * 100}%`)
      card.style.setProperty('--light-opacity', '1')
      card.style.setProperty('--shadow-x', `${shadowX}px`)
      card.style.setProperty('--shadow-y', `${shadowY}px`)
      card.style.setProperty('--parallax-x', `${parallaxX}px`)
      card.style.setProperty('--parallax-y', `${parallaxY}px`)
      card.classList.add(styles.cardHovered)
    })
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    rectCacheRef.current.delete(card)
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)

    card.style.setProperty('--rotate-x', '0deg')
    card.style.setProperty('--rotate-y', '0deg')
    card.style.setProperty('--translate-z', '0px')
    card.style.setProperty('--shadow-x', '0px')
    card.style.setProperty('--shadow-y', '30px')
    card.style.setProperty('--parallax-x', '0px')
    card.style.setProperty('--parallax-y', '0px')
    card.classList.remove(styles.cardHovered)
  }

  return (
    <section ref={sectionRef} id="floor-plans" data-alias="residences-suites" className={styles.section}>
      {/* 3D Exhibition Canvas Stage */}
      <Suspense fallback={null}>
        <SectionFiveCanvas />
      </Suspense>

      {/* Background Blueprint Grid & Ambient Backdrop */}
      <div className={styles.blueprintBgGrid} aria-hidden="true" />
      <div className={styles.ambientGradient} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        {/* Section Header */}
        <div ref={headerRef} className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowNum}>05</span>
            <span className={styles.eyebrowDivider}>/</span>
            <span>SMART INVESTMENT PRESENTATION</span>
          </p>
          <h2 className={styles.headerHeadline}>
            Winter resort real estate.
            <br />
            Structured for <span className={styles.headerAccent}>managed returns.</span>
          </h2>
          <p className={styles.subcopy}>
            Explore co-owned Smart Property Units, whole hotel apartments, and rental management by DM Consortium.
          </p>
        </div>

        {/* 3-Slab Investment Grid */}
        <div className={styles.grid}>
          {INVESTMENT_TIERS.map((tier, idx) => {
            const positionClass = idx === 0 ? styles.leftCard : idx === 2 ? styles.rightCard : styles.heroCard

            return (
              <div
                key={tier.id}
                ref={(el) => { cardsRef.current[idx] = el }}
                className={`${styles.card} ${positionClass}`}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <div className={styles.cardLight} aria-hidden="true" />
                <span className={styles.cardWatermark}>{tier.watermark}</span>

                <div className={styles.cardInner}>
                  <div className={styles.cardTagWrap}>
                    <span className={`${styles.cardTag} ${tier.tagStyle}`}>{tier.tag}</span>
                  </div>

                  {/* High Impact Numerical Stat Callout */}
                  <div className={styles.statCallout}>
                    <span className={`${styles.statValue} ${tier.isHero ? styles.heroStatValue : ''}`}>
                      {tier.statValue}
                    </span>
                    <span className={styles.statLabel}>{tier.statLabel}</span>
                  </div>

                  <h3 className={styles.cardTitle}>{tier.title}</h3>
                  <p className={styles.cardDescription}>{tier.description}</p>

                  {/* Editorial Spec List */}
                  <div className={styles.specList}>
                    {tier.specs.map((spec, sIdx) => (
                      <div key={sIdx} className={styles.specRow}>
                        <span className={styles.specLabel}>{spec.label}</span>
                        <span className={`${styles.specVal} ${tier.isHero ? styles.heroSpecVal : ''}`}>
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
