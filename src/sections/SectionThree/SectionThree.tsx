import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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
  const pinWrapRef = useRef<HTMLDivElement>(null)
  const svgCanvasRef = useRef<SVGSVGElement>(null)
  const mainPathRef = useRef<SVGPathElement>(null)
  const guidePathRef = useRef<SVGPathElement>(null)
  const pulseHeadRef = useRef<SVGCircleElement>(null)
  const nodesRef = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      const mainPath = mainPathRef.current
      const guidePath = guidePathRef.current
      const canvas = svgCanvasRef.current

      if (!mainPath || !canvas) return

      // Measure node center positions relative to the SVG canvas
      const updatePathGeometry = () => {
        const canvasRect = canvas.getBoundingClientRect()
        if (!canvasRect.width || !canvasRect.height) return

        const points: { x: number; y: number }[] = []
        points.push({ x: 500, y: 30 }) // Start point at top center

        nodesRef.current.forEach((node) => {
          if (!node) return
          const marker = node.querySelector(`.${styles.nodeMarker}`)
          if (marker) {
            const markerRect = marker.getBoundingClientRect()
            const cx = ((markerRect.left + markerRect.width / 2 - canvasRect.left) / canvasRect.width) * 1000
            const cy = ((markerRect.top + markerRect.height / 2 - canvasRect.top) / canvasRect.height) * 2000
            points.push({ x: cx, y: cy })
          }
        })

        if (points.length < 2) return

        // Build smooth S-curve d string passing through all node center points
        let d = `M ${points[0].x},${points[0].y}`
        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1]
          const curr = points[i]
          const midY = (prev.y + curr.y) / 2
          d += ` C ${prev.x},${midY} ${curr.x},${midY} ${curr.x},${curr.y}`
        }

        mainPath.setAttribute('d', d)
        if (guidePath) guidePath.setAttribute('d', d)
      }

      updatePathGeometry()

      const totalLength = mainPath.getTotalLength()

      // Initially strokeDasharray = totalLength, strokeDashoffset = totalLength (nothing visible)
      gsap.set(mainPath, {
        strokeDasharray: totalLength,
        strokeDashoffset: totalLength,
      })

      // Compute exact path lengths l_i corresponding to node center arrivals
      const nodeLengths: number[] = []
      const samples = 300
      const nodeCount = JOURNEY_NODES.length

      nodesRef.current.forEach((node) => {
        if (!node) return
        const marker = node.querySelector(`.${styles.nodeMarker}`)
        if (!marker) return
        const canvasRect = canvas.getBoundingClientRect()
        const markerRect = marker.getBoundingClientRect()
        const targetY = ((markerRect.top + markerRect.height / 2 - canvasRect.top) / canvasRect.height) * 2000

        let closestLen = 0
        let minDiff = Infinity
        for (let s = 0; s <= samples; s++) {
          const l = (s / samples) * totalLength
          const pt = mainPath.getPointAtLength(l)
          const diff = Math.abs(pt.y - targetY)
          if (diff < minDiff) {
            minDiff = diff
            closestLen = l
          }
        }
        nodeLengths.push(closestLen)
      })

      // ONE Master ScrollTrigger pinning the section viewport
      ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: true,
        start: 'top top',
        end: '+=220%', // Viewport stays pinned fixed in place while journey plays
        scrub: true,   // 1:1 scroll wheel route drawing
        onUpdate: (self: ScrollTrigger) => {
          const progress = self.progress
          const drawnLength = totalLength * progress

          // 1. SVG Path strokeDashoffset driven directly by scroll
          gsap.set(mainPath, { strokeDashoffset: totalLength - drawnLength })

          // 2. Track leading route pulse marker tip position
          if (pulseHeadRef.current) {
            const headPt = mainPath.getPointAtLength(drawnLength)
            pulseHeadRef.current.setAttribute('cx', headPt.x.toString())
            pulseHeadRef.current.setAttribute('cy', headPt.y.toString())
          }

          // 3. Physical tip collision: Activate node & card ONLY when tip reaches node's length l_i
          let activeIndex = -1
          for (let i = nodeCount - 1; i >= 0; i--) {
            const l = nodeLengths[i] ?? 0
            if (drawnLength >= l - 15) { // Tip has physically reached node
              activeIndex = i
              break
            }
          }

          nodesRef.current.forEach((node, idx) => {
            if (!node) return
            if (idx === activeIndex) {
              node.setAttribute('data-active', 'true')
            } else {
              node.removeAttribute('data-active')
            }
          })
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="experience" className={styles.section}>
      <div ref={pinWrapRef} className={styles.pinWrap}>
        <div className={`container ${styles.inner}`}>
          {/* Section Header */}
          <div className={styles.header}>
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
            <svg ref={svgCanvasRef} className={styles.svgCanvas} viewBox="0 0 1000 2000" preserveAspectRatio="none" aria-hidden="true">
              {/* Guide faint background line */}
              <path
                ref={guidePathRef}
                d="M 500,30 C 200,320 220,600 500,900 C 780,1200 760,1500 500,1750 C 250,1900 500,1970 500,2000"
                className={styles.svgGuidePath}
              />
              {/* Primary SVG Path Timeline */}
              <path
                ref={mainPathRef}
                d="M 500,30 C 200,320 220,600 500,900 C 780,1200 760,1500 500,1750 C 250,1900 500,1970 500,2000"
                className={styles.svgMainPath}
              />
              {/* Leading route pulse marker */}
              <circle
                ref={pulseHeadRef}
                cx="500"
                cy="30"
                r="10"
                className={styles.svgPathHead}
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
                    <div className={styles.activeSheen} aria-hidden="true" />

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
      </div>
    </section>
  )
}





