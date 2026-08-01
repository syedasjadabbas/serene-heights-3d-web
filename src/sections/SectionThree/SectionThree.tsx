import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import styles from './SectionThree.module.css'

interface JourneyNode {
  number: string
  category: string
  title: string
  description: string
  coords: string
  stats: { label: string; value: string }
  side: 'left' | 'right'
}

const JOURNEY_NODES: JourneyNode[] = [
  {
    number: '01',
    category: 'MOUNTAIN LIVING',
    title: 'Sanctuary in Nathia Gali',
    description:
      'Set high in the Galyat range at 7,906 ft, offering pristine pine forest vistas, clean alpine air, and winter snowfall.',
    coords: '34°04’08” N / 73°23’05” E',
    stats: { label: 'ALTITUDE', value: '7,906 FT' },
    side: 'left',
  },
  {
    number: '02',
    category: 'LUXURY RESIDENCES',
    title: '150+ Hotel Apartments',
    description:
      'Three signature alpine towers housing 1, 2, and 3-bedroom fully furnished residences engineered with natural stone and thermal glass facades.',
    coords: 'TOWERS A · B · C',
    stats: { label: 'RESIDENCES', value: '150+ SUITES' },
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
    side: 'left',
  },
  {
    number: '04',
    category: 'MANAGED HOSPITALITY',
    title: 'Turnkey Suite Operations',
    description:
      'Every apartment is professionally managed and rented on your behalf by DM Consortium, providing 5-star hotel services and owner peace of mind.',
    coords: 'DM HOSPITALITY',
    stats: { label: 'OPERATOR', value: 'DM CONSORTIUM' },
    side: 'right',
  },
  {
    number: '05',
    category: 'SMART INVESTMENT',
    title: '13–15% Projected Annual ROI',
    description:
      'Invest in whole residences or 50 sq ft Smart Property Units, pairing high rental income potential with long-term capital growth.',
    coords: 'YIELD METRICS',
    stats: { label: 'PROJECTED ROI', value: '13–15% / YR' },
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
    side: 'right',
  },
]

export default function SectionThree() {
  const sectionRef = useRef<HTMLElement>(null)
  const mainPathRef = useRef<SVGPathElement>(null)
  const guidePathRef = useRef<SVGPathElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const nodesRef = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      // Header entrance animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      )

      // Main SVG Blueprint Line Drawing Animation 1:1 on Scroll
      const path = mainPathRef.current
      if (path) {
        const pathLength = path.getTotalLength()
        gsap.set(path, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        })

        gsap.to(path, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 50%',
            end: 'bottom 75%',
            scrub: true,
          },
        })
      }

      // Feature Nodes entrance and active highlight
      nodesRef.current.forEach((node) => {
        if (!node) return
        const card = node.querySelector(`.${styles.nodeContent}`)
        const marker = node.querySelector(`.${styles.nodeMarker}`)
        const line = node.querySelector(`.${styles.nodePointerLine}`)

        gsap.fromTo(
          card,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: node,
              start: 'top 78%',
              toggleActions: 'play none none reverse',
              onEnter: () => {
                node.setAttribute('data-active', 'true')
                if (marker) gsap.to(marker, { scale: 1.3, duration: 0.35, ease: 'back.out(1.7)' })
                if (line) gsap.to(line, { opacity: 1, scaleX: 1, duration: 0.4 })
              },
              onLeaveBack: () => {
                node.removeAttribute('data-active')
                if (marker) gsap.to(marker, { scale: 1.0, duration: 0.3 })
                if (line) gsap.to(line, { opacity: 0.4, duration: 0.3 })
              },
            },
          },
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="experience" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        {/* Section Header */}
        <div ref={headerRef} className={styles.header}>
          <div className={styles.headerBadge}>
            <span className={styles.badgeNum}>03</span>
            <span className={styles.badgeDivider}>/</span>
            <span>ARCHITECTURAL JOURNEY</span>
          </div>
          <h2 className={styles.headline}>
            A guided exploration of
            <br />
            Pakistan’s premier resort.
          </h2>
          <p className={styles.subcopy}>
            Trace the architectural, hospitality, and investment story of Serene Heights along our master planning line.
          </p>
        </div>

        {/* Blueprint Journey Backbone Container */}
        <div className={styles.journeyWrap}>
          {/* Architectural Background Grid Ticks */}
          <div className={styles.blueprintGrid} aria-hidden="true">
            <span className={styles.gridCalloutLeft}>LAT 34°04’08” N</span>
            <span className={styles.gridCalloutRight}>ELEV 7,906 FT</span>
          </div>

          {/* SVG Journey Vector Canvas */}
          <svg className={styles.svgCanvas} viewBox="0 0 1000 2000" preserveAspectRatio="none" aria-hidden="true">
            {/* Guide faint background line */}
            <path
              ref={guidePathRef}
              d="M 500,50 C 200,320 220,600 500,900 C 780,1200 760,1500 500,1750 C 250,1900 500,1970 500,2000"
              className={styles.svgGuidePath}
            />
            {/* Active drawn path line */}
            <path
              ref={mainPathRef}
              d="M 500,50 C 200,320 220,600 500,900 C 780,1200 760,1500 500,1750 C 250,1900 500,1970 500,2000"
              className={styles.svgMainPath}
            />
          </svg>

          {/* Nodes List */}
          <div className={styles.nodesList}>
            {JOURNEY_NODES.map((node, index) => (
              <div
                key={node.number}
                ref={(el) => { nodesRef.current[index] = el }}
                className={`${styles.nodeRow} ${node.side === 'right' ? styles.rowRight : styles.rowLeft}`}
              >
                {/* Node Content Card */}
                <div className={styles.nodeContent}>
                  <div className={styles.nodeMeta}>
                    <span className={styles.nodeNumber}>{node.number}</span>
                    <span className={styles.nodeCategory}>{node.category}</span>
                    <span className={styles.nodeCoords}>{node.coords}</span>
                  </div>

                  <h3 className={styles.nodeTitle}>{node.title}</h3>
                  <p className={styles.nodeDescription}>{node.description}</p>

                  <div className={styles.nodeFooter}>
                    <span className={styles.statLabel}>{node.stats.label}</span>
                    <span className={styles.statValue}>{node.stats.value}</span>
                  </div>
                </div>

                {/* Pointer Line */}
                <div className={styles.nodePointerLine} aria-hidden="true" />

                {/* Center Blueprint Marker */}
                <div className={styles.nodeMarkerWrap} aria-hidden="true">
                  <div className={styles.nodeMarker}>
                    <div className={styles.markerCenterDot} />
                    <div className={styles.markerCrosshairH} />
                    <div className={styles.markerCrosshairV} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


