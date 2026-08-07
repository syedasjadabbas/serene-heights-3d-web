/**
 * Section: Masterplan
 * Assets: src/assets/masterplan/
 */
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import SectionThreeCanvas from './SectionThreeCanvas'
import styles from './SectionThree.module.css'

interface EditorialStage {
  number: string
  category: string
  title: string
  description: string
  coords: string
  stats: { label: string; value: string }
  specCallout: string
  side: 'left' | 'right'
  isFeature?: boolean
}

const EDITORIAL_STAGES: EditorialStage[] = [
  {
    number: '01',
    category: 'MOUNTAIN LIVING · FEATURED HERO',
    title: 'Sanctuary in Nathia Gali',
    description:
      'Set high in the Galyat range at 7,906 ft, offering pristine pine forest vistas, clean alpine air, and winter snowfall.',
    coords: '34°04’08” N / 73°23’05” E',
    stats: { label: 'ALTITUDE', value: '7,906 FT' },
    specCallout: 'LOCATION SPEC · GALYAT RANGE',
    side: 'left',
    isFeature: true,
  },
  {
    number: '02',
    category: 'LUXURY RESIDENCES',
    title: '150+ Hotel Apartments',
    description:
      'Three signature alpine towers housing 1, 2, and 3-bedroom fully furnished residences engineered with natural stone and thermal glass facades.',
    coords: 'TOWERS A · B · C',
    stats: { label: 'RESIDENCES', value: '150+ SUITES' },
    specCallout: 'ARCHITECTURAL TOWER SPEC',
    side: 'right',
  },
  {
    number: '03',
    category: 'WORLD-CLASS AMENITIES',
    title: '50+ Resort Experiences',
    description:
      'Heated indoor infinity pool, mountain-view spa & wellness center, fine dining restaurants, executive lounges, and private helipad access.',
    coords: 'LEVELS 01–04',
    stats: { label: 'AMENITIES', value: '50+ FACILITIES' },
    specCallout: 'RESORT MASTERPLAN SPEC',
    side: 'left',
  },
  {
    number: '04',
    category: 'MANAGED HOSPITALITY · FEATURED HERO',
    title: 'Turnkey Suite Operations',
    description:
      'Every apartment is professionally managed and rented on your behalf by DM Consortium, providing 5-star hotel services and owner peace of mind.',
    coords: 'DM HOSPITALITY',
    stats: { label: 'OPERATOR', value: 'DM CONSORTIUM' },
    specCallout: '5-STAR HOTEL OPERATIONS',
    side: 'right',
    isFeature: true,
  },
  {
    number: '05',
    category: 'SMART INVESTMENT',
    title: '13–15% Projected Annual ROI',
    description:
      'Invest in whole residences or 50 sq ft Smart Property Units, pairing high rental income potential with long-term capital growth.',
    coords: 'YIELD METRICS',
    stats: { label: 'PROJECTED ROI', value: '13–15% / YR' },
    specCallout: 'FINANCIAL YIELD STRUCTURE',
    side: 'left',
  },
  {
    number: '06',
    category: 'OWNERSHIP EXPERIENCE',
    title: 'Zero Maintenance Fees',
    description:
      'Enjoy complete ownership rights with zero owner maintenance costs and seamless rental yield transfers.',
    coords: 'OWNERSHIP TERMS',
    stats: { label: 'MAINTENANCE', value: 'PKR 0' },
    specCallout: 'FREEHOLD TITLE GUARANTEE',
    side: 'right',
  },
]

export default function SectionThree() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const lightBeamRef = useRef<HTMLDivElement>(null)
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

      // Traveling Architectural Light Spotlight Beam (Follows Scroll Progress)
      if (gridRef.current && lightBeamRef.current) {
        gsap.fromTo(
          lightBeamRef.current,
          { top: '0%' },
          {
            top: '100%',
            ease: 'none',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 65%',
              end: 'bottom 45%',
              scrub: true,
            },
          },
        )
      }

      // Independent Viewport Card Entrance Reveals & Active Focus State
      cardsRef.current.forEach((card, idx) => {
        if (!card) return
        const side = EDITORIAL_STAGES[idx]?.side
        const rotateStart = side === 'left' ? -2.5 : 2.5

        gsap.fromTo(
          card,
          { opacity: 0, y: 60, scale: 0.94, rotate: rotateStart },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 1.0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              onEnter: () => card.classList.add(styles.activeMilestoneCard),
              onLeave: () => card.classList.remove(styles.activeMilestoneCard),
              onEnterBack: () => card.classList.add(styles.activeMilestoneCard),
              onLeaveBack: () => card.classList.remove(styles.activeMilestoneCard),
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
    <section ref={sectionRef} id="lifestyle" data-alias="experience" className={styles.section}>
      {/* 3D Exhibition Canvas Stage */}
      <SectionThreeCanvas />

      {/* Background Architectural Construction Grid & Ambient Mesh */}
      <div className={styles.blueprintBgGrid} aria-hidden="true" />
      <div className={styles.ambientGradient} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        {/* Section Header */}
        <div ref={headerRef} className={styles.header}>
          <div className={styles.headerBadge}>
            <span className={styles.badgeNum}>03</span>
            <span className={styles.badgeDivider}>/</span>
            <span>ARCHITECTURAL PRESENTATION</span>
          </div>
          <h2 className={styles.headline}>
            A guided exploration of
            <br />
            Pakistan’s <span className={styles.headlineAccent}>premier resort.</span>
          </h2>
          <p className={styles.subcopy}>
            Discover the design philosophy, luxury residences, world-class amenities, and turnkey investment model of Serene Heights Nathia Gali.
          </p>
        </div>

        {/* PRYPCO / FINDD Architectural Editorial Cards Grid */}
        <div ref={gridRef} className={styles.editorialGrid}>
          {/* Traveling Architectural Light Spotlight Beam (No Graphic Lines) */}
          <div ref={lightBeamRef} className={styles.travelingLightBeam} aria-hidden="true" />

          {EDITORIAL_STAGES.map((item, index) => (
            <div
              key={item.number}
              className={`${styles.editorialRow} ${item.side === 'right' ? styles.rowRight : styles.rowLeft}`}
            >
              {/* Editorial Side Metadata */}
              <div className={styles.editorialSideMeta}>
                <span className={styles.sideMetaTitle}>{item.specCallout}</span>
                <div className={styles.sideMetaDivider} aria-hidden="true" />
                <span className={styles.sideMetaSub}>{item.coords}</span>
              </div>

              {/* Presentation Slab Card */}
              <div
                ref={(el) => { cardsRef.current[index] = el }}
                className={`${styles.card} ${item.isFeature ? styles.heroFeatureCard : styles.supportingCard}`}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <div className={styles.cardLight} aria-hidden="true" />
                <span className={styles.cardWatermark}>{item.specCallout}</span>

                <div className={styles.cardInner}>
                  <div className={styles.cardMetaRow}>
                    <span className={styles.cardNum}>{item.number}</span>
                    <span className={styles.cardCategory}>{item.category}</span>
                    <span className={styles.cardCoords}>{item.coords}</span>
                  </div>

                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDescription}>{item.description}</p>

                  <div className={styles.cardFooter}>
                    <span className={styles.statLabel}>{item.stats.label}</span>
                    <span className={styles.statValue}>{item.stats.value}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}






