import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import styles from './SectionSeven.module.css'

interface JourneyStage {
  num: string
  stage: string
  title: string
  metric: string
  description: string
}

const LIFECYCLE_STAGES: JourneyStage[] = [
  {
    num: '01',
    stage: 'SELECTION',
    title: 'Choose Property Unit',
    metric: '150+ SUITES / 50 SQ FT UNITS',
    description: 'Select whole 1, 2, or 3-bedroom hotel residences or fractional 50 sq ft Smart Property Units.',
  },
  {
    num: '02',
    stage: 'BOOKING',
    title: 'Booking Down Payment',
    metric: '30% DEPOSIT',
    description: 'Secure your allotment with a 30% down payment (starting from PKR 675,000 for Smart Units).',
  },
  {
    num: '03',
    stage: 'INSTALLMENTS',
    title: '36-Month Payment Plan',
    metric: '36 MONTHS',
    description: 'Structure remaining balance across 36 monthly installments linked to development milestones.',
  },
  {
    num: '04',
    stage: 'CONSTRUCTION',
    title: 'Milestone Execution',
    metric: 'DM CONSORTIUM',
    description: 'Track precision structural execution built to withstand alpine winter conditions at 7,906 ft.',
  },
  {
    num: '05',
    stage: 'OWNERSHIP',
    title: 'Title Deed & Zero Maintenance',
    metric: 'PKR 0 MAINTENANCE',
    description: 'Receive 100% freehold title deed ownership with zero ongoing owner maintenance fees.',
  },
  {
    num: '06',
    stage: 'HOSPITALITY',
    title: 'Turnkey Suite Operations',
    metric: '5-STAR SERVICE',
    description: 'DM Consortium handles all suite marketing, guest reception, housekeeping, and maintenance.',
  },
  {
    num: '07',
    stage: 'YIELD RETURNS',
    title: '13–15% Annual ROI',
    metric: '13–15% / YR',
    description: 'Enjoy automated quarterly rental yield payouts combined with strong mountain real estate appreciation.',
  },
]

export default function SectionSeven() {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const stagesRef = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      // Timeline vertical progress line draw
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 40%',
              end: 'bottom 70%',
              scrub: true,
            },
          },
        )
      }

      // Stages active highlight triggers
      stagesRef.current.forEach((stage) => {
        if (!stage) return
        const card = stage.querySelector(`.${styles.stageCard}`)
        const dot = stage.querySelector(`.${styles.stageDot}`)

        gsap.fromTo(
          card,
          { opacity: 0.2, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: stage,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
              onEnter: () => {
                stage.setAttribute('data-active', 'true')
                if (dot) gsap.to(dot, { scale: 1.4, duration: 0.3 })
              },
              onLeaveBack: () => {
                stage.removeAttribute('data-active')
                if (dot) gsap.to(dot, { scale: 1.0, duration: 0.3 })
              },
            },
          },
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="investment" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        {/* Section Header */}
        <div className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowNum}>07</span>
            <span className={styles.eyebrowDivider}>/</span>
            <span>INVESTMENT JOURNEY</span>
          </p>
          <h2 className={styles.headline}>
            A structured path to alpine asset ownership.
          </h2>
        </div>

        {/* Lifecycle Timeline Container */}
        <div className={styles.timelineWrap}>
          {/* Animated Vertical Line */}
          <div className={styles.lineTrack}>
            <div ref={lineRef} className={styles.lineActive} />
          </div>

          {/* Timeline Stages List */}
          <div className={styles.stagesList}>
            {LIFECYCLE_STAGES.map((item, idx) => (
              <div
                key={item.num}
                ref={(el) => { stagesRef.current[idx] = el }}
                className={styles.stageRow}
              >
                {/* Center Node Dot */}
                <div className={styles.stageDotWrap}>
                  <div className={styles.stageDot} />
                </div>

                {/* Stage Card */}
                <div className={styles.stageCard}>
                  <div className={styles.stageMeta}>
                    <span className={styles.stageNum}>{item.num}</span>
                    <span className={styles.stageTag}>{item.stage}</span>
                    <span className={styles.stageMetric}>{item.metric}</span>
                  </div>
                  <h3 className={styles.stageTitle}>{item.title}</h3>
                  <p className={styles.stageDesc}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

