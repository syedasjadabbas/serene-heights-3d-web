import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import Button from '../../components/ui/Button'
import Logo from '../../components/ui/Logo'
import styles from './Hero.module.css'

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/** Piecewise-linear interpolation across explicit [progress, value] breakpoints. */
function mapBreakpoints(progress: number, points: Array<[number, number]>): number {
  if (progress <= points[0][0]) return points[0][1]
  for (let i = 0; i < points.length - 1; i += 1) {
    const [p0, v0] = points[i]
    const [p1, v1] = points[i + 1]
    if (progress <= p1) {
      const t = (progress - p0) / (p1 - p0)
      return v0 + (v1 - v0) * t
    }
  }
  return points[points.length - 1][1]
}

const FOREGROUND_BREAKPOINTS: Array<[number, number]> = [
  [0, 0],
  [0.65, 0],
  [0.80, 0.25],
  [1, 0.35],
]
// Overlay remains 0 to keep the 3D resort stage continuous into Section 2
const OVERLAY_BREAKPOINTS: Array<[number, number]> = [
  [0, 0],
  [1, 0],
]

const CHAPTER_TIMINGS = [
  { start: 0.12, end: 0.48 }, // 1st scroll: Story Chapter (Left-aligned)
  { start: 0.50, end: 1.00 }, // 2nd scroll: Centered SERENE HEIGHTS Brand Reveal (Generous Hold)
]

function getChapterState(p: number, start: number, end: number, fadeIn = 0.04, fadeOut = 0.04) {
  if (p < start || p > end) {
    return { opacity: 0, y: 20 }
  }
  let opacity = 1
  let y = 0
  if (p < start + fadeIn) {
    const t = (p - start) / fadeIn
    opacity = clamp01(t)
    y = 20 * (1 - opacity)
  } else if (p > end - fadeOut) {
    const t = (end - p) / fadeOut
    opacity = clamp01(t)
    y = -12 * (1 - opacity)
  }
  return { opacity, y }
}

function getBrandRevealState(p: number) {
  if (p < 0.50) {
    return { opacity: 0, y: 20, scale: 0.96 }
  }
  if (p <= 0.85) {
    // Generous, steady hold at centered SERENE HEIGHTS logo mark + wordmark
    const fadeInP = clamp01((p - 0.50) / 0.06)
    return {
      opacity: fadeInP,
      y: 20 * (1 - fadeInP),
      scale: 0.96 + 0.04 * fadeInP,
    }
  }
  // From p = 0.85 to 1.00: Lockup travels upward as a visual header bridge into Section 2
  const bridgeT = clamp01((p - 0.85) / 0.13)
  const fadeOutP = 1 - clamp01((p - 0.93) / 0.06)
  return {
    opacity: fadeOutP,
    y: -75 * bridgeT,
    scale: 1.0 - 0.04 * bridgeT,
  }
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const headlineGroupRef = useRef<HTMLDivElement>(null)
  const kickerRef = useRef<HTMLParagraphElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const foregroundRef = useRef<HTMLDivElement>(null)
  const supportingRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollCueRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const ch01Ref = useRef<HTMLDivElement>(null)
  const ch02Ref = useRef<HTMLDivElement>(null)

  const indicatorRef = useRef<HTMLDivElement>(null)
  const indicatorFillRef = useRef<HTMLDivElement>(null)
  const node0Ref = useRef<HTMLDivElement>(null)
  const node1Ref = useRef<HTMLDivElement>(null)
  const mobileCounterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }
      window.scrollTo(0, 0)
    }
  }, [])

  useLayoutEffect(() => {
    const reduced = prefersReducedMotion()

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      const lineInnerEls = headlineRef.current
        ? Array.from(headlineRef.current.querySelectorAll<HTMLElement>(`.${styles.lineInner}`))
        : []

      const introTl = gsap.timeline({
        delay: 0.2,
        defaults: { ease: 'power3.out' },
      })

      if (reduced) {
        introTl.set(
          [kickerRef.current, ...lineInnerEls, supportingRef.current, ctaRef.current, scrollCueRef.current],
          {
            opacity: 1,
            yPercent: 0,
            y: 0,
          },
        )
      } else {
        introTl
          .fromTo(kickerRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 0.15)
          .fromTo(lineInnerEls, { yPercent: 115 }, { yPercent: 0, duration: 1.15, stagger: 0.09 }, 0.22)
          .fromTo(supportingRef.current, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9 }, 0.5)
          .fromTo(ctaRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 0.68)
          .fromTo(scrollCueRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.9)
      }

      const mm = gsap.matchMedia()

      mm.add(
        {
          isMobile: '(max-width: 640px)',
          isTablet: '(min-width: 641px) and (max-width: 1080px)',
          isDesktop: '(min-width: 1081px)',
        },
        (context) => {
          const conditions = context.conditions as {
            isMobile: boolean
            isTablet: boolean
            isDesktop: boolean
          }
          // Shortened runwayVh by ~30% for refined, crisp luxury pacing
          const runwayVh = conditions.isMobile ? 320 : conditions.isTablet ? 380 : 450

          const applyProgress = (p: number) => {
            gsap.set(backgroundRef.current, { yPercent: p * 10 })

            const textT = clamp01((p - 0.05) / (0.16 - 0.05))
            gsap.set(headlineGroupRef.current, {
              opacity: 1 - textT,
              y: -18 * textT,
              scale: 1 - 0.03 * textT,
            })
            gsap.set(scrollCueRef.current, { opacity: 1 - clamp01(p / 0.05) })

            const targetOverlayOpacity = mapBreakpoints(p, OVERLAY_BREAKPOINTS)

            gsap.set(foregroundRef.current, { opacity: mapBreakpoints(p, FOREGROUND_BREAKPOINTS) })
            gsap.set(overlayRef.current, { opacity: targetOverlayOpacity })

            let activeIdx = -1
            const chRefs = [ch01Ref, ch02Ref]
            CHAPTER_TIMINGS.forEach((ch, idx) => {
              const el = chRefs[idx].current
              if (!el) return

              let opacity = 0
              let y = 0
              let x = 0
              let scale = 1

              if (idx === 1) {
                const state = getBrandRevealState(p)
                opacity = state.opacity
                y = state.y
                scale = state.scale
              } else {
                const state = getChapterState(p, ch.start, ch.end)
                opacity = state.opacity
                y = state.y
                x = -28 * (1 - opacity)
                scale = 0.97 + 0.03 * opacity
              }

              if (opacity > 0.4) activeIdx = idx

              gsap.set(el, {
                opacity,
                x: reduced ? 0 : x,
                y: reduced ? 0 : y,
                scale: reduced ? 1 : scale,
              })
            })

            const indicatorOpacity = clamp01((p - 0.12) / 0.04) * (1 - clamp01((p - 0.85) / 0.04))
            if (indicatorRef.current) {
              gsap.set(indicatorRef.current, { opacity: indicatorOpacity })
            }

            const indicatorT = clamp01((p - 0.12) / (0.85 - 0.12))
            const isMobileViewport = typeof window !== 'undefined' && window.innerWidth <= 640
            if (indicatorFillRef.current) {
              gsap.set(indicatorFillRef.current, {
                scaleY: isMobileViewport ? 1 : indicatorT,
                scaleX: isMobileViewport ? indicatorT : 1,
              })
            }

            const nodeRefs = [node0Ref, node1Ref]
            CHAPTER_TIMINGS.forEach((ch, idx) => {
              const node = nodeRefs[idx].current
              if (!node) return
              const isActive = idx === activeIdx
              const isPassed = p > ch.start
              gsap.set(node, {
                opacity: isActive ? 1 : isPassed ? 0.7 : 0.35,
                scale: isActive ? 1.15 : 1,
              })
            })

            if (mobileCounterRef.current) {
              const num = activeIdx >= 0 ? `0${activeIdx + 1}` : '01'
              mobileCounterRef.current.textContent = `${num} / 02`
            }
          }

          if (reduced) {
            gsap.set(foregroundRef.current, { opacity: 0 })
            ScrollTrigger.create({
              trigger: heroRef.current,
              start: 'top top',
              end: () => {
                const heroH = heroRef.current?.offsetHeight ?? window.innerHeight
                return `+=${(window.innerHeight * runwayVh) / 100 - heroH}`
              },
              scrub: true,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => applyProgress(self.progress),
            })
            return () => ScrollTrigger.getAll().forEach((st) => st.kill())
          }

          gsap.set(foregroundRef.current, { opacity: 0 })

          const st = ScrollTrigger.create({
            trigger: heroRef.current,
            start: 'top top',
            end: () => {
              const heroH = heroRef.current?.offsetHeight ?? window.innerHeight
              return `+=${(window.innerHeight * runwayVh) / 100 - heroH}`
            },
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => applyProgress(self.progress),
          })

          return () => {
            st.kill()
          }
        },
      )
    }, heroRef)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section ref={heroRef} id="top" className={styles.hero}>
      <div className={styles.frame}>
        <div ref={backgroundRef} className={styles.background} />

        <div ref={headlineGroupRef} className={styles.headlineGroup}>
          <div ref={kickerRef} className={styles.brandHeader}>
            <Logo markOnly className={styles.heroLogoMark} />
            <span className={styles.heroWordmark}>SERENE HEIGHTS</span>
            <span className={styles.heroLocation}>NATHIA GALI</span>
          </div>

          <h1 ref={headlineRef} className={styles.headline}>
            <span className={styles.lineMask}>
              <span className={styles.lineInner}>Pakistan's First</span>
            </span>
            <span className={styles.lineMask}>
              <span className={styles.lineInner}>
                &amp; Largest <em className={styles.italicHighlight}>Winter Resort.</em>
              </span>
            </span>
          </h1>

          <div ref={supportingRef} className={styles.heroHighlights}>
            <span className={styles.highlightItem}>
              <span className={styles.highlightDot} />
              7,906 FT ALTITUDE
            </span>
            <span className={styles.highlightDivider}>·</span>
            <span className={styles.highlightItem}>
              <span className={styles.highlightDot} />
              5-STAR MANAGED RESIDENCES
            </span>
          </div>

          <div ref={ctaRef} className={styles.ctaWrap}>
            <Button href="#enquire" variant="ghost">
              EXPLORE SERENE HEIGHTS
            </Button>
          </div>
        </div>

        {/* Chapter Storytelling Overlay Layer (2 Streamlined Chapters) */}
        <div className={styles.chapterLayer}>
          {/* Scene 1: Story Chapter */}
          <div ref={ch01Ref} className={`${styles.chapterItem} ${styles.chapterItemLeft}`}>
            <p className={styles.chapterLabel}>
              <span className={styles.chapterNum}>01</span>
              <span className={styles.chapterDivider}>/</span>
              <span>NATHIA GALI · PAKISTAN</span>
            </p>
            <h2 className={styles.chapterHeadline}>
              Where pine forests meet luxury living.<br />
              <span className={styles.chapterSubtext}>Pakistan’s premier high-altitude winter resort &amp; managed residences.</span>
            </h2>
          </div>

          {/* Scene 2: Centered SERENE HEIGHTS Brand Reveal (Generous Hold) */}
          <div ref={ch02Ref} className={`${styles.chapterItem} ${styles.chapterItemCenterBrand}`}>
            <Logo markOnly className={styles.brandRevealLogoMark} />
            <h2 className={styles.brandRevealWordmark}>SERENE HEIGHTS</h2>
            <p className={styles.brandRevealSub}>NATHIA GALI</p>
          </div>
        </div>

        {/* Minimal Chapter Progress Indicator */}
        <div ref={indicatorRef} className={styles.chapterIndicator} aria-hidden="true">
          <div className={styles.indicatorTrack}>
            <div ref={indicatorFillRef} className={styles.indicatorFill} />
          </div>
          <div className={styles.indicatorNodes}>
            <div ref={node0Ref} className={styles.indicatorNode}>
              <span className={styles.nodeNumber}>01</span>
            </div>
            <div ref={node1Ref} className={styles.indicatorNode}>
              <span className={styles.nodeNumber}>02</span>
            </div>
          </div>
          <span ref={mobileCounterRef} className={styles.mobileChapterCounter}>
            01 / 02
          </span>
        </div>

        <div ref={foregroundRef} className={styles.foreground} />

        <div ref={scrollCueRef} className={styles.scrollCue}>
          <span className={styles.scrollCueLine} />
          <span>Scroll</span>
        </div>

        <div ref={overlayRef} className={styles.transitionOverlay} />
      </div>
    </section>
  )
}
