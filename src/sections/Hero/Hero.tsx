import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import Button from '../../components/ui/Button'
import {
  FRAME_COUNT,
  FRAME_WIDTH,
  FRAME_HEIGHT,
  createSequenceLoader,
  nearestLoadedFrame,
} from './cameraSequence'
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

// Hero scroll-progress -> sequence-position (0..1) mapping. The frame
// sequence itself carries the real camera movement, so this is the ONLY
// thing that decides which frame is on screen: no CSS scale/x/y stacked on
// top of it. Holds frame 0 through the opening text, covers most of its
// travel across the PUSH-IN band, then holds the final frame from 0.74
// onward for the wordmark act.
const SEQUENCE_BREAKPOINTS: Array<[number, number]> = [
  [0, 0],
  [0.08, 0],
  [0.2, 0.1],
  [0.4, 0.42],
  [0.6, 0.78],
  [0.74, 1],
  [1, 1],
]

// Vignette stays at 0 through the whole sequence push (architecture must
// read clean/bright while it's the thing being watched) and only builds
// enough contrast to make the outlined wordmark legible, well short of the
// full exit darkening.
const FOREGROUND_BREAKPOINTS: Array<[number, number]> = [
  [0, 0],
  [0.65, 0],
  [0.84, 0.35],
  [0.91, 0.35],
  [1, 1],
]
const OVERLAY_BREAKPOINTS: Array<[number, number]> = [
  [0, 0],
  [0.91, 0],
  [1, 0.92],
]
const WORDMARK_OPACITY_BREAKPOINTS: Array<[number, number]> = [
  [0, 0],
  [0.74, 0],
  [0.84, 1],
  [0.91, 1],
  [1, 0],
]

// Frame-1's building mass sits toward the left third of the source frame
// (roughly x 0-60%), not centered — biasing the cover-crop window this low
// keeps the tower in view instead of drifting toward the empty sky/valley
// on the right when a narrow viewport forces a horizontal crop.
const FOCAL_X = 0.15

type HeroPhase = 'OPENING' | 'TEXT EXIT' | 'SEQUENCE' | 'WORDMARK' | 'EXIT'

function phaseFor(p: number): HeroPhase {
  if (p < 0.05) return 'OPENING'
  if (p < 0.16) return 'TEXT EXIT'
  if (p < 0.74) return 'SEQUENCE'
  if (p < 0.91) return 'WORDMARK'
  return 'EXIT'
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  srcW: number,
  srcH: number,
  canvasW: number,
  canvasH: number,
) {
  const imgRatio = srcW / srcH
  const canvasRatio = canvasW / canvasH
  let sx = 0
  let sy = 0
  let sw = srcW
  let sh = srcH
  if (imgRatio > canvasRatio) {
    sw = srcH * canvasRatio
    sx = (srcW - sw) * FOCAL_X
  } else {
    sh = srcW / canvasRatio
    sy = (srcH - sh) * 0.5
  }
  ctx.clearRect(0, 0, canvasW, canvasH)
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH)
}

/**
 * PRYPCO-style Hero. The architectural camera move is a real pre-rendered
 * frame sequence (reference/serene-hero-camera.mp4 -> 96 WebP frames),
 * drawn into ONE canvas. Hero scroll-progress maps deterministically to a
 * frame index every tick from ScrollTrigger.onUpdate: progress -> frame ->
 * canvas draw, nothing else owns "what's on screen". No CSS scale/x/y is
 * stacked on top of it, no autoplay, no direction-dependent state.
 */
export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const headlineGroupRef = useRef<HTMLDivElement>(null)
  const kickerRef = useRef<HTMLParagraphElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const foregroundRef = useRef<HTMLDivElement>(null)
  const supportingRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollCueRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const debugHudRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const reduced = prefersReducedMotion()
    const frameIndexRef = { current: 0 }
    const lastDrawnIndexRef = { current: -1 }

    const loader = createSequenceLoader(() => redraw())
    let resizeObserver: ResizeObserver | null = null

    function redraw(force = false) {
      const canvas = canvasRef.current
      if (!canvas) return
      const target = frameIndexRef.current
      const available = nearestLoadedFrame(loader, target)
      if (available === -1) return
      if (available === lastDrawnIndexRef.current && !force) return
      const img = loader.getFrame(available)
      const ctx = canvas.getContext('2d')
      if (!img || !ctx) return
      drawCover(ctx, img, FRAME_WIDTH, FRAME_HEIGHT, canvas.width, canvas.height)
      lastDrawnIndexRef.current = available
    }

    function resizeCanvas() {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(rect.width * dpr)
      const h = Math.round(rect.height * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        redraw(true)
      }
    }

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      const lineInnerEls = headlineRef.current
        ? Array.from(headlineRef.current.querySelectorAll<HTMLElement>(`.${styles.lineInner}`))
        : []

      // Eager: frame 0 first, then a small early-priority window, then let
      // everything else fill in during idle time.
      loader.request(0)
      for (let i = 1; i <= 11; i += 1) loader.request(i)
      loader.startBackgroundFill()

      if (canvasRef.current) {
        resizeObserver = new ResizeObserver(() => resizeCanvas())
        resizeObserver.observe(canvasRef.current)
      }
      window.addEventListener('orientationchange', resizeCanvas)
      resizeCanvas()

      // --- Entrance timeline: plays once on mount ---
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

          // progress -> sequence fraction -> frame index -> canvas draw.
          // This is the ONLY thing deciding what's on screen: same p always
          // resolves to the same frame, forward or reverse.
          const applyProgress = (p: number) => {
            const sequenceT = mapBreakpoints(p, SEQUENCE_BREAKPOINTS)
            const frameIndex = Math.round(sequenceT * (FRAME_COUNT - 1))
            frameIndexRef.current = frameIndex

            // Prefetch a small window around the target so fast scrubbing
            // into a new region resolves quickly.
            loader.request(frameIndex)
            loader.request(Math.max(0, frameIndex - 2))
            loader.request(Math.min(FRAME_COUNT - 1, frameIndex + 2))
            redraw()

            gsap.set(backgroundRef.current, { yPercent: p * 10 })

            // --- Opening text: one restrained unit (kicker, headline,
            // supporting copy and CTA all live inside headlineGroupRef, so
            // animating the parent moves all of them together, not
            // staggered). Fully visible 0-0.05, recedes 0.05-0.16. ---
            const textT = clamp01((p - 0.05) / (0.16 - 0.05))
            gsap.set(headlineGroupRef.current, {
              opacity: 1 - textT,
              y: -18 * textT,
              scale: 1 - 0.03 * textT,
            })
            // Scroll cue reads as "you haven't scrolled yet" — gone earlier
            // than the rest of the opening text, not lingering into the exit.
            gsap.set(scrollCueRef.current, { opacity: 1 - clamp01(p / 0.05) })

            // --- Wordmark: brand reveal held over the final frame, not
            // another headline. Fades in 0.74-0.84, holds, fades with exit. ---
            const wordmarkOpacity = mapBreakpoints(p, WORDMARK_OPACITY_BREAKPOINTS)
            const wordmarkT = clamp01((p - 0.74) / (0.84 - 0.74))
            gsap.set(wordmarkRef.current, {
              opacity: wordmarkOpacity,
              scale: 0.98 + 0.02 * wordmarkT,
              y: 10 * (1 - wordmarkT),
            })

            // --- Depth/contrast: near-zero through the whole sequence so
            // the architecture stays clean and bright; only enough vignette
            // during WORDMARK to make the outline legible, full darkening
            // reserved for the actual exit into Section 2. ---
            gsap.set(foregroundRef.current, { opacity: mapBreakpoints(p, FOREGROUND_BREAKPOINTS) })
            gsap.set(overlayRef.current, { opacity: mapBreakpoints(p, OVERLAY_BREAKPOINTS) })

            if (import.meta.env.DEV && debugHudRef.current) {
              debugHudRef.current.textContent =
                `PROGRESS ${p.toFixed(3)}\n` +
                `FRAME ${frameIndex + 1}/${FRAME_COUNT}\n` +
                `PHASE ${phaseFor(p)}`
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
          // Deliberately NOT calling applyProgress(0) eagerly here: it would
          // stomp the entrance timeline's own opacity-0 starting values for
          // kicker/supporting/cta/scrollCue (they write to the same inline
          // `opacity` style) before that timeline gets a chance to run its
          // fade-in. Frame 0 is already what's drawn by default (wordmark
          // and overlay are 0 in CSS) until the first real scroll fires
          // onUpdate.
          if (import.meta.env.DEV && debugHudRef.current) {
            debugHudRef.current.textContent = `PROGRESS 0.000\nFRAME 1/${FRAME_COUNT}\nPHASE OPENING`
          }

          return () => {
            st.kill()
          }
        },
      )
    }, heroRef)

    return () => {
      ctx.revert()
      loader.destroy()
      resizeObserver?.disconnect()
      window.removeEventListener('orientationchange', resizeCanvas)
    }
  }, [])

  return (
    <section ref={heroRef} id="top" className={styles.hero}>
      <div className={styles.frame}>
        <div ref={backgroundRef} className={styles.background} />

        <canvas
          ref={canvasRef}
          className={styles.photo}
          role="img"
          aria-label="Serene Heights, a mountain hotel above Nathiagali"
        />

        <div ref={headlineGroupRef} className={styles.headlineGroup}>
          <p ref={kickerRef} className={styles.kicker}>
            SERENE HEIGHTS · NATHIA GALI
          </p>
          <h1 ref={headlineRef} className={styles.headline}>
            <span className={styles.lineMask}>
              <span className={styles.lineInner}>Pakistan's First</span>
            </span>
            <span className={styles.lineMask}>
              <span className={styles.lineInner}>&amp; Largest Winter Resort.</span>
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

        <div ref={wordmarkRef} className={styles.wordmark} aria-hidden="true">
          <span>Serene Heights</span>
        </div>

        <div ref={foregroundRef} className={styles.foreground} />

        <div ref={scrollCueRef} className={styles.scrollCue}>
          <span className={styles.scrollCueLine} />
          <span>Scroll</span>
        </div>

        <div ref={overlayRef} className={styles.transitionOverlay} />

        {import.meta.env.DEV && <div ref={debugHudRef} className={styles.debugHud} />}
      </div>
    </section>
  )
}
