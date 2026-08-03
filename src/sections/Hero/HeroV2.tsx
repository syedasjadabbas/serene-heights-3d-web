import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import logoSvg from '../../assets/branding/serene-heights-logo.svg'
import heroImageSrc from '../../assets/hero/scene-01-establish.png'
import styles from './HeroV2.module.css'

/**
 * HeroV2 — True Optical Camera Dolly & Viewport Aperture Entrance
 *
 * ─── Camera Dolly Physics ─────────────────────────────────────────
 *   - p 0.00 → 0.20: Static green opening hold (frameScale = 1.00, worldScale = 1.00).
 *   - p 0.20 → 0.45: Camera approaches glass.
 *                    Viewport frame stays 100% STATIONARY (frameScale = 1.00).
 *                    World behind window zooms forward (worldScale = 1.00 → 2.20).
 *                    Creates 100% optical illusion of walking toward a fixed window pane.
 *   - p 0.45 → 0.60: Passing through glass plane into open world.
 *                    Viewport aperture expands exponentially (Power-5) to fill screen.
 *                    World scale settles smoothly 2.20 → 1.00 (1:1 full bleed).
 *                    SVG outline frame dissolves ONLY after exceeding viewport bounds (p 0.585 → 0.60).
 *   - p 0.60 → 0.78: Fullscreen photograph appreciation hold (~1s scroll hold). Zero motion, zero text.
 *   - p 0.78 → 0.86: Title reveal.
 *   - p 0.86 → 0.92: Ken Burns zoom (worldScale = 1.00 → 1.03).
 *   - p 0.92 → 1.00: Invisible video crossfade.
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

function computeClipAttrs(
  p: number,
  vw: number,
  vh: number,
): Record<string, number> {
  const lw = logoNaturalW(vw)
  const lh = logoNaturalH(lw)

  const startW  = CAPSULE_W * lw
  const startH  = CAPSULE_H * lh
  const startRx = RX_FRAC   * lw
  const startRy = RY_FRAC   * lh

  const maxScale = Math.max(vw / startW, vh / startH) * 1.5

  const flyP        = remap(p, 0.45, 0.60)
  const exponentialP = Math.pow(flyP, 5) // Power-5 exponential aperture explosion

  let frameScale = 1.00
  if (p < 0.45) {
    frameScale = 1.00 // Window frame stays 100% stationary during camera approach
  } else if (p >= 0.45 && p < 0.60) {
    frameScale = 1.00 + exponentialP * (maxScale - 1.00) // Aperture expands to fullscreen
  } else {
    frameScale = maxScale
  }

  const centerYLerp   = remap(p, 0.45, 0.60)
  const targetCenterY = vh * 0.45 + centerYLerp * (vh * 0.50 - vh * 0.45)

  const currentW  = startW  * frameScale
  const currentH  = startH  * frameScale
  const currentRx = startRx * frameScale
  const currentRy = startRy * frameScale

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
  const logoMarkRef    = useRef<HTMLImageElement>(null)
  const brandLockupRef = useRef<HTMLDivElement>(null)
  const videoRef       = useRef<HTMLVideoElement>(null)
  const fullTitleRef   = useRef<HTMLDivElement>(null)

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
    gsap.set(logoMarkRef.current,    { opacity: 1, scale: 1 })
    gsap.set(brandLockupRef.current, { opacity: 1 })
    gsap.set(portalImageRef.current, { scale: 1, opacity: 1 })
    gsap.set(videoRef.current,       { opacity: 0 })
    gsap.set(fullTitleRef.current,   { opacity: 0 })

    // ── Single ScrollTrigger ──────────────────────────────────────
    const st = ScrollTrigger.create({
      trigger: heroRef.current,
      start: 'top top',
      end: '+=700%',
      scrub: 1,
      pin: true,
      invalidateOnRefresh: true,

      onRefresh: () => {
        vwRef.current = window.innerWidth
        vhRef.current = window.innerHeight
      },

      onUpdate: (self) => {
        const p  = self.progress
        const vw = vwRef.current
        const vh = vhRef.current

        const lw = logoNaturalW(vw)
        const lh = logoNaturalH(lw)

        const startW = CAPSULE_W * lw
        const startH = CAPSULE_H * lh
        const maxScale = Math.max(vw / startW, vh / startH) * 1.5

        // ── Minimal Opening Lockup Fade Out (p 0.20 → 0.38) ────────
        const lockupFade = remap(p, 0.20, 0.38)
        gsap.set(brandLockupRef.current, {
          opacity: Math.max(0, 1 - lockupFade),
        })

        // ── Viewport Clip Aperture (Uniform Capsule Scaling) ────────
        gsap.set(clipRectRef.current, {
          attr: computeClipAttrs(p, vw, vh),
        })

        // ── Camera Dolly Motion & World Scale ──────────────────────
        const approachP    = easeInOutCubic(remap(p, 0.20, 0.45))
        const flyP        = remap(p, 0.45, 0.60)
        const exponentialP = Math.pow(flyP, 5)
        const kbP          = remap(p, 0.86, 0.92)
        const xfade        = remap(p, 0.92, 1.00)

        let worldScale = 1.00
        let frameScale = 1.00

        if (p < 0.20) {
          worldScale = 1.00
          frameScale = 1.00
        } else if (p >= 0.20 && p < 0.45) {
          worldScale = 1.00 + approachP * 1.20       // 1.00 → 2.20 (world scales forward behind fixed window)
          frameScale = 1.00                          // Window frame stays 100% stationary!
        } else if (p >= 0.45 && p < 0.60) {
          worldScale = 2.20 - flyP * 1.20            // 2.20 → 1.00 (settles into 1:1 full bleed)
          frameScale = 1.00 + exponentialP * (maxScale - 1.00) // Power-5 expansion to fullscreen
        } else if (p >= 0.60 && p < 0.86) {
          worldScale = 1.00
          frameScale = maxScale
        } else if (p >= 0.86) {
          worldScale = 1.00 + kbP * 0.03             // 1.00 → 1.03 (Ken Burns)
          frameScale = maxScale
        }

        // SVG Outline Frame: scale matches clip-path aperture 1:1, lerps vertical center to 50%
        const centerYLerp   = remap(p, 0.45, 0.60)
        const targetCenterYPercent = 45 + centerYLerp * 5 // 45% -> 50%
        const outlineFade   = remap(p, 0.585, 0.60)

        gsap.set(logoMarkRef.current, {
          top: `${targetCenterYPercent}%`,
          scale: frameScale,
          opacity: Math.max(0, 1 - outlineFade),
        })

        gsap.set(portalImageRef.current, { scale: worldScale, opacity: 1 - xfade })
        gsap.set(videoRef.current,       { opacity: xfade })

        // ── p 0.78→0.86  Large title fades in (ONLY AFTER ~1s fullscreen hold) ──
        gsap.set(fullTitleRef.current, { opacity: remap(p, 0.78, 0.86) })

        // ── Video pre-start ───────────────────────────────────────
        if (p > 0.85 && !videoStarted.current && videoRef.current) {
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

      {/* ── SVG Outline Frame (attached to viewport aperture at 45% vh) ── */}
      <img
        ref={logoMarkRef}
        src={logoSvg}
        alt="Serene Heights Mountain Viewport"
        className={styles.logoMark}
      />

      {/* ── Fullscreen Title Overlay (fades in p 0.78→0.86) ── */}
      <div className={styles.fullTitleWrap} style={{ zIndex: 6 }}>
        <div ref={fullTitleRef} className={styles.fullTitleWrap}>
          <h1 className={styles.fullTitle}>Serene Heights</h1>
          <p className={styles.fullSubtitle}>Hotel &amp; Residences &nbsp;·&nbsp; Nathia Gali</p>
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
