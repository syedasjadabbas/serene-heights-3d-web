import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import Button from '../../components/ui/Button'
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
  [0.84, 0.35],
  [0.91, 0.35],
  [1, 1],
]
const OVERLAY_BREAKPOINTS: Array<[number, number]> = [
  [0, 0],
  [1, 0],
]
const WORDMARK_OPACITY_BREAKPOINTS: Array<[number, number]> = [
  [0, 0],
  [0.74, 0],
  [0.84, 1],
  [0.91, 1],
  [1, 0],
]

const CHAPTER_TIMINGS = [
  { start: 0.18, end: 0.32 },
  { start: 0.35, end: 0.49 },
  { start: 0.52, end: 0.66 },
  { start: 0.68, end: 0.80 },
]

function getChapterState(p: number, start: number, end: number, fadeIn = 0.035, fadeOut = 0.035) {
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
  const wordmarkRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const ch01Ref = useRef<HTMLDivElement>(null)
  const ch02Ref = useRef<HTMLDivElement>(null)
  const ch03Ref = useRef<HTMLDivElement>(null)
  const ch04Ref = useRef<HTMLDivElement>(null)

  const indicatorRef = useRef<HTMLDivElement>(null)
  const indicatorFillRef = useRef<HTMLDivElement>(null)
  const node0Ref = useRef<HTMLDivElement>(null)
  const node1Ref = useRef<HTMLDivElement>(null)
  const node2Ref = useRef<HTMLDivElement>(null)
  const node3Ref = useRef<HTMLDivElement>(null)
  const mobileCounterRef = useRef<HTMLSpanElement>(null)

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
          const runwayVh = conditions.isMobile ? 350 : conditions.isTablet ? 420 : 500

          const applyProgress = (p: number) => {
            gsap.set(backgroundRef.current, { yPercent: p * 10 })

            const textT = clamp01((p - 0.05) / (0.16 - 0.05))
            gsap.set(headlineGroupRef.current, {
              opacity: 1 - textT,
              y: -18 * textT,
              scale: 1 - 0.03 * textT,
            })
            gsap.set(scrollCueRef.current, { opacity: 1 - clamp01(p / 0.05) })

            const wordmarkOpacity = mapBreakpoints(p, WORDMARK_OPACITY_BREAKPOINTS)
            const wordmarkT = clamp01((p - 0.74) / (0.84 - 0.74))
            gsap.set(wordmarkRef.current, {
              opacity: wordmarkOpacity,
              scale: 0.98 + 0.02 * wordmarkT,
              y: 10 * (1 - wordmarkT),
            })

            gsap.set(foregroundRef.current, { opacity: mapBreakpoints(p, FOREGROUND_BREAKPOINTS) })
            gsap.set(overlayRef.current, { opacity: mapBreakpoints(p, OVERLAY_BREAKPOINTS) })

            let activeIdx = -1
            const chRefs = [ch01Ref, ch02Ref, ch03Ref, ch04Ref]
            CHAPTER_TIMINGS.forEach((ch, idx) => {
              const el = chRefs[idx].current
              if (!el) return
              const { opacity, y } = getChapterState(p, ch.start, ch.end)
              if (opacity > 0.4) activeIdx = idx
              gsap.set(el, {
                opacity,
                y: reduced ? 0 : y,
              })
            })

            const indicatorOpacity = clamp01((p - 0.14) / 0.04) * (1 - clamp01((p - 0.78) / 0.04))
            if (indicatorRef.current) {
              gsap.set(indicatorRef.current, { opacity: indicatorOpacity })
            }

            const indicatorT = clamp01((p - 0.18) / (0.80 - 0.18))
            const isMobileViewport = typeof window !== 'undefined' && window.innerWidth <= 640
            if (indicatorFillRef.current) {
              gsap.set(indicatorFillRef.current, {
                scaleY: isMobileViewport ? 1 : indicatorT,
                scaleX: isMobileViewport ? indicatorT : 1,
              })
            }

            const nodeRefs = [node0Ref, node1Ref, node2Ref, node3Ref]
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
              mobileCounterRef.current.textContent = `${num} / 04`
            }
          }

          if (reduced) {
            gsap.set(foregroundRef.current, { opacity: 0 })
            ScrollTrigger.create({
              trigger: heroRef.current,
              start: 'top top',
              end: () => `+=${(window.innerHeight * runwayVh) / 100}`,
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
            end: () => `+=${(window.innerHeight * runwayVh) / 100}`,
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
          <p ref={kickerRef} className={styles.kicker}>
            SERENE HEIGHTS · NATHIA GALI
          </p>
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
          <p ref={supportingRef} className={styles.supportingCopy}>
            Luxury mountain living at 7,906 ft.
          </p>
          <div ref={ctaRef} className={styles.ctaWrap}>
            <Button href="#enquire" variant="ghost">
              EXPLORE SERENE HEIGHTS
            </Button>
          </div>
        </div>

        {/* Chapter Storytelling Overlay Layer */}
        <div className={styles.chapterLayer}>
          <div ref={ch01Ref} className={styles.chapterItem}>
            <p className={styles.chapterLabel}>
              <span className={styles.chapterNum}>01</span>
              <span className={styles.chapterDivider}>/</span>
              <span>THE RESORT</span>
            </p>
            <h2 className={styles.chapterHeadline}>
              Architecture shaped<br />
              for the mountains.
            </h2>
          </div>

          <div ref={ch02Ref} className={styles.chapterItem}>
            <p className={styles.chapterLabel}>
              <span className={styles.chapterNum}>02</span>
              <span className={styles.chapterDivider}>/</span>
              <span>THE RESIDENCES</span>
            </p>
            <h2 className={styles.chapterHeadline}>
              Elevated living<br />
              at 7,906 ft.
            </h2>
          </div>

          <div ref={ch03Ref} className={styles.chapterItem}>
            <p className={styles.chapterLabel}>
              <span className={styles.chapterNum}>03</span>
              <span className={styles.chapterDivider}>/</span>
              <span>THE EXPERIENCE</span>
            </p>
            <h2 className={styles.chapterHeadline}>
              50+ amenities.<br />
              One mountain destination.
            </h2>
          </div>

          <div ref={ch04Ref} className={styles.chapterItem}>
            <p className={styles.chapterLabel}>
              <span className={styles.chapterNum}>04</span>
              <span className={styles.chapterDivider}>/</span>
              <span>SERENE HEIGHTS</span>
            </p>
            <h2 className={styles.chapterHeadline}>
              A complete mountain<br />
              destination.
            </h2>
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
            <div ref={node2Ref} className={styles.indicatorNode}>
              <span className={styles.nodeNumber}>03</span>
            </div>
            <div ref={node3Ref} className={styles.indicatorNode}>
              <span className={styles.nodeNumber}>04</span>
            </div>
          </div>
          <span ref={mobileCounterRef} className={styles.mobileChapterCounter}>
            01 / 04
          </span>
        </div>

        <div ref={wordmarkRef} className={styles.wordmark} aria-hidden="true">
          <span>Serene Heights</span>
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
