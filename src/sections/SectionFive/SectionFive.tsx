import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import SectionFiveCanvas from './SectionFiveCanvas'
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
    tag: 'WHOLE SUITE TITLE',
    statValue: '100%',
    statLabel: 'FREEHOLD TITLE DEED',
    title: 'Full Residence Ownership',
    description:
      'Acquire whole 1, 2, or 3-bedroom luxury hotel apartments with perpetual title deeds and zero annual maintenance costs for owners.',
    watermark: 'SPEC 01 · FULL TITLE',
    tagStyle: styles.tagGold,
    specs: [
      { label: 'PERPETUAL TITLE', value: 'FREEHOLD' },
      { label: 'CAPITAL GROWTH', value: '12–14% / YR' },
      { label: 'OWNER STAY RIGHTS', value: '30 DAYS / YR' },
    ],
  },
  {
    id: 'spu-fractional',
    num: '02',
    tag: 'SMART PROPERTY UNIT · FEATURED HERO',
    statValue: '13–15%',
    statLabel: 'PROJECTED ANNUAL ROI',
    title: 'Fractional Smart Units',
    description:
      'Entry-level fractional investment starting at 50 sq ft SPU units. Enjoy passive rental yield deposited directly into your account.',
    watermark: 'SPEC 02 · FRACTIONAL',
    isHero: true,
    tagStyle: styles.tagHero,
    specs: [
      { label: 'ENTRY TICKET', value: 'PKR 1.85M' },
      { label: 'RENTAL YIELD', value: '13–15% / YR' },
      { label: 'MANAGEMENT', value: '100% TURNKEY' },
    ],
  },
  {
    id: 'dm-hospitality',
    num: '03',
    tag: 'HOSPITALITY MANAGEMENT',
    statValue: '5-STAR',
    statLabel: 'DM CONSORTIUM OPERATOR',
    title: 'Turnkey Suite Operations',
    description:
      'Complete hotel suite booking, maintenance, guest reception, and revenue distribution handled seamlessly by DM Consortium.',
    watermark: 'SPEC 03 · OPERATOR',
    tagStyle: styles.tagSage,
    specs: [
      { label: 'OCCUPANCY TARGET', value: '78% ANNUAL' },
      { label: 'OWNER MAINTENANCE', value: 'PKR 0' },
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

      // Smooth Exit Transition into Next Section
      if (sectionRef.current) {
        gsap.to(sectionRef.current, {
          opacity: 0.92,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'bottom 80%',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
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
      const rotateX = (0.5 - py) * 10
      const rotateY = (px - 0.5) * 10
      const shadowX = (0.5 - px) * 18
      const shadowY = (py - 0.5) * 18 + 32
      const parallaxX = (px - 0.5) * 8
      const parallaxY = (py - 0.5) * 8

      card.style.setProperty('--rotate-x', `${rotateX}deg`)
      card.style.setProperty('--rotate-y', `${rotateY}deg`)
      card.style.setProperty('--translate-z', '12px')
      card.style.setProperty('--light-x', `${px * 100}%`)
      card.style.setProperty('--light-y', `${py * 100}%`)
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
    <section ref={sectionRef} id="investment" className={styles.section}>
      {/* 3D Exhibition Canvas Stage */}
      <SectionFiveCanvas />

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
            High yield mountain real estate.
            <br />
            Structured for effortless returns.
          </h2>
          <p className={styles.subcopy}>
            Explore fractional Smart Property Units, whole luxury suites, and turnkey DM Consortium hospitality rental management.
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
