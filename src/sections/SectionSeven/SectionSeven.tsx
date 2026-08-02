import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import SectionSevenCanvas from './SectionSevenCanvas'
import styles from './SectionSeven.module.css'

interface InvestmentStage {
  id: string
  number: string
  tag: string
  title: string
  description: string
  stat: string
  imageUrl: string
}

const INVESTMENT_STAGES: InvestmentStage[] = [
  {
    id: 'selection',
    number: '01',
    tag: 'SELECTION',
    title: 'Choose your alpine residence.',
    description:
      'Select from 150+ hotel apartments or fractional Smart Property Units engineered for flexible luxury living.',
    stat: '150+ HOTEL APARTMENTS',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'reservation',
    number: '02',
    tag: 'RESERVATION',
    title: 'Reserve your unit with confidence.',
    description:
      'Secure your allotment with an initial deposit and lock in early prime real estate valuation in Nathia Gali.',
    stat: '30% INITIAL DOWN PAYMENT',
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'development',
    number: '03',
    tag: 'DEVELOPMENT',
    title: 'Precision structural execution.',
    description:
      'Track 36-month construction milestones built by DM Consortium using weather-resistant alpine stone.',
    stat: '36-MONTH MILESTONE PLAN',
    imageUrl:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'handover',
    number: '04',
    tag: 'HANDOVER',
    title: '100% Freehold ownership.',
    description:
      'Receive full legal title deed with zero ongoing owner maintenance fees guaranteed for life.',
    stat: 'FREEHOLD TITLE · PKR 0 FEES',
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'hospitality',
    number: '05',
    tag: 'HOSPITALITY',
    title: 'Turnkey 5-star resort management.',
    description:
      'DM Consortium handles guest reservations, housekeeping, private chef dining, and 24-hour valet.',
    stat: '5-STAR HOTEL OPERATIONS',
    imageUrl:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'returns',
    number: '06',
    tag: 'RETURNS',
    title: 'Automated passive rental yield.',
    description:
      'Receive automated quarterly rental distributions paired with long-term capital appreciation.',
    stat: '13–15% PROJECTED ANNUAL ROI',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop',
  },
]

export default function SectionSeven() {
  const sectionRef = useRef<HTMLElement>(null)
  const scenesRef = useRef<(HTMLDivElement | null)[]>([])
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const dotsRef = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      if (!sectionRef.current) return

      const updateStep = (progress: number) => {
        // Calculate active step index from 0 to 5 based on scroll progress
        const rawStep = Math.floor(progress * 6)
        const activeIdx = Math.min(5, Math.max(0, rawStep))

        // Cross-fade left visual scenes
        scenesRef.current.forEach((scene, idx) => {
          if (!scene) return
          if (idx === activeIdx) {
            scene.classList.add(styles.sceneActive)
          } else {
            scene.classList.remove(styles.sceneActive)
          }
        })

        // Fade & translate right editorial cards
        cardsRef.current.forEach((card, idx) => {
          if (!card) return
          if (idx === activeIdx) {
            card.classList.add(styles.cardActive)
          } else {
            card.classList.remove(styles.cardActive)
          }
        })

        // Progress dots
        dotsRef.current.forEach((dot, idx) => {
          if (!dot) return
          if (idx === activeIdx) {
            dot.classList.add(styles.dotActive)
          } else {
            dot.classList.remove(styles.dotActive)
          }
        })
      }

      // Pin section and scrub step progress
      gsap.to(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${window.innerHeight * 3.5}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => updateStep(self.progress),
          onRefresh: (self) => updateStep(self.progress),
        },
      })

      // Initial state
      updateStep(0)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="investment" className={styles.section}>
      {/* 3D Blueprint Canvas Stage */}
      <SectionSevenCanvas />

      {/* Blueprint Grid & Ambient Background */}
      <div className={styles.blueprintBgGrid} aria-hidden="true" />
      <div className={styles.ambientGradient} aria-hidden="true" />

      {/* Section Header */}
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowNum}>07</span>
          <span className={styles.eyebrowDivider}>/</span>
          <span>THE INVESTMENT PROCESS</span>
        </p>
        <h2 className={styles.headerTitle}>Your path to alpine asset ownership.</h2>
      </div>

      {/* Pinned Dual-Pane Main Stage */}
      <div className={styles.stageContainer}>
        {/* Left Pane: Continuous Cinematic Visual Scenes */}
        <div className={styles.visualStageFrame}>
          {INVESTMENT_STAGES.map((item, idx) => (
            <div
              key={item.id}
              ref={(el) => { scenesRef.current[idx] = el }}
              className={`${styles.visualScene} ${idx === 0 ? styles.sceneActive : ''}`}
            >
              <img src={item.imageUrl} alt={item.title} className={styles.sceneImage} />
              <div className={styles.sceneOverlay} aria-hidden="true" />
              <span className={styles.sceneWatermark}>{item.stat}</span>
            </div>
          ))}
        </div>

        {/* Right Pane: Clean Editorial Step Cards */}
        <div className={styles.editorialStage}>
          {INVESTMENT_STAGES.map((item, idx) => (
            <div
              key={item.id}
              ref={(el) => { cardsRef.current[idx] = el }}
              className={`${styles.editorialCard} ${idx === 0 ? styles.cardActive : ''}`}
            >
              <div className={styles.stepHeader}>
                <span className={styles.giantNumber}>{item.number}</span>
                <span className={styles.tagLabel}>{item.tag}</span>
              </div>

              <h3 className={styles.stageHeadline}>{item.title}</h3>
              <p className={styles.stageDescription}>{item.description}</p>
              <div className={styles.statCallout}>{item.stat}</div>
            </div>
          ))}

          {/* Progress Step Indicator Dots */}
          <div className={styles.stepProgressDots} aria-hidden="true">
            {INVESTMENT_STAGES.map((item, idx) => (
              <div
                key={item.id}
                ref={(el) => { dotsRef.current[idx] = el }}
                className={`${styles.dot} ${idx === 0 ? styles.dotActive : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
