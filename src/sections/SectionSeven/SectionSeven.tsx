import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import styles from './SectionSeven.module.css'

interface InvestmentStage {
  id: string
  number: string
  tag: string
  title: string
  highlight: string
  description: string
  blueprintData: string
}

const INVESTMENT_STAGES: InvestmentStage[] = [
  {
    id: 'residence',
    number: '01',
    tag: 'SELECTION',
    title: 'Choose your residence.',
    highlight: '150+ Hotel Apartments / 50 sq ft Smart Units',
    description:
      'Select whole 1, 2, or 3-bedroom mountain suites or fractional Smart Property Units designed for flexible ownership.',
    blueprintData: 'UNIT TYPE A1-C3 · ELEV 7,906 FT',
  },
  {
    id: 'reservation',
    number: '02',
    tag: 'RESERVATION',
    title: 'Reserve your unit.',
    highlight: '30% Initial Down Payment',
    description:
      'Secure your allotment with an initial 30% deposit and lock in early prime real estate valuation in Nathia Gali.',
    blueprintData: 'BOOKING DEPOSIT · 36-MONTH PLAN',
  },
  {
    id: 'construction',
    number: '03',
    tag: 'DEVELOPMENT',
    title: 'Construction progresses.',
    highlight: '36-Month Milestone Execution',
    description:
      'Track precision structural milestones built by DM Consortium using weather-resistant alpine stone and thermal glass.',
    blueprintData: 'DM CONSORTIUM · MILESTONE STAGE 03',
  },
  {
    id: 'completion',
    number: '04',
    tag: 'HANDOVER',
    title: 'Property is completed.',
    highlight: 'Freehold Title Deed · PKR 0 Maintenance',
    description:
      'Receive full ownership rights with 100% freehold title deed and zero ongoing owner maintenance fees.',
    blueprintData: 'FREEHOLD TITLE DEED · PKR 0 FEES',
  },
  {
    id: 'management',
    number: '05',
    tag: 'HOSPITALITY',
    title: 'Rental management begins.',
    highlight: '5-Star Resort Operations',
    description:
      'DM Consortium handles guest reservations, housekeeping, suite maintenance, and 24-hour executive concierge.',
    blueprintData: 'DM HOSPITALITY · 5-STAR OPERATION',
  },
  {
    id: 'yield',
    number: '06',
    tag: 'RETURNS',
    title: 'Monthly income starts.',
    highlight: '13–15% Projected Annual ROI',
    description:
      'Receive automated quarterly rental yield distributions paired with long-term capital appreciation.',
    blueprintData: 'NET ANNUAL YIELD · 13–15% ROI',
  },
]

function StageBlueprint01() {
  return (
    <svg className={styles.diagramCanvas} viewBox="0 0 320 220" fill="none" aria-hidden="true">
      <rect x="20" y="20" width="280" height="180" rx="4" stroke="rgba(206, 162, 92, 0.4)" strokeWidth="1" strokeDasharray="4 4" />
      <rect x="40" y="40" width="140" height="140" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
      <rect x="180" y="40" width="100" height="80" stroke="rgba(244, 239, 228, 0.5)" strokeWidth="1.2" />
      <rect x="180" y="120" width="100" height="60" stroke="rgba(244, 239, 228, 0.4)" strokeWidth="1" />
      <circle cx="110" cy="110" r="30" stroke="rgba(206, 162, 92, 0.6)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="40" y1="110" x2="180" y2="110" stroke="rgba(206, 162, 92, 0.3)" strokeWidth="1" />
      <line x1="110" y1="40" x2="110" y2="180" stroke="rgba(206, 162, 92, 0.3)" strokeWidth="1" />
      <text x="50" y="58" fill="var(--color-accent-gold)" fontSize="10" fontFamily="sans-serif" fontWeight="600">SUITE TYPE A1</text>
      <text x="50" y="170" fill="rgba(244, 239, 228, 0.6)" fontSize="9" fontFamily="sans-serif">1,250 SQ FT</text>
      <text x="190" y="60" fill="rgba(244, 239, 228, 0.6)" fontSize="9" fontFamily="sans-serif">BALCONY 180°</text>
    </svg>
  )
}

function StageBlueprint02() {
  return (
    <svg className={styles.diagramCanvas} viewBox="0 0 320 220" fill="none" aria-hidden="true">
      <path d="M 30 160 Q 100 40, 160 110 T 290 60" stroke="var(--color-accent-gold)" strokeWidth="2" fill="none" />
      <circle cx="30" cy="160" r="6" fill="#080f0c" stroke="var(--color-accent-gold)" strokeWidth="2" />
      <circle cx="160" cy="110" r="6" fill="#080f0c" stroke="var(--color-accent-gold)" strokeWidth="2" />
      <circle cx="290" cy="60" r="6" fill="var(--color-accent-gold)" />
      <line x1="30" y1="180" x2="290" y2="180" stroke="rgba(244, 239, 228, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
      <text x="25" y="195" fill="rgba(206, 162, 92, 0.8)" fontSize="9" fontFamily="sans-serif">30% BOOKING</text>
      <text x="135" y="195" fill="rgba(244, 239, 228, 0.6)" fontSize="9" fontFamily="sans-serif">36 MONTHS</text>
      <text x="250" y="195" fill="var(--color-accent-gold)" fontSize="9" fontFamily="sans-serif">HANDOVER</text>
    </svg>
  )
}

function StageBlueprint03() {
  return (
    <svg className={styles.diagramCanvas} viewBox="0 0 320 220" fill="none" aria-hidden="true">
      <line x1="60" y1="190" x2="260" y2="190" stroke="rgba(244, 239, 228, 0.4)" strokeWidth="1.5" />
      <line x1="100" y1="190" x2="100" y2="30" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
      <line x1="220" y1="190" x2="220" y2="30" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
      <line x1="100" y1="30" x2="220" y2="30" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
      <line x1="100" y1="70" x2="220" y2="70" stroke="rgba(206, 162, 92, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="100" y1="110" x2="220" y2="110" stroke="rgba(206, 162, 92, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="100" y1="150" x2="220" y2="150" stroke="rgba(206, 162, 92, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="100" y1="190" x2="220" y2="30" stroke="rgba(244, 239, 228, 0.2)" strokeWidth="1" />
      <line x1="220" y1="190" x2="100" y2="30" stroke="rgba(244, 239, 228, 0.2)" strokeWidth="1" />
      <text x="230" y="35" fill="var(--color-accent-gold)" fontSize="9" fontFamily="sans-serif">+78.5M</text>
      <text x="230" y="190" fill="rgba(244, 239, 228, 0.6)" fontSize="9" fontFamily="sans-serif">0.0M BASE</text>
    </svg>
  )
}

function StageBlueprint04() {
  return (
    <svg className={styles.diagramCanvas} viewBox="0 0 320 220" fill="none" aria-hidden="true">
      <rect x="50" y="30" width="220" height="160" rx="2" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
      <rect x="60" y="40" width="200" height="140" stroke="rgba(244, 239, 228, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="160" cy="110" r="32" stroke="var(--color-accent-gold)" strokeWidth="1.2" />
      <circle cx="160" cy="110" r="26" stroke="rgba(206, 162, 92, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
      <text x="128" y="114" fill="var(--color-accent-gold)" fontSize="10" fontFamily="sans-serif" fontWeight="700">FREEHOLD</text>
      <text x="75" y="60" fill="rgba(244, 239, 228, 0.7)" fontSize="9" fontFamily="sans-serif">TITLE DEED #NG-2026</text>
      <text x="75" y="165" fill="rgba(206, 162, 92, 0.8)" fontSize="8" fontFamily="sans-serif">ZERO MAINTENANCE GUARANTEE</text>
    </svg>
  )
}

function StageBlueprint05() {
  return (
    <svg className={styles.diagramCanvas} viewBox="0 0 320 220" fill="none" aria-hidden="true">
      <circle cx="160" cy="110" r="70" stroke="rgba(206, 162, 92, 0.3)" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="160" cy="110" r="45" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
      <circle cx="160" cy="40" r="8" fill="#080f0c" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
      <circle cx="230" cy="110" r="8" fill="#080f0c" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
      <circle cx="160" cy="180" r="8" fill="#080f0c" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
      <circle cx="90" cy="110" r="8" fill="#080f0c" stroke="var(--color-accent-gold)" strokeWidth="1.5" />
      <text x="145" y="43" fill="var(--color-accent-gold)" fontSize="8" fontFamily="sans-serif" textAnchor="end">BOOKING</text>
      <text x="245" y="113" fill="var(--color-accent-gold)" fontSize="8" fontFamily="sans-serif">SERVICE</text>
      <text x="145" y="183" fill="var(--color-accent-gold)" fontSize="8" fontFamily="sans-serif" textAnchor="end">YIELD</text>
      <text x="75" y="113" fill="var(--color-accent-gold)" fontSize="8" fontFamily="sans-serif" textAnchor="end">GUEST</text>
      <text x="132" y="114" fill="rgba(244, 239, 228, 0.8)" fontSize="9" fontFamily="sans-serif" fontWeight="600">DM CONSORTIUM</text>
    </svg>
  )
}

function StageBlueprint06() {
  return (
    <svg className={styles.diagramCanvas} viewBox="0 0 320 220" fill="none" aria-hidden="true">
      <line x1="40" y1="180" x2="280" y2="180" stroke="rgba(244, 239, 228, 0.3)" strokeWidth="1" />
      <line x1="40" y1="40" x2="40" y2="180" stroke="rgba(244, 239, 228, 0.3)" strokeWidth="1" />
      <path d="M 40 160 Q 120 140, 180 80 T 280 40" stroke="var(--color-accent-gold)" strokeWidth="2.5" fill="none" />
      <circle cx="280" cy="40" r="5" fill="var(--color-accent-gold)" />
      <line x1="40" y1="100" x2="280" y2="100" stroke="rgba(206, 162, 92, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
      <text x="50" y="95" fill="rgba(206, 162, 92, 0.8)" fontSize="9" fontFamily="sans-serif">13–15% ROI TARGET</text>
      <text x="210" y="35" fill="var(--color-accent-gold)" fontSize="9" fontFamily="sans-serif" fontWeight="700">YIELD PEAK</text>
    </svg>
  )
}

const STAGE_BLUEPRINTS = [
  { component: <StageBlueprint01 />, label: 'CAD SPEC · FLOORPLAN ELEVATION' },
  { component: <StageBlueprint02 />, label: 'FINANCIAL FLOW · 36-MONTH PLAN' },
  { component: <StageBlueprint03 />, label: 'STRUCTURAL SPEC · TOWER HEIGHT' },
  { component: <StageBlueprint04 />, label: 'OWNERSHIP TITLE · CERTIFICATE' },
  { component: <StageBlueprint05 />, label: 'HOSPITALITY MATRIX · 5-STAR' },
  { component: <StageBlueprint06 />, label: 'ROI CURVE · ANNUAL DISTRIBUTIONS' },
]

export default function SectionSeven() {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<SVGPathElement>(null)
  const stagesRef = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      // SVG Blueprint Connecting Line Drawing
      const line = lineRef.current
      if (line) {
        const lineLen = line.getTotalLength()
        gsap.set(line, {
          strokeDasharray: lineLen,
          strokeDashoffset: lineLen,
        })

        gsap.to(line, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 40%',
            end: 'bottom 80%',
            scrub: true,
          },
        })
      }

      // Viewport stage scroll reveals
      stagesRef.current.forEach((stage) => {
        if (!stage) return
        const num = stage.querySelector(`.${styles.giantNumber}`)
        const text = stage.querySelector(`.${styles.textWrap}`)
        const diagram = stage.querySelector(`.${styles.diagramColumn}`)

        if (num) {
          gsap.fromTo(
            num,
            { opacity: 0.15, scale: 0.9, y: 50 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 1.0,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: stage,
                start: 'top 70%',
                toggleActions: 'play none none reverse',
              },
            },
          )
        }

        if (diagram) {
          gsap.fromTo(
            diagram,
            { opacity: 0, scale: 0.94, y: 35 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: stage,
                start: 'top 68%',
                toggleActions: 'play none none reverse',
              },
            },
          )
        }

        if (text) {
          gsap.fromTo(
            text,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: stage,
                start: 'top 65%',
                toggleActions: 'play none none reverse',
              },
            },
          )
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="investment" className={styles.section}>
      <div className={styles.blueprintBgGrid} aria-hidden="true" />

      {/* Section Header */}
      <div className={`container ${styles.header}`}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowNum}>07</span>
          <span className={styles.eyebrowDivider}>/</span>
          <span>THE INVESTMENT PROCESS</span>
        </p>
        <h2 className={styles.headerTitle}>
          Your path to alpine asset ownership.
        </h2>
      </div>

      {/* Full-Viewport Timeline Journey Container */}
      <div className={styles.journeyContainer}>
        {/* Animated Blueprint Canvas Vector Line */}
        <svg className={styles.svgCanvas} viewBox="0 0 1000 3000" preserveAspectRatio="none" aria-hidden="true">
          <path
            ref={lineRef}
            d="M 500,50 C 300,500 320,1000 500,1500 C 680,2000 660,2500 500,2950"
            className={styles.svgPath}
          />
        </svg>

        {/* Viewport Stages */}
        <div className={styles.stagesViewportList}>
          {INVESTMENT_STAGES.map((item, idx) => {
            const blueprint = STAGE_BLUEPRINTS[idx]
            return (
              <div
                key={item.id}
                ref={(el) => { stagesRef.current[idx] = el }}
                className={styles.stageViewport}
              >
                <div className={`container ${styles.stageInner}`}>
                  {/* Giant Number */}
                  <div className={styles.numberColumn}>
                    <span className={styles.giantNumber}>{item.number}</span>
                    <span className={styles.blueprintCallout}>{item.blueprintData}</span>
                  </div>

                  {/* Architectural Blueprint Diagram (Enriched Whitespace) */}
                  <div className={styles.diagramColumn}>
                    {blueprint?.component}
                    <div className={styles.diagramLabelRow}>
                      <span>{blueprint?.label}</span>
                      <span>STAGE 0{idx + 1}</span>
                    </div>
                  </div>

                  {/* Editorial Content */}
                  <div className={styles.textWrap}>
                    <div className={styles.metaRow}>
                      <span className={styles.tagLabel}>{item.tag}</span>
                    </div>

                    <h3 className={styles.stageHeadline}>{item.title}</h3>
                    <div className={styles.highlightBadge}>{item.highlight}</div>
                    <p className={styles.stageDescription}>{item.description}</p>
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

