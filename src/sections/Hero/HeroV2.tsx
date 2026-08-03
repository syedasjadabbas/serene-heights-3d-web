import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import logoSvg from '../../assets/branding/serene-heights-logo.svg'
import heroImageSrc from '../../assets/hero/scene-01-establish.png'
import styles from './HeroV2.module.css'

/**
 * HeroV2 — Phase 5 (cinematic timing)
 *
 * ─── Architecture (unchanged) ─────────────────────────────────────
 *
 *   ONE pinned section · ONE ScrollTrigger · ONE onUpdate
 *   SVG clipPath on the exact logo capsule geometry
 *   No pub/sub · No tickers · No canvas · No extra render loops
 *   Every animated property = pure f(scroll progress p)
 *
 * ─── Scroll timeline (runway: +=700%) ────────────────────────────
 *
 *   p  0.00 → 0.20   Logo phase
 *                    Solid green logo, small title below.
 *                    Clip rect = logo natural size (no swell).
 *
 *   p  0.20 → 0.40   Window phase
 *                    Green fill fades 1→0 (image appears through logo).
 *                    Clip rect swells ×1.0 → ×1.10.
 *
 *   p  0.40 → 0.60   Expansion phase
 *                    SVG capsule expands to fullscreen.
 *                    logoMark opacity  1→0  (p 0.44→0.56)
 *                    content  opacity  1→0  (p 0.44→0.56)
 *                    scrollCue opacity 1→0  (p 0.00→0.22)
 *
 *   p  0.60 → 0.72   Hold on fullscreen still image (no animation)
 *
 *   p  0.72 → 0.82   SERENE HEIGHTS + subtitle fade in
 *
 *   p  0.82 → 0.90   Ken Burns on still: portalImage scale 1.00→1.06
 *                    (photograph slowly "breathing")
 *
 *   p  0.90 → 1.00   Invisible crossfade still→video
 *                    portalImage opacity 1→0
 *                    heroVideo   opacity 0→1
 *                    Scale held at 1.06 — "photograph comes alive"
 *
 *   Background Ken Burns: heroImage.scale 1.00→1.04 (continuous, subtle)
 */

// ─── Logo dimensions (formula-based, matches CSS clamp) ──────────
// CSS: width: clamp(100px, 14vw, 200px), aspect-ratio: 100/136
function logoNaturalW(vw: number): number {
  return Math.min(200, Math.max(100, vw * 0.14))
}
function logoNaturalH(w: number): number {
  return w * (136 / 100)
}

// ─── SVG capsule geometry constants (from the original logo SVG) ──
//
// viewBox: 100 × 136
// Outer capsule: x=3 y=3 w=94 h=130 rx=47 ry=47
//   rx=47 = exactly w/2 → perfect semicircular ends
//
// As fractions of the logo element size (effW × effH):
const MARGIN_X  = 3  / 100   // left/right margin (3px out of 100)
const MARGIN_Y  = 3  / 136   // top/bottom margin  (3px out of 136)
const CAPSULE_W = 94 / 100   // capsule width fraction
const CAPSULE_H = 130 / 136  // capsule height fraction
const RX_FRAC   = 47 / 100   // rx as fraction of effW (= CAPSULE_W/2)
const RY_FRAC   = 47 / 136   // ry as fraction of effH

// ─── Clip rect attributes — pure f(p, vw, vh) ────────────────────
//
// p 0.00→0.20  Logo phase:    clip at logo natural size, no swell
// p 0.20→0.40  Window phase:  clip swells ×1.0 → ×1.10
// p 0.40→0.60  Expand phase:  capsule morphs to fullscreen rectangle
//
function computeClipAttrs(
  p: number,
  vw: number,
  vh: number,
): Record<string, number> {
  const lw = logoNaturalW(vw)
  const lh = logoNaturalH(lw)

  // Window phase swell: 0→1 during p 0.20→0.40 (logo phases has no swell)
  const swellP    = Math.max(0, Math.min(1, (p - 0.20) / 0.20))
  const logoScale = 1 + swellP * 0.10                           // 1.00 → 1.10

  // Expansion phase: 0→1 during p 0.40→0.60
  const expandP = Math.max(0, Math.min(1, (p - 0.40) / 0.20))

  // Effective logo visual size at current swell
  const effW = lw * logoScale
  const effH = lh * logoScale

  // Capsule rect position (centred in viewport, with SVG margin)
  const startX  = (vw - effW) / 2 + MARGIN_X  * effW
  const startY  = (vh - effH) / 2 + MARGIN_Y  * effH
  const startW  = CAPSULE_W * effW
  const startH  = CAPSULE_H * effH
  const startRx = RX_FRAC   * effW   // = startW/2 → perfect semicircles
  const startRy = RY_FRAC   * effH

  // Lerp: capsule → fullscreen rectangle (rx/ry shrink to 0)
  return {
    x:      startX  * (1 - expandP),
    y:      startY  * (1 - expandP),
    width:  startW  + (vw - startW) * expandP,
    height: startH  + (vh - startH) * expandP,
    rx:     startRx * (1 - expandP),
    ry:     startRy * (1 - expandP),
  }
}

// ─── Linear remap, output clamped 0→1 ────────────────────────────
function remap(p: number, inMin: number, inMax: number): number {
  return Math.max(0, Math.min(1, (p - inMin) / (inMax - inMin)))
}

// ─── Component ───────────────────────────────────────────────────
export default function HeroV2() {
  const heroRef        = useRef<HTMLElement>(null)
  const heroImageRef   = useRef<HTMLImageElement>(null)
  const clipRectRef    = useRef<SVGRectElement>(null)
  const portalRef      = useRef<HTMLDivElement>(null)
  const portalImageRef = useRef<HTMLImageElement>(null)
  const logoFillRef    = useRef<HTMLDivElement>(null)
  const logoMarkRef    = useRef<HTMLImageElement>(null)
  const videoRef       = useRef<HTMLVideoElement>(null)
  const fullTitleRef   = useRef<HTMLDivElement>(null)
  const contentRef     = useRef<HTMLDivElement>(null)
  const scrollCueRef   = useRef<HTMLDivElement>(null)

  // Viewport cache — updated on resize via onRefresh (not React state)
  const vwRef = useRef(window.innerWidth)
  const vhRef = useRef(window.innerHeight)

  // One-way video start flag — no direction dependency
  const videoStarted = useRef(false)

  useLayoutEffect(() => {
    registerScrollTrigger()

    // Sync viewport cache
    vwRef.current = window.innerWidth
    vhRef.current = window.innerHeight

    // Initialise SVG clip rect to p=0 state (before first paint)
    gsap.set(clipRectRef.current, {
      attr: computeClipAttrs(0, vwRef.current, vhRef.current),
    })

    // Deterministic initial layer states
    gsap.set(logoFillRef.current,    { opacity: 1 })
    gsap.set(logoMarkRef.current,    { opacity: 1 })
    gsap.set(portalImageRef.current, { scale: 1, opacity: 1 })
    gsap.set(videoRef.current,       { opacity: 0 })
    gsap.set(fullTitleRef.current,   { opacity: 0 })
    gsap.set(contentRef.current,     { opacity: 1 })
    gsap.set(scrollCueRef.current,   { opacity: 1 })
    gsap.set(heroImageRef.current,   { scale: 1 })

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

        // ── SVG clip rect ─────────────────────────────────────────
        // clip-path: url(#heroPortalClip) is static in CSS.
        // Only the <rect> attributes change — pure f(p).
        gsap.set(clipRectRef.current, {
          attr: computeClipAttrs(p, vw, vh),
        })

        // ── Background Ken Burns (subtle, continuous) ─────────────
        // Becomes irrelevant once portal is fullscreen at p=0.60.
        gsap.set(heroImageRef.current, { scale: 1 + p * 0.04 })

        // ── p 0.20→0.40  Window: green fill fades ─────────────────
        gsap.set(logoFillRef.current, {
          opacity: Math.max(0, 1 - remap(p, 0.20, 0.40)),
        })

        // ── p 0.44→0.56  Expansion: logo mark fades ───────────────
        gsap.set(logoMarkRef.current, {
          opacity: Math.max(0, 1 - remap(p, 0.44, 0.56)),
        })

        // ── p 0.44→0.56  Expansion: small content fades ───────────
        gsap.set(contentRef.current, {
          opacity: Math.max(0, 1 - remap(p, 0.44, 0.56)),
        })

        // ── p 0.00→0.22  Scroll cue fades ─────────────────────────
        gsap.set(scrollCueRef.current, {
          opacity: Math.max(0, 1 - remap(p, 0, 0.22)),
        })

        // ── p 0.72→0.82  Title fades in ───────────────────────────
        gsap.set(fullTitleRef.current, { opacity: remap(p, 0.72, 0.82) })

        // ── p 0.82→0.90  Ken Burns on still image ─────────────────
        // portalImage scale 1.00 → 1.06  (still "breathing")
        const kbP = remap(p, 0.82, 0.90)

        // ── p 0.90→1.00  Crossfade still → video ──────────────────
        // Scale is held at whatever kbP resolved to (1.06 after p=0.90).
        // Opacity dissolves the still as the video appears beneath.
        const xfade = remap(p, 0.90, 1.00)
        gsap.set(portalImageRef.current, {
          scale:   1 + kbP * 0.06,  // 1.00→1.06 then holds
          opacity: 1 - xfade,       // 1.00→0.00 during crossfade
        })
        gsap.set(videoRef.current, { opacity: xfade })

        // ── Video pre-start (one-way — no scroll direction state) ──
        // Fires once at p>0.80 so video is buffered before crossfade.
        if (p > 0.80 && !videoStarted.current && videoRef.current) {
          videoRef.current.play().catch(() => {/* silent: autoplay policy */})
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

      {/* ── Hidden SVG: portal clip-path definition ─────────────
          clipPathUnits="userSpaceOnUse" → coordinates in CSS px
          relative to the portal div (= viewport during pin).
          <rect> attributes are updated by GSAP each scroll frame.
      ──────────────────────────────────────────────────────── */}
      <svg className={styles.clipDefs} aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="heroPortalClip" clipPathUnits="userSpaceOnUse">
            <rect ref={clipRectRef} />
          </clipPath>
        </defs>
      </svg>

      {/* ── Background: Ken Burns still ──────────────────────── */}
      <div className={styles.imageWrap}>
        <img
          ref={heroImageRef}
          src={heroImageSrc}
          alt=""
          aria-hidden="true"
          className={styles.heroImage}
        />
      </div>

      {/* ── Portal: clipped to SVG logo capsule → fullscreen ──── */}
      <div ref={portalRef} className={styles.portal}>

        {/* Still hero image inside the portal */}
        <img
          ref={portalImageRef}
          src={heroImageSrc}
          alt=""
          aria-hidden="true"
          className={styles.portalImage}
        />

        {/* Green fill — opaque until window phase (p 0.20→0.40) */}
        <div ref={logoFillRef} className={styles.logoFill} aria-hidden="true" />

        {/* Logo mark SVG — fill="none" pure outline, acts as frame.
            Centred in viewport. Fades during expansion phase. */}
        <img
          ref={logoMarkRef}
          src={logoSvg}
          alt="Serene Heights"
          className={styles.logoMark}
        />

        {/* Video: crossfade target, opacity 0→1 at p 0.90→1.00 */}
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

        {/* Dark vignette inside portal for text legibility */}
        <div className={styles.portalOverlay} aria-hidden="true" />

        {/* Fullscreen title — fades in p 0.72→0.82 */}
        <div ref={fullTitleRef} className={styles.fullTitleWrap}>
          <h1 className={styles.fullTitle}>Serene Heights</h1>
          <p className={styles.fullSubtitle}>Hotel &amp; Residences &nbsp;·&nbsp; Nathia Gali</p>
        </div>

      </div>

      {/* ── Small decorative title below portal (p 0→0.56) ────── */}
      <div ref={contentRef} className={styles.content} aria-hidden="true">
        <p className={styles.smallTitle}>Serene Heights</p>
        <p className={styles.smallSubtitle}>Hotel &amp; Residences · Nathia Gali</p>
      </div>

      {/* ── Scroll cue (p 0→0.22) ─────────────────────────────── */}
      <div ref={scrollCueRef} className={styles.scrollCue} aria-hidden="true">
        <span className={styles.scrollCueLine} />
        <span>Scroll</span>
      </div>

    </section>
  )
}
