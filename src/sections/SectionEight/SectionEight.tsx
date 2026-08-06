/**
 * Section: SectionEight (The Seasonal Experience)
 * Assets: src/assets/location/
 */
import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import SectionEightCanvas from './SectionEightCanvas'
import styles from './SectionEight.module.css'

interface SeasonData {
  id: string
  num: string
  label: string
  title: string
  story: string
  stat: string
  imageUrl: string
  glowGradient: string
  imgFilter: string
  borderTop: string
}

const SEASONS: SeasonData[] = [
  {
    id: 'winter',
    num: '01',
    label: 'WINTER',
    title: 'Snowfall & Fireside Retreats.',
    story:
      'Snow-draped pine forests, private fireside dining, and heated indoor infinity pools 7,906 feet above the valley.',
    stat: 'PEAK SKI & HEATED FIRESIDE SANCTUARY',
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
    glowGradient:
      'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(220, 238, 245, 0.14) 0%, rgba(10, 17, 13, 0.58) 85%)',
    imgFilter: 'brightness(0.96) contrast(1.02) saturate(0.92)',
    borderTop: 'rgba(220, 238, 245, 0.40)',
  },
  {
    id: 'spring',
    num: '02',
    label: 'SPRING',
    title: 'Pine Bloom & Alpine Wellness.',
    story:
      'Crisp mountain air, blossoming forest trails, and holistic spa treatments designed for physical renewal.',
    stat: 'ALPINE SPA & FOREST RENEWAL',
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop',
    glowGradient:
      'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(122, 168, 133, 0.16) 0%, rgba(10, 17, 13, 0.58) 85%)',
    imgFilter: 'brightness(1.02) contrast(1.04) saturate(1.05)',
    borderTop: 'rgba(122, 168, 133, 0.40)',
  },
  {
    id: 'summer',
    num: '03',
    label: 'SUMMER',
    title: 'The Cool Mountain Escape.',
    story:
      'Escape the 42°C city heat for 22°C alpine breezes, infinity pool leisure, and exclusive family vacations.',
    stat: '22°C ALPINE REFUGE · 100% SUMMER OCCUPANCY',
    imageUrl:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop',
    glowGradient:
      'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(243, 212, 152, 0.18) 0%, rgba(10, 17, 13, 0.58) 85%)',
    imgFilter: 'brightness(1.08) contrast(1.06) saturate(1.10)',
    borderTop: 'rgba(243, 212, 152, 0.50)',
  },
  {
    id: 'autumn',
    num: '04',
    label: 'AUTUMN',
    title: 'Golden Canopy & Private Solitude.',
    story:
      'Golden foliage across the Galyat range, executive retreats, and peaceful mountain solitude.',
    stat: 'GOLDEN RIDGE & PRIVATE EXECUTIVE SOLITUDE',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop',
    glowGradient:
      'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(216, 138, 66, 0.16) 0%, rgba(10, 17, 13, 0.58) 85%)',
    imgFilter: 'brightness(1.00) contrast(1.04) saturate(1.08)',
    borderTop: 'rgba(216, 138, 66, 0.45)',
  },
]

// Preload season imagery eagerly to eliminate any asset loading delay
SEASONS.forEach((s) => {
  if (typeof window !== 'undefined') {
    const img = new Image()
    img.src = s.imageUrl
  }
})

export default function SectionEight() {
  const sectionRef = useRef<HTMLElement>(null)
  const ambientGlowRef = useRef<HTMLDivElement>(null)
  const sunbeamRef = useRef<HTMLDivElement>(null)
  const frostHazeRef = useRef<HTMLDivElement>(null)
  const stageFrameRef = useRef<HTMLDivElement>(null)
  const scenesRef = useRef<(HTMLDivElement | null)[]>([])
  const navItemsRef = useRef<(HTMLButtonElement | null)[]>([])
  const indicatorRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)
  const metricValRefs = useRef<(HTMLDivElement | null)[]>([])
  const metricsAnimatedRef = useRef(false)

  const rectCacheRef = useRef<Map<HTMLDivElement, DOMRect>>(new Map())
  const rafIdRef = useRef<number | null>(null)

  const [activeSeason, setActiveSeason] = useState(0)
  const activeSeasonRef = useRef(-1)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      if (!sectionRef.current) return

      const updateSeasonProgress = (progress: number) => {
        const numSeasons = 4
        const stepWindow = 1 / numSeasons

        SEASONS.forEach((seasonData, idx) => {
          let focus = 0

          if (idx === 0) {
            if (progress <= 0.20) {
              focus = 1.0
            } else if (progress < 0.25) {
              focus = (0.25 - progress) / 0.05
            } else {
              focus = 0
            }
          } else {
            const stepStart = idx * stepWindow
            const relProgress = (progress - stepStart) / stepWindow
            if (relProgress >= 0 && relProgress <= 1) {
              if (relProgress < 0.15) {
                focus = relProgress / 0.15
              } else if (relProgress <= 0.85) {
                focus = 1.0
              } else {
                focus = (1.0 - relProgress) / 0.15
              }
            }
          }

          const scene = scenesRef.current[idx]
          if (!scene) return

          const img = scene.querySelector(`.${styles.sceneImage}`) as HTMLElement | null
          const content = scene.querySelector(`.${styles.sceneContent}`) as HTMLElement | null

          if (focus > 0) {
            scene.classList.add(styles.sceneActive)
            gsap.set(scene, { opacity: focus, zIndex: Math.round(1 + focus * 10) })

            if (img) {
              gsap.set(img, {
                scale: 1.04 - 0.04 * focus,
                filter: seasonData.imgFilter,
              })
            }

            if (content) {
              gsap.set(content, { opacity: focus, y: 16 * (1 - focus) })
            }
          } else {
            scene.classList.remove(styles.sceneActive)
            gsap.set(scene, { opacity: 0, zIndex: 1 })
          }
        })

        // Active season index indicator
        const activeIdx = Math.min(3, Math.floor(progress * 3.99))
        if (activeIdx !== activeSeasonRef.current) {
          activeSeasonRef.current = activeIdx
          setActiveSeason(activeIdx)

          if (ambientGlowRef.current) {
            ambientGlowRef.current.style.background = SEASONS[activeIdx].glowGradient
          }

          if (sunbeamRef.current) {
            if (activeIdx === 2) {
              sunbeamRef.current.style.opacity = '0.55'
              sunbeamRef.current.style.background = 'linear-gradient(135deg, rgba(243, 212, 152, 0.15) 0%, transparent 65%)'
            } else if (activeIdx === 3) {
              sunbeamRef.current.style.opacity = '0.40'
              sunbeamRef.current.style.background = 'linear-gradient(135deg, rgba(216, 138, 66, 0.12) 0%, transparent 65%)'
            } else {
              sunbeamRef.current.style.opacity = '0'
            }
          }

          if (frostHazeRef.current) {
            if (activeIdx === 0) {
              frostHazeRef.current.style.opacity = '0.45'
              frostHazeRef.current.style.boxShadow = 'inset 0 0 45px rgba(220, 238, 245, 0.06)'
            } else if (activeIdx === 1) {
              frostHazeRef.current.style.opacity = '0.35'
              frostHazeRef.current.style.boxShadow = 'inset 0 0 45px rgba(122, 168, 133, 0.05)'
            } else {
              frostHazeRef.current.style.opacity = '0'
            }
          }

          if (stageFrameRef.current) {
            const inner = stageFrameRef.current.querySelector(`.${styles.stageInner}`) as HTMLElement | null
            if (inner) {
              inner.style.borderTopColor = SEASONS[activeIdx].borderTop
            }
          }

          const activeNavBtn = navItemsRef.current[activeIdx]
          if (activeNavBtn && indicatorRef.current) {
            indicatorRef.current.style.left = `${activeNavBtn.offsetLeft}px`
            indicatorRef.current.style.width = `${activeNavBtn.offsetWidth}px`
          }

          if (progress >= 0.10 && !metricsAnimatedRef.current) {
            triggerMetricCounters()
          }
        }
      }

      const triggerMetricCounters = () => {
        if (metricsAnimatedRef.current) return
        metricsAnimatedRef.current = true

        const counterConfigs = [
          { end: 7906, format: (val: number) => `${Math.round(val).toLocaleString()} FT` },
          { end: 4, format: (val: number) => (val >= 3.8 ? 'FOUR' : `${Math.round(val)}`) },
          { end: 365, format: (val: number) => `${Math.round(val)} DAYS` },
          { end: 15, format: (val: number) => `13–${Math.round(val)}%` },
        ]

        counterConfigs.forEach((cfg, idx) => {
          const el = metricValRefs.current[idx]
          if (!el) return
          const obj = { val: 0 }
          gsap.to(obj, {
            val: cfg.end,
            duration: 2.2,
            delay: idx * 0.18,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = cfg.format(obj.val)
            },
          })
        })
      }

      // Pre-warm / pre-trigger viewport entry lookahead so effects are ALREADY active when section enters screen
      const entryST = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        onEnter: () => updateSeasonProgress(0),
        onEnterBack: () => updateSeasonProgress(0),
      })

      // Pin Section 8 for continuous unhurried keynote presentation runway
      const mainST = ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: true,
        start: 'top top',
        end: () => `+=${window.innerHeight * 2.8}`,
        invalidateOnRefresh: true,
        onUpdate: (self) => updateSeasonProgress(self.progress),
        onRefresh: (self) => updateSeasonProgress(self.progress),
        onEnter: () => updateSeasonProgress(0),
      })

      // Immediate synchronous initial render on mount
      updateSeasonProgress(0)

      return () => {
        entryST.kill()
        mainST.kill()
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleNavClick = (idx: number) => {
    setActiveSeason(idx)
    const activeNavBtn = navItemsRef.current[idx]
    if (activeNavBtn && indicatorRef.current) {
      indicatorRef.current.style.left = `${activeNavBtn.offsetLeft}px`
      indicatorRef.current.style.width = `${activeNavBtn.offsetWidth}px`
    }
  }

  const handleStageMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const frame = e.currentTarget
    rectCacheRef.current.set(frame, frame.getBoundingClientRect())
  }

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
      frame.style.setProperty('--stage-tilt-x', `${tiltX}deg`)
      frame.style.setProperty('--stage-tilt-y', `${tiltY}deg`)
      frame.style.setProperty('--stage-light-x', `${px * 100}%`)
      frame.style.setProperty('--stage-light-y', `${py * 100}%`)
    })
  }

  const handleStageMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const frame = e.currentTarget
    rectCacheRef.current.delete(frame)
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)

    frame.style.setProperty('--stage-tilt-x', '0deg')
    frame.style.setProperty('--stage-tilt-y', '0deg')
  }

  return (
    <section ref={sectionRef} id="progress" data-alias="seasons" className={styles.section}>
      {/* 3D Seasonal Canvas particles */}
      <SectionEightCanvas activeSeason={activeSeason} />

      {/* Blueprint Grid & Dynamic Ambient Glow */}
      <div className={styles.blueprintBgGrid} aria-hidden="true" />
      <div ref={ambientGlowRef} className={styles.ambientGlow} aria-hidden="true" />
      <div ref={sunbeamRef} className={styles.sunbeamOverlay} aria-hidden="true" />
      <div ref={frostHazeRef} className={styles.frostHazeOverlay} aria-hidden="true" />

      <div className={styles.sectionInner}>
        {/* Section Header */}
        <div className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowNum}>08</span>
            <span className={styles.eyebrowDivider}>/</span>
            <span>THE SEASONAL EXPERIENCE</span>
          </p>
          <h2 className={styles.headerTitle}>A Sanctuary for Every Season.</h2>
        </div>

        {/* Minimalist Editorial Season Selector */}
        <div className={styles.seasonNav} role="tablist">
          {SEASONS.map((s, idx) => (
            <button
              key={s.id}
              ref={(el) => { navItemsRef.current[idx] = el }}
              role="tab"
              aria-selected={activeSeason === idx}
              className={`${styles.seasonNavItem} ${activeSeason === idx ? styles.seasonNavItemActive : ''}`}
              onClick={() => handleNavClick(idx)}
            >
              {s.num} {s.label}
            </button>
          ))}
          <div ref={indicatorRef} className={styles.seasonIndicator} aria-hidden="true" />
        </div>

        {/* Expansive 3D Architectural Viewport Stage */}
        <div
          ref={stageFrameRef}
          className={styles.stageFrame}
          onMouseEnter={handleStageMouseEnter}
          onMouseMove={handleStageMouseMove}
          onMouseLeave={handleStageMouseLeave}
        >
          <div className={styles.stageInner}>
            <div className={styles.cardLight} aria-hidden="true" />

            {SEASONS.map((s, idx) => (
              <div
                key={s.id}
                ref={(el) => { scenesRef.current[idx] = el }}
                className={`${styles.seasonScene} ${activeSeason === idx ? styles.sceneActive : ''}`}
              >
                <img src={s.imageUrl} alt={s.title} className={styles.sceneImage} />
                <div className={styles.sceneOverlay} aria-hidden="true" />
                <div className={styles.sceneContent}>
                  <div className={styles.sceneHeaderTag}>
                    <span>SEASON {s.num}</span>
                    <span className={styles.tagDot}>•</span>
                    <span>NATHIA GALI</span>
                  </div>
                  <h3 className={styles.sceneHeadline}>{s.title}</h3>
                  <p className={styles.sceneStory}>{s.story}</p>
                  <div className={styles.sceneStat}>{s.stat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Grid Strip */}
        <div ref={metricsRef} className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <div ref={(el) => { metricValRefs.current[0] = el }} className={styles.metricVal}>7,906 FT</div>
            <div className={styles.metricLabel}>ELEVATION</div>
          </div>
          <div className={styles.metricItem}>
            <div ref={(el) => { metricValRefs.current[1] = el }} className={styles.metricVal}>FOUR</div>
            <div className={styles.metricLabel}>SEASONS</div>
          </div>
          <div className={styles.metricItem}>
            <div ref={(el) => { metricValRefs.current[2] = el }} className={styles.metricVal}>365 DAYS</div>
            <div className={styles.metricLabel}>YEAR-ROUND APPEAL</div>
          </div>
          <div className={styles.metricItem}>
            <div ref={(el) => { metricValRefs.current[3] = el }} className={styles.metricVal}>13–15%</div>
            <div className={styles.metricLabel}>PROJECTED ROI</div>
          </div>
        </div>
      </div>
    </section>
  )
}
