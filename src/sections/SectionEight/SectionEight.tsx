import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
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
      'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(232, 244, 248, 0.06) 0%, rgba(10, 17, 13, 0.96) 75%)',
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
      'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(122, 168, 133, 0.08) 0%, rgba(10, 17, 13, 0.96) 75%)',
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
      'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(243, 212, 152, 0.09) 0%, rgba(10, 17, 13, 0.96) 75%)',
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
      'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(198, 125, 56, 0.08) 0%, rgba(10, 17, 13, 0.96) 75%)',
  },
]

export default function SectionEight() {
  const sectionRef = useRef<HTMLElement>(null)
  const ambientGlowRef = useRef<HTMLDivElement>(null)
  const scenesRef = useRef<(HTMLDivElement | null)[]>([])
  const navItemsRef = useRef<(HTMLButtonElement | null)[]>([])
  const indicatorRef = useRef<HTMLDivElement>(null)
  const conclusionRef = useRef<HTMLHeadingElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)

  const [activeSeason, setActiveSeason] = useState(0)
  const activeSeasonRef = useRef(0)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      if (!sectionRef.current) return

      const updateSeasonState = (index: number) => {
        activeSeasonRef.current = index
        setActiveSeason(index)

        // 1. Ambient Glow Transition
        if (ambientGlowRef.current) {
          ambientGlowRef.current.style.background = SEASONS[index].glowGradient
        }

        // 2. Staggered Scene Transition (25-30% slower for unhurried presentation)
        scenesRef.current.forEach((scene, idx) => {
          if (!scene) return
          const isCurrent = idx === index
          const img = scene.querySelector(`.${styles.sceneImage}`) as HTMLElement | null
          const headline = scene.querySelector(`.${styles.sceneHeadline}`) as HTMLElement | null
          const story = scene.querySelector(`.${styles.sceneStory}`) as HTMLElement | null
          const stat = scene.querySelector(`.${styles.sceneStat}`) as HTMLElement | null

          if (isCurrent) {
            scene.classList.add(styles.sceneActive)
            gsap.fromTo(scene, { opacity: 0 }, { opacity: 1, duration: 0.75, ease: 'power2.out' })

            if (img) {
              gsap.fromTo(img, { scale: 1.05 }, { scale: 1.0, duration: 0.95, ease: 'power2.out' })
            }

            if (headline) {
              gsap.fromTo(headline, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.75, delay: 0.12, ease: 'power2.out' })
            }

            if (story) {
              gsap.fromTo(story, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.75, delay: 0.22, ease: 'power2.out' })
            }

            if (stat) {
              gsap.fromTo(stat, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.32, ease: 'power2.out' })
            }
          } else {
            scene.classList.remove(styles.sceneActive)
            gsap.set(scene, { opacity: 0 })
          }
        })

        // 3. Update Indicator Underline Position
        const activeNavBtn = navItemsRef.current[index]
        if (activeNavBtn && indicatorRef.current) {
          indicatorRef.current.style.left = `${activeNavBtn.offsetLeft}px`
          indicatorRef.current.style.width = `${activeNavBtn.offsetWidth}px`
        }
      }

      // ScrollTrigger for Season Scrubbing across the section
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 60%',
        end: 'bottom 40%',
        onUpdate: (self) => {
          const seasonProgress = Math.min(0.99, self.progress * 1.25)
          const currentIdx = Math.min(3, Math.floor(seasonProgress * 4))
          if (currentIdx !== activeSeasonRef.current) {
            updateSeasonState(currentIdx)
          }
        },
      })

      // ScrollTrigger for Ceremonial Conclusion & Metric Items Stagger Reveal
      if (conclusionRef.current) {
        gsap.to(conclusionRef.current, {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: conclusionRef.current,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      if (metricsRef.current) {
        const metricItems = metricsRef.current.querySelectorAll(`.${styles.metricItem}`)

        gsap.to(metricsRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: metricsRef.current,
            start: 'top 84%',
            toggleActions: 'play none none reverse',
          },
        })

        if (metricItems.length > 0) {
          gsap.fromTo(
            metricItems,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.14,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: metricsRef.current,
                start: 'top 84%',
                toggleActions: 'play none none reverse',
              },
            },
          )
        }
      }

      // Initial indicator positioning
      const firstNavBtn = navItemsRef.current[0]
      if (firstNavBtn && indicatorRef.current) {
        indicatorRef.current.style.left = `${firstNavBtn.offsetLeft}px`
        indicatorRef.current.style.width = `${firstNavBtn.offsetWidth}px`
      }

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
      <div className={styles.stageFrame}>
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
            <div className={styles.metricVal}>7,906 FT</div>
            <div className={styles.metricLabel}>ELEVATION</div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricVal}>FOUR</div>
            <div className={styles.metricLabel}>SEASONS</div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricVal}>365 DAYS</div>
            <div className={styles.metricLabel}>YEAR-ROUND APPEAL</div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricVal}>13–15%</div>
            <div className={styles.metricLabel}>PROJECTED ROI</div>
          </div>
        </div>
      </div>
    </section>
  )
}
