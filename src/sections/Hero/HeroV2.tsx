import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import logoSvg from '../../assets/branding/serene-heights-logo.svg'
import heroImageSrc from '../../assets/hero/scene-01-establish.png'
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

  // 12.0x multiplier guarantees all inner mountain lines & borders are 100% off-screen by p = 0.57
  const maxScale = Math.max(vw / startW, vh / startH) * 12.0

  const approachP    = easeInOutCubic(remap(p, 0.20, 0.45))
  const flyP        = remap(p, 0.45, 0.57) // Completes passage by p = 0.57
  const exponentialP = Math.pow(flyP, 2.5)

  let frameScale = 1.00
  if (p < 0.20) {
    frameScale = 1.00
  } else if (p >= 0.20 && p < 0.45) {
    frameScale = 1.00 + approachP * 0.40 // Capsule window occupies more vision (1.00 → 1.40)
  } else if (p >= 0.45 && p < 0.57) {
    frameScale = 1.40 + exponentialP * (maxScale - 1.40) // 3D Camera dolly forward through window
  } else {
    frameScale = maxScale
  }

  const centerYLerp   = remap(p, 0.45, 0.57)
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
        const maxScale = Math.max(vw / startW, vh / startH) * 12.0

        // ── Minimal Opening Lockup Fade Out (p 0.20 → 0.38) ────────
        const lockupFade = remap(p, 0.20, 0.38)
        gsap.set(brandLockupRef.current, {
          opacity: Math.max(0, 1 - lockupFade),
        })

        // ── Viewport Clip Aperture (Uniform Capsule Scaling) ────────
        gsap.set(clipRectRef.current, {
          attr: computeClipAttrs(p, vw, vh),
        })

        // ── Camera Motion & Single World Stability Profile ────────
        // Phase 1 (p 0.20 → 0.45): window occupies more field of view (frameScale = 1.00 → 1.40).
        //                          worldScale stays STRICTLY at 1.00 (building inside glass does NOT zoom!).
        // Phase 2 (p 0.45 → 0.57): 3D camera dolly forward through window plane (frameScale = 1.40 → maxScale).
        //                          ALL capsule edges & mountain lines move 100% outside viewport by p = 0.57.
        //                          worldScale stays STRICTLY at 1.00!
        // Phase 3 (p 0.60 → 0.78): SAME fullscreen landscape already active (worldScale = 1.00). Zero jump/pop/replacement.
        // Phase 4 (p 0.78 → 0.86): title reveal.
        // Phase 5 (p 0.86 → 0.92): Ken Burns zoom (worldScale = 1.00 → 1.03).
        // Phase 6 (p 0.92 → 1.00): invisible video crossfade.
        const approachP    = easeInOutCubic(remap(p, 0.20, 0.45))
        const flyP        = remap(p, 0.45, 0.57)
        const exponentialP = Math.pow(flyP, 2.5)
        const kbP          = remap(p, 0.86, 0.92)
        const xfade        = remap(p, 0.92, 1.00)

        let frameScale = 1.00
        let worldScale = 1.00

        if (p < 0.20) {
          frameScale = 1.00
          worldScale = 1.00
        } else if (p >= 0.20 && p < 0.45) {
          frameScale = 1.00 + approachP * 0.40  // Capsule window occupies more field of view (1.00 → 1.40)
          worldScale = 1.00                     // Content inside window stays 100% visually stable!
        } else if (p >= 0.45 && p < 0.57) {
          frameScale = 1.40 + exponentialP * (maxScale - 1.40) // 3D Camera dolly forward through window
          worldScale = 1.00                     // World layer stays 1.00!
        } else if (p >= 0.57 && p < 0.86) {
          frameScale = maxScale
          worldScale = 1.00
        } else if (p >= 0.86) {
          frameScale = maxScale
          worldScale = 1.00 + kbP * 0.03        // Ken Burns zoom (1.00 → 1.03)
        }

        // SVG Outline Frame: scale matches clip-path aperture 1:1
        // By p = 0.57, maxScale * 12.0 has already pushed ALL border lines & mountain vectors 100% outside the viewport bounds.
        // Dissolve the SVG outline strictly during p 0.57 → 0.58 when it is ALREADY completely off-screen!
        const centerYLerp   = remap(p, 0.45, 0.57)
        const targetCenterYPercent = 45 + centerYLerp * 5 // 45% -> 50%
        const outlineFade   = remap(p, 0.57, 0.58)

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
