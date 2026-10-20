/**
 * Section: SectionSeven (The Investment Process)
 * 3D Spatial Deck Flipping & Double-Sided Interactive Cards
 */
import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { scrollToTarget } from '../../motion/lenis'
const SectionSevenCanvas = lazy(() => import('./SectionSevenCanvas'))
import apartmentLivingRoomImg from '../../assets/gallery/apartment-living-room.webp'
import apartmentLoungeImg from '../../assets/gallery/apartment-lounge.webp'
import resortExteriorSnowNightImg from '../../assets/gallery/resort-exterior-snow-night.webp'
import resortExteriorDayImg from '../../assets/gallery/resort-exterior-day.webp'
import conciergeDeskImg from '../../assets/gallery/concierge-desk.webp'
import mountainRangeImg from '../../assets/gallery/mountain-range.webp'
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
      'Select from 150+ fully furnished hotel apartments or co-owned Smart Property Units of 50 sq ft each.',
    stat: '150+ HOTEL APARTMENTS',
    imageUrl:
      apartmentLivingRoomImg,
    specs: [
      { label: 'Unit Inventory', value: '150+ Hotel Apartments' },
      { label: 'Smart Property Unit', value: '50 sq ft Co-Ownership' },
      { label: 'Elevation', value: '7,906 ft Altitude' },
      { label: 'Layouts', value: '1, 2 & 3 Bedrooms' },
    ],
  },
  {
    id: 'reservation',
    number: '02',
    tag: 'RESERVATION',
    title: 'Reserve your unit with confidence.',
    description:
      'Secure your unit with a 30% booking, with the balance spread across 36 monthly installments.',
    stat: '30% INITIAL DOWN PAYMENT',
    imageUrl:
      apartmentLoungeImg,
    specs: [
      { label: 'Initial Deposit', value: '30% Down Payment' },
      { label: 'Installments', value: '36 Monthly' },
      { label: 'Apartment Rate', value: 'PKR 40,000 / sq ft' },
      { label: 'SPU Down Payment', value: 'PKR 675,000' },
    ],
  },
  {
    id: 'development',
    number: '03',
    tag: 'DEVELOPMENT',
    title: 'Precision structural execution.',
    description:
      'Follow construction through published progress updates, backed by DM Consortium and its 15+ completed projects.',
    stat: 'PROGRESS UPDATES · 2024–2026',
    imageUrl:
      resortExteriorSnowNightImg,
    specs: [
      { label: 'Latest Update', value: 'April 2026' },
      { label: 'Backed By', value: 'DM Consortium' },
      { label: 'Track Record', value: '15+ Completed Projects' },
      { label: 'First Update', value: 'July 2024' },
    ],
  },
  {
    id: 'handover',
    number: '04',
    tag: 'HANDOVER',
    title: 'Ownership, protected and transferable.',
    description:
      'Smart Property ownership is protected by legal agreements, and apartment owners pay zero maintenance fees.',
    stat: 'LEGAL AGREEMENTS · ZERO FEES',
    imageUrl:
      resortExteriorDayImg,
    specs: [
      { label: 'Ownership', value: 'Protected by Legal Agreements' },
      { label: 'Maintenance Fees', value: 'Zero for Owners' },
      { label: 'Transferability', value: 'Sell or Transfer Anytime' },
      { label: 'Family Stays', value: 'Extended-Stay Discount' },
    ],
  },
  {
    id: 'hospitality',
    number: '05',
    tag: 'HOSPITALITY',
    title: 'Turnkey resort management.',
    description:
      'Managed by DM Consortium — rentals, maintenance and returns — with a 24/7 front desk and concierge.',
    stat: 'MANAGED BY DM CONSORTIUM',
    imageUrl:
      conciergeDeskImg,
    specs: [
      { label: 'Management', value: 'DM Consortium' },
      { label: 'Front Desk', value: '24/7 Concierge' },
      { label: 'Owner Stays', value: '28 Free Nights / Year' },
      { label: 'Dining', value: 'Rooftop Restaurant' },
    ],
  },
  {
    id: 'returns',
    number: '06',
    tag: 'RETURNS',
    title: 'Passive rental yield.',
    description:
      'Receive quarterly profit distributions from hotel revenue streams, alongside annual capital appreciation.',
    stat: '13–15% SMART PROPERTY UNIT ROI',
    imageUrl:
      mountainRangeImg,
    specs: [
      { label: 'SPU ROI', value: '13% – 15%' },
      { label: 'Profit Distribution', value: 'Quarterly' },
      { label: 'Apartment Appreciation', value: '5% – 8% Annually' },
      { label: 'Apartment Rental Income', value: 'PKR 80K–120K / Month' },
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
    const section = sectionRef.current
    if (!section) return

    registerScrollTrigger()
    const mm = gsap.matchMedia(section)

    // Pinned 3D deck scrub only on desktop with motion allowed (same 900px
    // breakpoint the CSS uses). Mobile and reduced motion fall back to the
    // static stacked layout defined at the end of SectionSeven.module.css.
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      // Cached once — the per-frame onUpdate path never queries the DOM.
      const scenes = scenesRef.current.filter((el): el is HTMLDivElement => el !== null)
      const cards = cardsRef.current.filter((el): el is HTMLDivElement => el !== null)
      const sceneImages = scenesRef.current.map(
        (scene) => scene?.querySelector<HTMLElement>(`.${styles.sceneImage}`) ?? null
      )
      const headerEl = section.querySelector<HTMLElement>(`.${styles.header}`)
      const stageEl = section.querySelector<HTMLElement>(`.${styles.stageContainer}`)

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

          const img = sceneImages[idx]

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
            dot.setAttribute('aria-current', 'step')
          } else {
            dot.classList.remove(styles.dotActive)
            dot.removeAttribute('aria-current')
          }
        })
      }

      // Pin section and scrub step progress unhurriedly (5.4x viewport height runway)
      const st = gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: true,
          start: 'top top',
          end: () => `+=${window.innerHeight * 5.4}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            updateStep(self.progress)

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

      // Per-frame gsap.set() calls run outside the matchMedia context, so they
      // aren't auto-reverted — clear them when leaving the desktop/motion query
      // so the static layout starts from its CSS defaults.
      return () => {
        scrollTriggerRef.current = null
        gsap.set(scenes, { clearProps: 'opacity,transform,zIndex' })
        gsap.set(cards, { clearProps: 'opacity,transform,pointerEvents,zIndex' })
        gsap.set(sceneImages.filter((img): img is HTMLElement => img !== null), { clearProps: 'filter' })
        gsap.set([headerEl, stageEl].filter((el): el is HTMLElement => el !== null), { clearProps: 'opacity' })
      }
    })

    return () => mm.revert()
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
    scrollToTarget(targetY)
  }

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, id: string) => {
    // Ignore keys bubbling up from the inner flip buttons — they handle themselves.
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleFlip(id)
    }
  }

  return (
    <section ref={sectionRef} id="payment-plan" data-alias="investment" className={styles.section}>
      {/* 3D Canvas Background */}
      <Suspense fallback={null}>
        <SectionSevenCanvas />
      </Suspense>

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
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className={styles.sceneImage}
                  loading="lazy"
                  decoding="async"
                />
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
                onKeyDown={(e) => handleCardKeyDown(e, item.id)}
                role="button"
                tabIndex={0}
                aria-pressed={isFlipped}
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
                          tabIndex={isFlipped ? -1 : 0}
                        >
                          <span>SPECS</span>
                          <svg className={styles.flipIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
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
                          tabIndex={isFlipped ? 0 : -1}
                        >
                          <span>FRONT</span>
                          <svg className={styles.flipIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
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
                      <span className={styles.backBadge}>MANAGED BY DM CONSORTIUM</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Progress Step Indicator Dots */}
          <div className={styles.stepProgressDots}>
            {INVESTMENT_STAGES.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                ref={(el) => { dotsRef.current[idx] = el }}
                className={`${styles.dot} ${idx === 0 ? styles.dotActive : ''}`}
                onClick={() => handleDotClick(idx)}
                aria-label={`Go to step ${idx + 1}`}
                aria-current={idx === 0 ? 'step' : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
