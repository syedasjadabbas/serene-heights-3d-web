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
      'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(220, 238, 245, 0.12) 0%, rgba(10, 17, 13, 0.96) 75%)',
    imgFilter: 'brightness(0.85) contrast(1.02) saturate(0.88)',
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
      'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(122, 168, 133, 0.14) 0%, rgba(10, 17, 13, 0.96) 75%)',
    imgFilter: 'brightness(0.95) contrast(1.04) saturate(1.05)',
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
      'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(243, 212, 152, 0.16) 0%, rgba(10, 17, 13, 0.96) 75%)',
    imgFilter: 'brightness(1.02) contrast(1.06) saturate(1.12)',
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
      'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(216, 138, 66, 0.15) 0%, rgba(10, 17, 13, 0.96) 75%)',
    imgFilter: 'brightness(0.92) contrast(1.04) saturate(1.08)',
    borderTop: 'rgba(216, 138, 66, 0.45)',
  },
]

export default function SectionEight() {
  const sectionRef = useRef<HTMLElement>(null)
  const ambientGlowRef = useRef<HTMLDivElement>(null)
  const sunbeamRef = useRef<HTMLDivElement>(null)
  const frostHazeRef = useRef<HTMLDivElement>(null)
  const stageFrameRef = useRef<HTMLDivElement>(null)
  const scenesRef = useRef<(HTMLDivElement | null)[]>([])
  const navItemsRef = useRef<(HTMLButtonElement | null)[]>([])
  const indicatorRef = useRef<HTMLDivElement>(null)
  const conclusionRef = useRef<HTMLHeadingElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)
  const metricValRefs = useRef<(HTMLDivElement | null)[]>([])
  const metricsAnimatedRef = useRef(false)

  const [activeSeason, setActiveSeason] = useState(0)
  const activeSeasonRef = useRef(0)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      if (!sectionRef.current) return

      const updateSeasonProgress = (progress: number) => {
        const numSeasons = 4
        const stepWindow = 1 / numSeasons

        // Keynote Pacing: Arrival (15%) -> Unhurried 70% Reading Plateau Hold -> Exit (15%)
        SEASONS.forEach((seasonData, idx) => {
          const stepStart = idx * stepWindow
          const relProgress = (progress - stepStart) / stepWindow

          let focus = 0
          if (relProgress >= 0 && relProgress <= 1) {
            if (relProgress < 0.15) {
              focus = relProgress / 0.15
            } else if (relProgress <= 0.85) {
              focus = 1.0
            } else {
              focus = (1.0 - relProgress) / 0.15
            }
          }

          const scene = scenesRef.current[idx]
          if (!scene) return

          const img = scene.querySelector(`.${styles.sceneImage}`) as HTMLElement | null
          const headline = scene.querySelector(`.${styles.sceneHeadline}`) as HTMLElement | null
          const story = scene.querySelector(`.${styles.sceneStory}`) as HTMLElement | null
          const stat = scene.querySelector(`.${styles.sceneStat}`) as HTMLElement | null

          if (focus > 0) {
            scene.classList.add(styles.sceneActive)
            gsap.set(scene, { opacity: focus, zIndex: Math.round(1 + focus * 10) })

            if (img) {
              gsap.set(img, {
                scale: 1.04 - 0.04 * focus,
                filter: seasonData.imgFilter,
              })
            }

            if (headline) {
              gsap.set(headline, { opacity: focus, y: 16 * (1 - focus) })
            }

            if (story) {
              gsap.set(story, { opacity: focus, y: 12 * (1 - focus) })
            }

            if (stat) {
              gsap.set(stat, { opacity: focus, y: 10 * (1 - focus) })
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
              sunbeamRef.current.style.opacity = '0.65'
              sunbeamRef.current.style.background = 'linear-gradient(135deg, rgba(243, 212, 152, 0.18) 0%, transparent 65%)'
            } else if (activeIdx === 3) {
              sunbeamRef.current.style.opacity = '0.48'
              sunbeamRef.current.style.background = 'linear-gradient(135deg, rgba(216, 138, 66, 0.15) 0%, transparent 65%)'
            } else {
              sunbeamRef.current.style.opacity = '0'
            }
          }

          if (frostHazeRef.current) {
            if (activeIdx === 0) {
              frostHazeRef.current.style.opacity = '0.75'
              frostHazeRef.current.style.boxShadow = 'inset 0 0 110px rgba(220, 238, 245, 0.12)'
            } else if (activeIdx === 1) {
              frostHazeRef.current.style.opacity = '0.55'
              frostHazeRef.current.style.boxShadow = 'inset 0 0 110px rgba(122, 168, 133, 0.10)'
            } else {
              frostHazeRef.current.style.opacity = '0'
            }
          }

          if (stageFrameRef.current) {
            stageFrameRef.current.style.borderTopColor = SEASONS[activeIdx].borderTop
          }

          const activeNavBtn = navItemsRef.current[activeIdx]
          if (activeNavBtn && indicatorRef.current) {
            indicatorRef.current.style.left = `${activeNavBtn.offsetLeft}px`
            indicatorRef.current.style.width = `${activeNavBtn.offsetWidth}px`
          }

          // Trigger metric counter animation once user scrolls into Section 8
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

      // Pin Section 8 for continuous unhurried keynote presentation runway
      const st = ScrollTrigger.create({
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
        onEnter: () => triggerMetricCounters(),
      })

      // Initial state
      updateSeasonProgress(0)

      return () => st.kill()
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

  return (
    <section ref={sectionRef} id="seasons" className={styles.section}>
      {/* 3D Seasonal Canvas particles */}
      <SectionEightCanvas activeSeason={activeSeason} />

      {/* Blueprint Grid & Dynamic Ambient Glow */}
      <div className={styles.blueprintBgGrid} aria-hidden="true" />
      <div ref={ambientGlowRef} className={styles.ambientGlow} aria-hidden="true" />
      <div ref={sunbeamRef} className={styles.sunbeamOverlay} aria-hidden="true" />
      <div ref={frostHazeRef} className={styles.frostHazeOverlay} aria-hidden="true" />

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

      {/* Seasonal Image & Story Stage */}
      <div ref={stageFrameRef} className={styles.stageFrame}>
        {SEASONS.map((s, idx) => (
          <div
            key={s.id}
            ref={(el) => { scenesRef.current[idx] = el }}
            className={`${styles.seasonScene} ${activeSeason === idx ? styles.sceneActive : ''}`}
          >
            <img src={s.imageUrl} alt={s.title} className={styles.sceneImage} />
            <div className={styles.sceneOverlay} aria-hidden="true" />
            <div className={styles.sceneContent}>
              <h3 className={styles.sceneHeadline}>{s.title}</h3>
              <p className={styles.sceneStory}>{s.story}</p>
              <div className={styles.sceneStat}>{s.stat}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Staggered Conclusion & Metrics Strip */}
      <div className={styles.conclusionContainer}>
        <h3 ref={conclusionRef} className={styles.conclusionStatement}>
          365 Days. One Destination. Endless Reasons To Return.
        </h3>

        <div ref={metricsRef} className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <div ref={(el) => { metricValRefs.current[0] = el }} className={styles.metricVal}>0 FT</div>
            <div className={styles.metricLabel}>ELEVATION</div>
          </div>
          <div className={styles.metricItem}>
            <div ref={(el) => { metricValRefs.current[1] = el }} className={styles.metricVal}>0</div>
            <div className={styles.metricLabel}>SEASONS</div>
          </div>
          <div className={styles.metricItem}>
            <div ref={(el) => { metricValRefs.current[2] = el }} className={styles.metricVal}>0 DAYS</div>
            <div className={styles.metricLabel}>YEAR-ROUND APPEAL</div>
          </div>
          <div className={styles.metricItem}>
            <div ref={(el) => { metricValRefs.current[3] = el }} className={styles.metricVal}>0%</div>
            <div className={styles.metricLabel}>PROJECTED ROI</div>
          </div>
        </div>
      </div>
    </section>
  )
}
