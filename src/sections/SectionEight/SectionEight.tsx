/**
 * Section: SectionEight (The Seasonal Experience)
 * Assets: src/assets/location/
 */
import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import { scrollToTarget } from '../../motion/lenis'
const SectionEightCanvas = lazy(() => import('./SectionEightCanvas'))
import resortExteriorSnowNightImg from '../../assets/gallery/resort-exterior-snow-night.webp'
import mountainRangeImg from '../../assets/gallery/mountain-range.webp'
import infinityPoolForestImg from '../../assets/gallery/infinity-pool-forest.webp'
import pineForestImg from '../../assets/gallery/pine-forest.webp'
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
    title: 'Snowfall & Winter Retreats.',
    story:
      'Snow-draped pine forests, rooftop dining, and a heated infinity pool open year-round at 7,906 feet.',
    stat: "PAKISTAN'S #1 WINTER RESORT",
    imageUrl:
      resortExteriorSnowNightImg,
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
      'Crisp mountain air, forest hiking trails, and sauna, jacuzzi, massage and spa for quiet renewal.',
    stat: 'ALPINE SPA & FOREST RENEWAL',
    imageUrl:
      mountainRangeImg,
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
      'Trade the city heat for cool mountain breezes, zipline and mini golf, and unhurried family stays.',
    stat: 'COOL SUMMERS · 15+ RESORT ACTIVITIES',
    imageUrl:
      infinityPoolForestImg,
    glowGradient:
      'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(243, 212, 152, 0.18) 0%, rgba(10, 17, 13, 0.58) 85%)',
    imgFilter: 'brightness(1.08) contrast(1.06) saturate(1.10)',
    borderTop: 'rgba(243, 212, 152, 0.50)',
  },
  {
    id: 'autumn',
    num: '04',
    label: 'AUTUMN',
    title: 'Misty Pines & Private Solitude.',
    story:
      'Mist drifting through the Galyat pine forest, a business & executive center, and peaceful mountain solitude.',
    stat: 'MISTY PINES & EXECUTIVE CENTER',
    imageUrl:
      pineForestImg,
    glowGradient:
      'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(216, 138, 66, 0.16) 0%, rgba(10, 17, 13, 0.58) 85%)',
    imgFilter: 'brightness(1.00) contrast(1.04) saturate(1.08)',
    borderTop: 'rgba(216, 138, 66, 0.45)',
  },
]

// Metric counters. `from` is what the strip shows before the count-up runs
// (only when motion is allowed); the JSX renders the final values so reduced
// motion / no-JS always shows real numbers.
const COUNTERS = [
  { from: 0, end: 7906, format: (val: number) => `${Math.round(val).toLocaleString()} FT` },
  { from: 0, end: 4, format: (val: number) => (val >= 3.8 ? 'FOUR' : `${Math.round(val)}`) },
  { from: 0, end: 50, format: (val: number) => `${Math.round(val)}+` },
  { from: 13, end: 15, format: (val: number) => `13–${Math.round(val)}%` },
]

// Pin progress a tab click scrolls to: the middle of each season's
// full-focus window in updateSeasonProgress (winter holds focus 0 → 0.20).
const seasonScrollProgress = (idx: number) => (idx === 0 ? 0.1 : (idx + 0.5) / SEASONS.length)

const tabId = (s: SeasonData) => `s8-tab-${s.id}`
const panelId = (s: SeasonData) => `s8-panel-${s.id}`

export default function SectionEight() {
  const sectionRef = useRef<HTMLElement>(null)
  const ambientGlowRef = useRef<HTMLDivElement>(null)
  const sunbeamRef = useRef<HTMLDivElement>(null)
  const frostHazeRef = useRef<HTMLDivElement>(null)
  const stageInnerRef = useRef<HTMLDivElement>(null)
  const scenesRef = useRef<(HTMLDivElement | null)[]>([])
  const navItemsRef = useRef<(HTMLButtonElement | null)[]>([])
  const indicatorRef = useRef<HTMLDivElement>(null)
  const metricValRefs = useRef<(HTMLDivElement | null)[]>([])
  const pinSTRef = useRef<ScrollTrigger | null>(null)

  const rectCacheRef = useRef<Map<HTMLDivElement, DOMRect>>(new Map())
  const rafIdRef = useRef<number | null>(null)

  // Single owner for "which season is active": React state. Scroll only calls
  // setActiveSeason when the index changes; every class, aria attribute and
  // ambient style below derives from it.
  const [activeSeason, setActiveSeason] = useState(0)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      if (!sectionRef.current) return

      let lastActiveIdx = -1

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

          // GSAP owns scene opacity/zIndex; classes are React's (see activeSeason)
          if (focus > 0) {
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
            gsap.set(scene, { opacity: 0, zIndex: 1 })
          }
        })

        // Active season index — state only changes when the index does
        const activeIdx = Math.min(3, Math.floor(progress * 3.99))
        if (activeIdx !== lastActiveIdx) {
          lastActiveIdx = activeIdx
          setActiveSeason(activeIdx)

          if (progress >= 0.10) playMetricCounters()
        }
      }

      // Counter tweens are created paused inside the context so ctx.revert()
      // kills them on unmount; the strip starts at the `from` values.
      let metricsPlayed = false
      const counterTweens = COUNTERS.flatMap((cfg, idx) => {
        const el = metricValRefs.current[idx]
        if (!el) return []
        const obj = { val: cfg.from }
        el.textContent = cfg.format(cfg.from)
        return [
          gsap.to(obj, {
            val: cfg.end,
            duration: 2.2,
            delay: idx * 0.18,
            ease: 'power2.out',
            paused: true,
            onUpdate: () => {
              el.textContent = cfg.format(obj.val)
            },
          }),
        ]
      })

      const playMetricCounters = () => {
        if (metricsPlayed) return
        metricsPlayed = true
        // restart(true) honours each tween's stagger delay
        counterTweens.forEach((tween) => tween.restart(true))
      }

      // Pin Section 8 for continuous unhurried keynote presentation runway.
      // Created first so any later trigger on this section sees its pin spacing.
      const mainST = ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        start: 'top top',
        end: () => `+=${window.innerHeight * 2.8}`,
        invalidateOnRefresh: true,
        onUpdate: (self) => updateSeasonProgress(self.progress),
        onRefresh: (self) => updateSeasonProgress(self.progress),
        onEnter: (self) => updateSeasonProgress(self.progress),
      })
      pinSTRef.current = mainST

      // Viewport-entry lookahead so the scenes are already composed when the
      // section scrolls into view. Always syncs to the pin's real progress —
      // never forces 0 — so re-entering from below can't reset mid-pin.
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        onEnter: () => updateSeasonProgress(mainST.progress),
        onEnterBack: () => updateSeasonProgress(mainST.progress),
      })

      // Immediate synchronous initial render on mount
      updateSeasonProgress(mainST.progress)
    }, sectionRef)

    return () => {
      pinSTRef.current = null
      ctx.revert()
    }
  }, [])

  // Ambient overlays, stage border and tab indicator follow the active season
  useLayoutEffect(() => {
    if (ambientGlowRef.current) {
      ambientGlowRef.current.style.background = SEASONS[activeSeason].glowGradient
    }

    if (sunbeamRef.current) {
      if (activeSeason === 2) {
        sunbeamRef.current.style.opacity = '0.55'
        sunbeamRef.current.style.background = 'linear-gradient(135deg, rgba(243, 212, 152, 0.15) 0%, transparent 65%)'
      } else if (activeSeason === 3) {
        sunbeamRef.current.style.opacity = '0.40'
        sunbeamRef.current.style.background = 'linear-gradient(135deg, rgba(216, 138, 66, 0.12) 0%, transparent 65%)'
      } else {
        sunbeamRef.current.style.opacity = '0'
      }
    }

    if (frostHazeRef.current) {
      if (activeSeason === 0) {
        frostHazeRef.current.style.opacity = '0.45'
        frostHazeRef.current.style.boxShadow = 'inset 0 0 45px rgba(220, 238, 245, 0.06)'
      } else if (activeSeason === 1) {
        frostHazeRef.current.style.opacity = '0.35'
        frostHazeRef.current.style.boxShadow = 'inset 0 0 45px rgba(122, 168, 133, 0.05)'
      } else {
        frostHazeRef.current.style.opacity = '0'
      }
    }

    if (stageInnerRef.current) {
      stageInnerRef.current.style.borderTopColor = SEASONS[activeSeason].borderTop
    }

    const positionIndicator = () => {
      const activeNavBtn = navItemsRef.current[activeSeason]
      if (activeNavBtn && indicatorRef.current) {
        indicatorRef.current.style.left = `${activeNavBtn.offsetLeft}px`
        indicatorRef.current.style.width = `${activeNavBtn.offsetWidth}px`
      }
    }
    positionIndicator()
    window.addEventListener('resize', positionIndicator)
    return () => window.removeEventListener('resize', positionIndicator)
  }, [activeSeason])

  // Cancel any pending stage-tilt frame on unmount
  useEffect(() => () => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
  }, [])

  const handleNavClick = (idx: number) => {
    const st = pinSTRef.current
    if (!st) {
      // Reduced motion: no pin, the tabs switch scenes directly
      setActiveSeason(idx)
      return
    }
    // Scroll owns the active season while pinned — move the scroll position
    // to the season's slot instead of setting state that the next update overwrites.
    scrollToTarget(st.start + (st.end - st.start) * seasonScrollProgress(idx))
  }

  const handleNavKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const count = SEASONS.length
    let next = -1
    if (e.key === 'ArrowRight') next = (idx + 1) % count
    else if (e.key === 'ArrowLeft') next = (idx - 1 + count) % count
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = count - 1
    if (next < 0) return
    e.preventDefault()
    navItemsRef.current[next]?.focus()
    handleNavClick(next)
  }

  const handleStageMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const frame = e.currentTarget
    rectCacheRef.current.set(frame, frame.getBoundingClientRect())
  }

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return
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
      rafIdRef.current = null
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
    rafIdRef.current = null

    frame.style.setProperty('--stage-tilt-x', '0deg')
    frame.style.setProperty('--stage-tilt-y', '0deg')
  }

  return (
    <section ref={sectionRef} id="progress" data-alias="seasons" className={styles.section}>
      {/* 3D Seasonal Canvas particles */}
      <Suspense fallback={null}>
        <SectionEightCanvas activeSeason={activeSeason} />
      </Suspense>

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
        <div className={styles.seasonNav} role="tablist" aria-label="Seasons">
          {SEASONS.map((s, idx) => (
            <button
              key={s.id}
              ref={(el) => { navItemsRef.current[idx] = el }}
              type="button"
              role="tab"
              id={tabId(s)}
              aria-selected={activeSeason === idx}
              aria-controls={panelId(s)}
              tabIndex={activeSeason === idx ? 0 : -1}
              className={`${styles.seasonNavItem} ${activeSeason === idx ? styles.seasonNavItemActive : ''}`}
              onClick={() => handleNavClick(idx)}
              onKeyDown={(e) => handleNavKeyDown(e, idx)}
            >
              {s.num} {s.label}
            </button>
          ))}
          <div ref={indicatorRef} className={styles.seasonIndicator} aria-hidden="true" />
        </div>

        {/* Expansive 3D Architectural Viewport Stage */}
        <div
          className={styles.stageFrame}
          onMouseEnter={handleStageMouseEnter}
          onMouseMove={handleStageMouseMove}
          onMouseLeave={handleStageMouseLeave}
        >
          <div ref={stageInnerRef} className={styles.stageInner}>
            <div className={styles.cardLight} aria-hidden="true" />

            {SEASONS.map((s, idx) => (
              <div
                key={s.id}
                ref={(el) => { scenesRef.current[idx] = el }}
                role="tabpanel"
                id={panelId(s)}
                aria-labelledby={tabId(s)}
                aria-hidden={activeSeason !== idx}
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
        <div className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <div ref={(el) => { metricValRefs.current[0] = el }} className={styles.metricVal}>7,906 FT</div>
            <div className={styles.metricLabel}>ELEVATION</div>
          </div>
          <div className={styles.metricItem}>
            <div ref={(el) => { metricValRefs.current[1] = el }} className={styles.metricVal}>FOUR</div>
            <div className={styles.metricLabel}>SEASONS</div>
          </div>
          <div className={styles.metricItem}>
            <div ref={(el) => { metricValRefs.current[2] = el }} className={styles.metricVal}>50+</div>
            <div className={styles.metricLabel}>RESORT AMENITIES</div>
          </div>
          <div className={styles.metricItem}>
            <div ref={(el) => { metricValRefs.current[3] = el }} className={styles.metricVal}>13–15%</div>
            <div className={styles.metricLabel}>SMART UNIT ROI</div>
          </div>
        </div>
      </div>
    </section>
  )
}
