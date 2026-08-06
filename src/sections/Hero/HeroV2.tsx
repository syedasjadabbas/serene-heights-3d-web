/**
 * Section: Hero
 * Assets: src/assets/hero/
 */
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import { setHeroTypographyOpacity } from '../../components/stage/masterVisualStageState'
import logoSvg from '../../assets/common/logo.svg'
import heroImageSrc from '../../assets/hero/hero-main.webp'
import styles from './HeroV2.module.css'

/**
 * HeroV2 — Single World Camera Rig & Viewport Passage
 *
 * ─── Camera Architecture Invariants ──────────────────────────────
 *   1. Fullscreen World Layer (worldLayer):
 *      - There is strictly ONE world layer.
 *      - It sits full-resolution behind the green cover layer (#0a1410).
 *      - Never duplicated, never swapped, never crossfaded between different images.
 *      - Building size remains 100% identical from p = 0.00 to p = 0.86 (worldScale = 1.00).
 *
 *   2. Viewport Passage (clipPath & logoMarkRef):
 *      - The capsule is ONLY a viewport opening in the deep green cover layer.
 *      - Phase 1 (p 0.20 → 0.45): Capsule window enlarges (frameScale 1.00 → 1.40).
 *      - Phase 2 (p 0.45 → 0.57): Camera passes forward through the window plane.
 *        ALL capsule borders AND mountain vector lines expand 100% past all screen edges by p = 0.57.
 *      - SVG outline dissolves strictly during p 0.57 → 0.58 when EVERY border edge & vector line is ALREADY off-screen.
 *      - ZERO visible border lines or strokes on screen at p = 0.58!
 *
 *   3. After Passing Through (p >= 0.60):
 *      - The user is simply looking at the SAME fullscreen world that already existed behind the mask.
 *      - No image replacement, no clip-path morph, no second image, no resize, no jump.
 *
 * ─── Architecture Invariants ──────────────────────────────────────
 *   ONE pinned section · ONE ScrollTrigger · ONE onUpdate
 *   No pub/sub · No tickers · No canvas · No extra render loops
 *   Every animated property = pure f(scroll progress p)
 */

function logoNaturalW(vw: number): number {
  return Math.min(200, Math.max(100, vw * 0.14))
}
function logoNaturalH(w: number): number {
  return w * (136 / 100)
}

const MARGIN_X  = 3  / 100
const MARGIN_Y  = 3  / 136
const CAPSULE_W = 94 / 100
const CAPSULE_H = 130 / 136
const RX_FRAC   = 47 / 100
const RY_FRAC   = 47 / 136

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function remap(p: number, inMin: number, inMax: number): number {
  return Math.max(0, Math.min(1, (p - inMin) / (inMax - inMin)))
}

// ── One-time-per-session breakthrough gate ────────────────────────
// Matches the documented "After Passing Through (p >= 0.60)" invariant
// above: once scroll progress has reached that point, the world is
// fully revealed with no capsule/border remnants on screen. Module
// state (not component state) so it survives remounts for the life of
// this page load, and resets only on an actual browser refresh.
const BREAKTHROUGH_COMPLETE_P = 0.60
let heroBreakthroughCompleted = false

// ── Hero appreciation hold ─────────────────────────────────────────
// Short extra pinned scroll distance appended AFTER the original
// capsule+reveal runway (unchanged) — just enough of a beat to look
// at the fully-revealed hero before Section 2 arrives.
// Exported: Deconstruction reads this to compute exactly where the
// global background video begins, without duplicating the constant.
export const HERO_HOLD_PX = 400

// ── Cinematic camera push — pure f(scroll progress p), same architecture
// as everything else here. An optical dolly (translateZ under a real CSS
// perspective, see .worldLayer/.portalImage) rather than a CSS scale() —
// perspective projection gives it the non-linear growth curve of an
// actual lens moving through space instead of a flat digital zoom.
// Begins the instant the world is fully revealed (BREAKTHROUGH_COMPLETE_P)
// and reaches its final value exactly at p=1, i.e. exactly when the Hero
// "ends" — a deterministic final frame to hand off from, regardless of
// how fast the user scrolled to get there.
const WORLD_PUSH_Z_START = 89  // ~1.08x apparent scale at perspective:1200px — matches the prior resting crop
const WORLD_PUSH_Z_END   = 124 // ~1.115x apparent — almost invisible, extremely subtle push

function computeClipAttrs(
  p: number,
  vw: number,
  vh: number,
): Record<string, number> {
  const lw = logoNaturalW(vw)
  const lh = logoNaturalH(lw)

  const startW  = CAPSULE_W * lw
  const startH  = CAPSULE_H * lh

  const cornerDist = Math.hypot(vw * 0.5, vh * 0.5)
  const requiredRx = cornerDist * 1.45
  const maxScale   = Math.max(requiredRx / (RX_FRAC * lw), Math.max(vw / startW, vh / startH) * 2.8)

  let frameScale = 1.00
  let centerYLerp = 0

  if (p <= 0.38) {
    // SINGLE CONTINUOUS STEADICAM DOLLY VELOCITY (Zero multi-branch speed spikes)
    const dollyP = Math.pow(p / 0.38, 3.6)
    frameScale = 1.00 + dollyP * (maxScale - 1.00)
    centerYLerp = dollyP
  } else {
    frameScale = maxScale
    centerYLerp = 1.0
  }

  const targetCenterY = vh * 0.45 + centerYLerp * (vh * 0.50 - vh * 0.45)

  const currentW  = startW  * frameScale
  const currentH  = startH  * frameScale
  const currentRx = RX_FRAC * lw * frameScale
  const currentRy = RY_FRAC * lh * frameScale

  const currentX = (vw - currentW) / 2
  const currentY = targetCenterY - (currentH / 2)

  return {
    x:      currentX,
    y:      currentY,
    width:  currentW,
    height: currentH,
    rx:     currentRx,
    ry:     currentRy,
  }
}

export default function HeroV2() {
  const heroRef        = useRef<HTMLElement>(null)
  const clipRectRef    = useRef<SVGRectElement>(null)
  const portalImageRef = useRef<HTMLImageElement>(null)
  const logoMarkRef    = useRef<SVGSVGElement>(null)
  const brandLockupRef = useRef<HTMLDivElement>(null)
  const videoRef       = useRef<HTMLVideoElement>(null)

  // Layered Title Refs
  const titleMainRef   = useRef<HTMLHeadingElement>(null)
  const titleSubRef    = useRef<HTMLParagraphElement>(null)
  const titleCtaRef    = useRef<HTMLDivElement>(null)

  const vwRef = useRef(window.innerWidth)
  const vhRef = useRef(window.innerHeight)

  const videoStarted = useRef(false)

  useLayoutEffect(() => {
    registerScrollTrigger()

    vwRef.current = window.innerWidth
    vhRef.current = window.innerHeight

    // Initialise SVG clip rect to p=0 state
    gsap.set(clipRectRef.current, {
      attr: computeClipAttrs(0, vwRef.current, vhRef.current),
    })

    // Deterministic initial layer states:
    gsap.set(logoMarkRef.current,    { opacity: 1, scale: 1, z: 0, rotateX: 0, rotateY: 0 })
    gsap.set(brandLockupRef.current, { opacity: 1 })
    gsap.set(portalImageRef.current, { z: WORLD_PUSH_Z_START, y: 0, opacity: 1 })
    gsap.set(videoRef.current,       { scale: 1, y: 0, opacity: 0 })

    gsap.set(titleMainRef.current,   { opacity: 0, x: -18 })
    gsap.set(titleSubRef.current,    { opacity: 0, x: -12 })
    gsap.set(titleCtaRef.current,    { opacity: 0, x: -8 })

    // ── Single ScrollTrigger (Fast 200% runway = ~2 mouse-wheel scrolls,
    //    plus a fixed HOLD_PX appreciation hold appended at the end —
    //    the original 200% runway's timing/easing is untouched; onUpdate
    //    remaps progress below so every existing p-driven formula still
    //    sees exactly the same p over exactly the same scroll distance) ──
    const st = ScrollTrigger.create({
      trigger: heroRef.current,
      start: 'top top',
      end: () => '+=' + ((heroRef.current?.offsetHeight ?? window.innerHeight) * 2 + HERO_HOLD_PX),
      scrub: 0.7,
      pin: true,
      invalidateOnRefresh: true,

      onRefresh: () => {
        vwRef.current = window.innerWidth
        vhRef.current = window.innerHeight
      },

      onUpdate: (self) => {
        const originalSpanPx = (heroRef.current?.offsetHeight ?? vhRef.current) * 2
        const totalSpanPx    = self.end - self.start
        let p = Math.min(1, self.progress * totalSpanPx / originalSpanPx)

        // ── Reverse-scroll clamp (fires only after breakthrough has
        //    completed once this page session) ──────────────────────
        if (heroBreakthroughCompleted) {
          if (p < BREAKTHROUGH_COMPLETE_P) {
            self.scroll(self.start + BREAKTHROUGH_COMPLETE_P * originalSpanPx)
            p = BREAKTHROUGH_COMPLETE_P
          }
        } else if (p >= BREAKTHROUGH_COMPLETE_P) {
          heroBreakthroughCompleted = true
        }

        const vw = vwRef.current
        const vh = vhRef.current

        const lw = logoNaturalW(vw)
        const lh = logoNaturalH(lw)
        const startW   = CAPSULE_W * lw
        const startH   = CAPSULE_H * lh
        const cornerDist = Math.hypot(vw * 0.5, vh * 0.5)
        const requiredRx = cornerDist * 1.45
        const maxScale   = Math.max(requiredRx / (RX_FRAC * lw), Math.max(vw / startW, vh / startH) * 2.8)

        // Opening lockup fades out smoothly (p 0.04 → 0.12)
        const lockupFade = remap(p, 0.04, 0.12)
        gsap.set(brandLockupRef.current, {
          opacity: Math.max(0, 1 - lockupFade),
        })

        // Viewport Clip Aperture
        gsap.set(clipRectRef.current, {
          attr: computeClipAttrs(p, vw, vh),
        })

        // ── UNIFIED STEADICAM DOLLY & IMPERCEPTIBLE PARALLAX ──────────
        let frameScale = 1.00
        let worldZ = WORLD_PUSH_Z_START
        let worldY = 0
        let centerYLerp = 0
        let tz = 0
        let rxDeg = 0
        let ryDeg = 0
        let posX = 68
        let posY = 45

        if (p <= 0.38) {
          // Continuous Steadicam Dolly
          const dollyP = Math.pow(p / 0.38, 3.6)
          frameScale = 1.00 + dollyP * (maxScale - 1.00)
          worldZ = WORLD_PUSH_Z_START
          worldY = 0
          centerYLerp = dollyP
          tz = dollyP * 190
          rxDeg = -0.35 * dollyP
          ryDeg = 0.25 * dollyP
          posX = 68
          posY = 45
        } else if (p > 0.38 && p < 0.48) {
          // Arrival hold (zero text, visitor admires $500M render)
          frameScale = maxScale
          worldZ = WORLD_PUSH_Z_START
          worldY = 0
          centerYLerp = 1.0
          tz = 190
          rxDeg = -0.35
          ryDeg = 0.25
          posX = 68
          posY = 45
        } else {
          // Post-arrival: camera holds perfectly steady — no parallax pan,
          // no object float, no independent building movement. The ONLY
          // thing that moves is a slow, continuous optical push (translateZ
          // under perspective — see .worldLayer), pure f(p) like everything
          // else: starts the instant the world is fully revealed and lands
          // on its final value exactly at p=1, so the Hero always hands off
          // from the same frame.
          frameScale = maxScale
          worldY = 0
          posX = 68
          posY = 45
          centerYLerp = 1.0
          tz = 190
          rxDeg = -0.35
          ryDeg = 0.25
          const pushP = (1 - Math.cos(remap(p, BREAKTHROUGH_COMPLETE_P, 1.0) * Math.PI)) / 2
          worldZ = WORLD_PUSH_Z_START + (WORLD_PUSH_Z_END - WORLD_PUSH_Z_START) * pushP
        }

        // NO ARTIFICIAL ON-SCREEN FADING:
        // Capsule border leaves viewport naturally. Opacity zeroes at p >= 0.39 after border is 100% off-screen.
        const targetCenterYPercent = 45 + centerYLerp * 5
        const outlineFade = remap(p, 0.39, 0.42)

        gsap.set(logoMarkRef.current, {
          top: `${targetCenterYPercent}%`,
          scale: frameScale,
          z: tz,
          rotateX: rxDeg,
          rotateY: ryDeg,
          opacity: Math.max(0, 1 - outlineFade),
        })

        // Master World Render — z is the optical camera push, pure f(p).
        // No scale anywhere on this element — perspective (see .worldLayer)
        // does the growth, the way a real lens does.
        gsap.set(portalImageRef.current, {
          z: worldZ,
          y: worldY,
          opacity: 1,
        })
        if (portalImageRef.current) {
          portalImageRef.current.style.objectPosition = `${posX.toFixed(2)}% ${posY.toFixed(2)}%`
        }
        gsap.set(videoRef.current, {
          opacity: 0,
        })

        // ── EDITORIAL LEFT TYPOGRAPHY STAGING ────────────────────────
        // Main Title SERENE HEIGHTS (p 0.48 → 0.62)
        const mainFade = remap(p, 0.48, 0.62)
        const mainX = -18 * (1 - easeInOutCubic(mainFade))
        gsap.set(titleMainRef.current, {
          opacity: mainFade,
          x: mainX,
        })

        // Subtitle Hotel & Residences · Nathia Gali (p 0.65 → 0.78)
        const subFade = remap(p, 0.65, 0.78)
        const subX = -12 * (1 - easeInOutCubic(subFade))
        gsap.set(titleSubRef.current, {
          opacity: subFade,
          x: subX,
        })

        // Explore CTA Indicator (p 0.82 → 0.95)
        const ctaFade = remap(p, 0.82, 0.95)
        const ctaX = -8 * (1 - easeInOutCubic(ctaFade))
        gsap.set(titleCtaRef.current, {
          opacity: ctaFade,
          x: ctaX,
          pointerEvents: ctaFade > 0.1 ? 'auto' : 'none',
        })

        // Publish the highest-faded element's opacity as the shared
        // typography state — Deconstruction reads this to know where
        // to start its own fade-out from, with no magic numbers.
        setHeroTypographyOpacity(Math.max(mainFade, subFade, ctaFade))

        // ── Video pre-start ───────────────────────────────────────
        if (p > 0.65 && !videoStarted.current && videoRef.current) {
          videoRef.current.play().catch(() => {})
          videoStarted.current = true
        }
      },
    })

    return () => {
      st.kill()
    }
  }, [])

  return (
    <section ref={heroRef} id="top" className={styles.hero}>

      {/* ── Fixed SVG Clip-Path Definition for Viewport Aperture ── */}
      <svg className={styles.clipDefs} aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="heroPortalClip" clipPathUnits="userSpaceOnUse">
            <rect ref={clipRectRef} />
          </clipPath>
        </defs>
      </svg>

      {/* ── Fullscreen World Layer (sits full-resolution behind everything) ── */}
      <div className={styles.worldLayer}>
        <img
          ref={portalImageRef}
          src={heroImageSrc}
          alt=""
          aria-hidden="true"
          className={styles.portalImage}
        />
        {/* Video crossfade target */}
        <video
          ref={videoRef}
          className={styles.heroVideo}
          muted
          playsInline
          loop
          preload="auto"
          aria-hidden="true"
        >
          <source
            src="/media/serene-heights/hero/deconstruction/Serene%20Heights%20V2.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark vignette inside viewport */}
        <div className={styles.portalOverlay} aria-hidden="true" />

      </div>

      {/* ── SVG Outline Frame (Inline SVG with vector-effect="non-scaling-stroke") ── */}
      <svg
        ref={logoMarkRef}
        viewBox="0 0 100 136"
        preserveAspectRatio="xMidYMid meet"
        className={styles.logoMark}
        aria-hidden="true"
      >
        {/* Outer Capsule Pill Frame */}
        <rect
          x="3"
          y="3"
          width="94"
          height="130"
          rx="47"
          ry="47"
          stroke="#C8A35A"
          strokeWidth="1.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        {/* Inset Double Line Contour */}
        <rect
          x="8"
          y="8"
          width="84"
          height="120"
          rx="42"
          ry="42"
          stroke="#C8A35A"
          strokeWidth="1.0"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        {/* Mountain Summit Outline */}
        <path
          d="M8 68C22 58 35 48 48 32L56 62L68 44L92 68V84C92 107.192 73.192 126 50 126C26.808 126 8 107.192 8 84V68Z"
          stroke="#C8A35A"
          strokeWidth="1.2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        {/* Peak Facet Contour Line */}
        <path
          d="M48 32L56 62L68 44L54 70Z"
          stroke="#C8A35A"
          strokeWidth="1.0"
          fill="none"
          opacity="0.8"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* ── Fullscreen Title Overlay (FINDD Editorial Layout) ── */}
      <div className={styles.fullTitleWrap} style={{ zIndex: 6 }}>
        <div className={styles.titleGlassBackdrop} aria-hidden="true" />
        <h1 ref={titleMainRef} className={styles.fullTitle}>
          <span className={styles.titleLine}>SERENE</span>
          <span className={styles.titleLine}>HEIGHTS</span>
        </h1>
        <p ref={titleSubRef} className={styles.fullSubtitle}>
          HOTEL &amp; RESIDENCES &nbsp;·&nbsp; NATHIA GALI
        </p>
        <div ref={titleCtaRef} className={styles.heroCtaWrap}>
          <div className={styles.subtitleDivider} aria-hidden="true" />
          <div className={styles.heroCtaGroup}>
            <div className={styles.heroCtaRow}>
              <span className={styles.heroCtaLabel}>EXPLORE RESIDENCES</span>
              <span className={styles.heroCtaArrow} aria-hidden="true">→</span>
            </div>
            <div className={styles.heroCtaLine} />
          </div>
        </div>
      </div>

      {/* ── Minimal Opening Brand Lockup below capsule (p 0.00 → 0.38) ── */}
      <div ref={brandLockupRef} className={styles.openingLockup} aria-hidden="true">
        <p className={styles.openingTitle}>Serene Heights</p>
        <p className={styles.openingSubtitle}>Hotel &amp; Residences · Nathia Gali</p>
      </div>

    </section>
  )
}
