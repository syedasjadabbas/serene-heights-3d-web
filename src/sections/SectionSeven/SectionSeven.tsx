/**
 * Section: SectionSeven (The Investment Process)
 * 3D Spatial Deck Flipping & Double-Sided Interactive Cards
 */
import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import SectionSevenCanvas from './SectionSevenCanvas'
import styles from './SectionSeven.module.css'

interface SpecItem {
  label: string
  value: string
}

interface InvestmentStage {
  id: string
  number: string
  tag: string
  title: string
  description: string
  stat: string
  imageUrl: string
  specs: SpecItem[]
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
    specs: [
      { label: 'Unit Inventory', value: '150+ Luxury Suites' },
      { label: 'Fractional Units', value: 'Available from 1/8th' },
      { label: 'Elevation', value: '7,400 ft Altitude View' },
      { label: 'Architectural Style', value: 'Alpine Modern Stone' },
    ],
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
    specs: [
      { label: 'Initial Deposit', value: '30% Down Payment' },
      { label: 'Escrow Account', value: '100% Protected' },
      { label: 'Valuation Guarantee', value: 'Early Lock-in' },
      { label: 'Booking Speed', value: 'Digital Confirmation' },
    ],
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
    specs: [
      { label: 'Timeline', value: '36 Months Phased' },
      { label: 'Developer', value: 'DM Consortium' },
      { label: 'Structural Rating', value: 'Seismic Zone 4' },
      { label: 'Milestone Tracking', value: 'Quarterly Video Audits' },
    ],
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
    specs: [
      { label: 'Title Deed', value: '100% Freehold Rights' },
      { label: 'Owner Fees', value: 'PKR 0 Lifetime Fees' },
      { label: 'Legal Verification', value: 'Tehsil Municipal Registered' },
      { label: 'Transfer Cost', value: 'Zero Hidden Levies' },
    ],
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
    specs: [
      { label: 'Operations', value: '5-Star Resort Brand' },
      { label: 'Services', value: 'Valet, Chef & Housekeeping' },
      { label: 'Owner Stays', value: '30 Free Nights / Year' },
      { label: 'App Management', value: 'Live Booking Dashboard' },
    ],
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
    specs: [
      { label: 'Annual Net ROI', value: '13% - 15% Projected' },
      { label: 'Payout Schedule', value: 'Quarterly Direct Deposit' },
      { label: 'Capital Growth', value: '18% - 22% Est. Appreciation' },
      { label: 'Tax Efficiency', value: 'Real Estate Trust Structure' },
    ],
  },
]

export default function SectionSeven() {
  const sectionRef = useRef<HTMLElement>(null)
  const scenesRef = useRef<(HTMLDivElement | null)[]>([])
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const dotsRef = useRef<(HTMLButtonElement | null)[]>([])

  const [flippedIds, setFlippedIds] = useState<Record<string, boolean>>({})

  const rectCacheRef = useRef<Map<HTMLDivElement, DOMRect>>(new Map())
  const rafIdRef = useRef<number | null>(null)
  const scrollTriggerRef = useRef<gsap.plugins.ScrollTriggerInstance | null>(null)

  const toggleFlip = (id: string) => {
    setFlippedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      if (!sectionRef.current) return

      const updateStep = (progress: number) => {
        const numStages = 6
        const stepWindow = 1 / numStages

        // 3D Scene Image Stage Transitions
        scenesRef.current.forEach((scene, idx) => {
          if (!scene) return
          const stepStart = idx * stepWindow
          const relProgress = (progress - stepStart) / stepWindow

          let flipY = 0
          let flipZ = 0
          let opacity = 0
          let scale = 1.08

          if (relProgress >= 0 && relProgress <= 1) {
            if (relProgress < 0.2) {
              const t = relProgress / 0.2
              flipY = 40 * (1 - t)
              flipZ = -100 * (1 - t)
              opacity = t
              scale = 1.10 - 0.08 * t
            } else if (relProgress <= 0.8) {
              flipY = 0
              flipZ = 0
              opacity = 1
              scale = 1.02
            } else {
              const t = (relProgress - 0.8) / 0.2
              flipY = -40 * t
              flipZ = -100 * t
              opacity = 1 - t
              scale = 1.02 + 0.08 * t
            }
          } else if (relProgress < 0) {
            flipY = 40
            flipZ = -100
            opacity = 0
            scale = 1.10
          } else {
            flipY = -40
            flipZ = -100
            opacity = 0
            scale = 1.10
          }

          const img = scene.querySelector(`.${styles.sceneImage}`) as HTMLElement | null

          gsap.set(scene, {
            opacity,
            transform: `perspective(1200px) rotateY(${flipY}deg) translateZ(${flipZ}px) scale(${scale})`,
            zIndex: Math.round(1 + opacity * 10),
          })

          if (img) {
            gsap.set(img, {
              filter: `brightness(${0.70 + 0.35 * opacity}) contrast(${0.92 + 0.12 * opacity})`,
            })
          }
        })

        // 3D Spatial Deck Cards Transitions
        cardsRef.current.forEach((card, idx) => {
          if (!card) return
          const stepStart = idx * stepWindow
          const relProgress = (progress - stepStart) / stepWindow

          let flipY = 0
          let flipX = 0
          let flipZ = 0
          let translateY = 0
          let opacity = 0
          let scale = 0.88

          if (relProgress >= 0 && relProgress <= 1) {
            if (relProgress < 0.2) {
              const t = relProgress / 0.2
              // Flip in from Y = -80deg, Z = -160px
              flipY = -80 * (1 - t)
              flipX = 18 * (1 - t)
              flipZ = -160 * (1 - t)
              translateY = 36 * (1 - t)
              opacity = t
              scale = 0.88 + 0.12 * t
            } else if (relProgress <= 0.8) {
              // Active
              flipY = 0
              flipX = 0
              flipZ = 0
              translateY = 0
              opacity = 1
              scale = 1.0
            } else {
              const t = (relProgress - 0.8) / 0.2
              // Flip out to Y = 80deg, Z = -160px
              flipY = 80 * t
              flipX = -18 * t
              flipZ = -160 * t
              translateY = -36 * t
              opacity = 1 - t
              scale = 1.0 - 0.12 * t
            }
          } else if (relProgress < 0) {
            flipY = -80
            flipX = 18
            flipZ = -160
            translateY = 36
            opacity = 0
            scale = 0.88
          } else {
            flipY = 80
            flipX = -18
            flipZ = -160
            translateY = -36
            opacity = 0
            scale = 0.88
          }

          gsap.set(card, {
            opacity,
            transform: `perspective(1400px) rotateY(${flipY}deg) rotateX(${flipX}deg) translateZ(${flipZ}px) translateY(${translateY}px) scale(${scale})`,
            pointerEvents: opacity > 0.6 ? 'auto' : 'none',
            zIndex: Math.round(1 + opacity * 10),
          })
        })

        // Active Dot Indicator
        const activeIdx = Math.min(5, Math.floor(progress * 5.99))
        dotsRef.current.forEach((dot, idx) => {
          if (!dot) return
          if (idx === activeIdx) {
            dot.classList.add(styles.dotActive)
          } else {
            dot.classList.remove(styles.dotActive)
          }
        })
      }

      // Pin section and scrub step progress unhurriedly (5.4x viewport height runway)
      const st = gsap.to(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: true,
          start: 'top top',
          end: () => `+=${window.innerHeight * 5.4}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            updateStep(self.progress)
            const headerEl = sectionRef.current?.querySelector(`.${styles.header}`)
            const stageEl = sectionRef.current?.querySelector(`.${styles.stageContainer}`)

            let fade = 1.0
            if (self.progress < 0.04) {
              fade = 0.4 + (self.progress / 0.04) * 0.6
            } else if (self.progress > 0.95) {
              fade = 1.0 - ((self.progress - 0.95) / 0.05) * 0.5
            }

            if (headerEl && stageEl) {
              gsap.set([headerEl, stageEl], { opacity: fade })
            }
          },
          onRefresh: (self) => updateStep(self.progress),
        },
      }).scrollTrigger

      if (st) {
        scrollTriggerRef.current = st
      }

      updateStep(0)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Mouse tilt handlers for right editorial cards
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

    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const tiltX = (0.5 - py) * 16
    const tiltY = (px - 0.5) * 18

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)

    rafIdRef.current = requestAnimationFrame(() => {
      card.style.setProperty('--tilt-x', `${tiltX}deg`)
      card.style.setProperty('--tilt-y', `${tiltY}deg`)
      card.style.setProperty('--light-x', `${px * 100}%`)
      card.style.setProperty('--light-y', `${py * 100}%`)
      card.classList.add(styles.cardHovered)
    })
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    rectCacheRef.current.delete(card)
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)

    card.style.setProperty('--tilt-x', '0deg')
    card.style.setProperty('--tilt-y', '0deg')
    card.classList.remove(styles.cardHovered)
  }

  // Mouse tilt handlers for left visual scene frame
  const handleVisualMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const frame = e.currentTarget
    rectCacheRef.current.set(frame, frame.getBoundingClientRect())
  }

  const handleVisualMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const frame = e.currentTarget
    let rect = rectCacheRef.current.get(frame)
    if (!rect) {
      rect = frame.getBoundingClientRect()
      rectCacheRef.current.set(frame, rect)
    }

    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const tiltX = (0.5 - py) * 14
    const tiltY = (px - 0.5) * 16

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)

    rafIdRef.current = requestAnimationFrame(() => {
      frame.style.setProperty('--img-tilt-x', `${tiltX}deg`)
      frame.style.setProperty('--img-tilt-y', `${tiltY}deg`)
      frame.style.setProperty('--img-light-x', `${px * 100}%`)
      frame.style.setProperty('--img-light-y', `${py * 100}%`)
    })
  }

  const handleVisualMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const frame = e.currentTarget
    rectCacheRef.current.delete(frame)
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)

    frame.style.setProperty('--img-tilt-x', '0deg')
    frame.style.setProperty('--img-tilt-y', '0deg')
  }

  const handleDotClick = (idx: number) => {
    const st = scrollTriggerRef.current
    if (!st) return
    const totalScroll = st.end - st.start
    const targetProgress = (idx + 0.4) / 6
    const targetY = st.start + totalScroll * targetProgress
    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    })
  }

  return (
    <section ref={sectionRef} id="payment-plan" data-alias="investment" className={styles.section}>
      {/* 3D Canvas Background */}
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
        <h2 className={styles.headerTitle}>Your path to <span className={styles.headerAccent}>alpine asset ownership.</span></h2>
      </div>

      {/* Pinned Dual-Pane Main Stage */}
      <div className={styles.stageContainer}>
        {/* Left Pane: Visual Scenes with 3D Depth & Hover Tilt */}
        <div
          className={styles.visualStageFrame}
          onMouseEnter={handleVisualMouseEnter}
          onMouseMove={handleVisualMouseMove}
          onMouseLeave={handleVisualMouseLeave}
        >
          <div className={styles.visualInner}>
            <div className={styles.cardLight} aria-hidden="true" />
            {INVESTMENT_STAGES.map((item, idx) => (
              <div
                key={item.id}
                ref={(el) => { scenesRef.current[idx] = el }}
                className={`${styles.visualScene} ${idx === 0 ? styles.sceneActive : ''}`}
              >
                <img src={item.imageUrl} alt={item.title} className={styles.sceneImage} />
                <div className={styles.sceneOverlay} aria-hidden="true" />
                <div className={styles.sceneWatermark}>
                  STAGE {item.number} / NATHIA GALI
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: 3D Spatial Deck Editorial Cards */}
        <div className={styles.editorialStage}>
          {INVESTMENT_STAGES.map((item, idx) => {
            const isFlipped = !!flippedIds[item.id]

            return (
              <div
                key={item.id}
                ref={(el) => { cardsRef.current[idx] = el }}
                className={styles.editorialCard}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => toggleFlip(item.id)}
              >
                <div className={`${styles.cardInner} ${isFlipped ? styles.isFlipped : ''}`}>
                  {/* FRONT FACE */}
                  <div className={styles.cardFront}>
                    <div className={styles.cardLight} aria-hidden="true" />

                    <div>
                      <div className={styles.stepHeader}>
                        <div className={styles.stepHeaderLeft}>
                          <span className={styles.giantNumber}>{item.number}</span>
                          <span className={styles.tagLabel}>{item.tag}</span>
                        </div>
                        <button
                          type="button"
                          className={styles.flipBtn}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFlip(item.id)
                          }}
                          title="Flip for specifications"
                        >
                          <span>SPECS</span>
                          <svg className={styles.flipIcon} viewBox="0 0 24 24">
                            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                          </svg>
                        </button>
                      </div>

                      <h3 className={styles.stageHeadline}>{item.title}</h3>
                      <p className={styles.stageDescription}>{item.description}</p>
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.statCallout}>{item.stat}</div>
                      <span className={styles.flipHint}>Click card to flip ↺</span>
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div className={styles.cardBack}>
                    <div className={styles.cardLight} aria-hidden="true" />

                    <div>
                      <div className={styles.cardBackHeader}>
                        <span className={styles.backTag}>STAGE {item.number} // SPECS</span>
                        <button
                          type="button"
                          className={styles.flipBtn}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFlip(item.id)
                          }}
                        >
                          <span>FRONT</span>
                          <svg className={styles.flipIcon} viewBox="0 0 24 24">
                            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                          </svg>
                        </button>
                      </div>

                      <h4 className={styles.backTitle}>{item.title}</h4>

                      <div className={styles.specsGrid}>
                        {item.specs.map((spec, sIdx) => (
                          <div key={sIdx} className={styles.specItem}>
                            <span className={styles.specLabel}>{spec.label}</span>
                            <span className={styles.specValue}>{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.backFooter}>
                      <span className={styles.backBadge}>VERIFIED DM CONSORTIUM ASSET</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Progress Step Indicator Dots */}
          <div className={styles.stepProgressDots} aria-hidden="true">
            {INVESTMENT_STAGES.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                ref={(el) => { dotsRef.current[idx] = el }}
                className={`${styles.dot} ${idx === 0 ? styles.dotActive : ''}`}
                onClick={() => handleDotClick(idx)}
                aria-label={`Jump to stage ${item.number}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
