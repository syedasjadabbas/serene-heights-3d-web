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
          {INVESTMENT_STAGES.map((item, idx) => (
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
          ))}
        </div>
      </div>
    </section>
  )
}
