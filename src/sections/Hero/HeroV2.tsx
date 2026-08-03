import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import logoSvg from '../../assets/branding/serene-heights-logo.svg'
import heroImageSrc from '../../assets/hero/scene-01-establish.png'
import styles from './HeroV2.module.css'

/**
 * HeroV2 — Phase 4 (SVG clip-path edition)
 *
 * ─── Key change from Phase 4 CSS edition ────────────────────────
 *
 * The portal clip is now driven by the ORIGINAL logo SVG geometry:
 *
 *   SVG viewBox: 0 0 100 136
 *   Capsule rect: x=3 y=3 w=94 h=130 rx=47 ry=47
 *     (rx=47 = exactly w/2 → perfect semicircular ends)
 *
 * A hidden <clipPath id="heroPortalClip"> contains a <rect> whose
 * attributes are updated every frame by GSAP:
 *
 *   onUpdate → computeClipAttrs(p) → gsap.set(clipRectRef, { attr: {...} })
 *
 * This is pure f(p), reversible, no CSS approximation.
 *
 * ─── Architecture invariants (unchanged) ─────────────────────────
 *
 *   ONE pinned section · ONE ScrollTrigger · ONE onUpdate
 *   No pub/sub · No tickers · No canvas · No extra render loops
 *
 * ─── Scroll timeline (runway: +=700%) ────────────────────────────
 *
 *   p  0.00 → 0.25   Window opens: logoFill opacity 1 → 0
 *                    Clip rect swells: logo size × 1.10
 *
 *   p  0.25 → 0.55   Portal expands: capsule rx/ry → 0, rect → viewport
 *                    logoMark opacity 1 → 0  (p 0.28 → 0.48)
 *                    content  opacity 1 → 0  (p 0.28 → 0.48)
 *                    scrollCue opacity 1 → 0 (p 0.00 → 0.18)
 *
 *   p  0.55 → 0.75   Fullscreen hold
 *                    fullTitleWrap opacity 0 → 1  (p 0.58 → 0.72)
 *
 *   p  0.75 → 0.90   Crossfade still → video
 *
 *   p  0.90 → 1.00   Video plays into Section 2
 *
 *   Ken Burns: heroImage.scale 1.00 → 1.08  (continuous)
 */

// ─── Logo dimensions (formula-based, matches CSS clamp) ──────────
// CSS: width: clamp(100px, 14vw, 200px), aspect-ratio: 100/136
// No DOM measurement needed — derived from vw at call time.

function logoNaturalW(vw: number): number {
  return Math.min(200, Math.max(100, vw * 0.14))
}

function logoNaturalH(w: number): number {
  return w * (136 / 100)
}

// ─── SVG capsule geometry constants (from the original SVG) ──────
//
// viewBox: 100 × 136
// Outer capsule rect: x=3, y=3, w=94, h=130, rx=47, ry=47
//   → rx/w = 47/94 = 0.5  (perfect semicircles)
//   → ry/h = 47/130 ≈ 0.3615
//
// As fractions of the LOGO element size (effW × effH):
const MARGIN_X  = 3  / 100   // left/right margin
const MARGIN_Y  = 3  / 136   // top/bottom margin
const CAPSULE_W = 94 / 100   // capsule width fraction
const CAPSULE_H = 130 / 136  // capsule height fraction
const RX_FRAC   = 47 / 100   // rx as fraction of effW (= capsuleW/2)
const RY_FRAC   = 47 / 136   // ry as fraction of effH

// ─── Clip rect attribute computation ────────────────────────────
//
// Returns the six <rect> attributes (x, y, width, height, rx, ry)
// that define the portal opening at scroll progress p.
//
// Phase 3 (p 0→0.25):  logo "swells" 1.0×→1.10×, fill fades out
// Phase 4a (p 0.25→0.55): capsule expands to fullscreen rectangle
//
// All values are pure functions of p, vw, vh — fully reversible.
//
function computeClipAttrs(
  p: number,
  vw: number,
  vh: number,
): Record<string, number> {
  const lw = logoNaturalW(vw)
  const lh = logoNaturalH(lw)

  // Phase 3: subtle logo swell as window opens
  const logoScaleP = Math.min(1, p / 0.25)         // 0→1 during p 0→0.25
  const logoScale  = 1 + logoScaleP * 0.10         // 1.00 → 1.10

  // Phase 4a: portal expansion
  const expandP = Math.max(0, Math.min(1, (p - 0.25) / 0.30))  // 0→1 during p 0.25→0.55

  // Effective logo visual size (with Phase 3 scale)
  const effW = lw * logoScale
  const effH = lh * logoScale

  // Capsule position at the current logo scale (centered in viewport)
  const startX  = (vw - effW) / 2 + MARGIN_X  * effW
  const startY  = (vh - effH) / 2 + MARGIN_Y  * effH
  const startW  = CAPSULE_W * effW
  const startH  = CAPSULE_H * effH
  const startRx = RX_FRAC   * effW   // = startW / 2 → perfect semicircles
  const startRy = RY_FRAC   * effH

  // Lerp from logo-sized capsule → fullscreen rectangle
  return {
    x:      startX  * (1 - expandP),
    y:      startY  * (1 - expandP),
    width:  startW  + (vw - startW) * expandP,
    height: startH  + (vh - startH) * expandP,
    rx:     startRx * (1 - expandP),
    ry:     startRy * (1 - expandP),
  }
}

// ─── Linear remap, clamped 0→1 ───────────────────────────────────
function remap(p: number, inMin: number, inMax: number): number {
  return Math.max(0, Math.min(1, (p - inMin) / (inMax - inMin)))
}

// ─── Component ───────────────────────────────────────────────────
export default function HeroV2() {
  // DOM refs
  const heroRef        = useRef<HTMLElement>(null)
  const heroImageRef   = useRef<HTMLImageElement>(null)
  const clipRectRef    = useRef<SVGRectElement>(null)  // the animated <rect> in <clipPath>
  const portalRef      = useRef<HTMLDivElement>(null)
  const portalImageRef = useRef<HTMLImageElement>(null)
  const logoFillRef    = useRef<HTMLDivElement>(null)
  const logoMarkRef    = useRef<HTMLImageElement>(null)
  const videoRef       = useRef<HTMLVideoElement>(null)
  const fullTitleRef   = useRef<HTMLDivElement>(null)
  const contentRef     = useRef<HTMLDivElement>(null)
  const scrollCueRef   = useRef<HTMLDivElement>(null)

  // Cached viewport dimensions — updated on resize via onRefresh
  const vwRef = useRef(window.innerWidth)
  const vhRef = useRef(window.innerHeight)

  // One-way video start flag (no direction dependency)
  const videoStarted = useRef(false)

  useLayoutEffect(() => {
    registerScrollTrigger()

    // ── Sync viewport cache ──────────────────────────────────
    vwRef.current = window.innerWidth
    vhRef.current = window.innerHeight

    // ── Initialise SVG clip rect to p=0 state ────────────────
    const initAttrs = computeClipAttrs(0, vwRef.current, vhRef.current)
    gsap.set(clipRectRef.current, { attr: initAttrs })

    // ── Initialise all layer states ───────────────────────────
    gsap.set(logoFillRef.current,    { opacity: 1 })
    gsap.set(logoMarkRef.current,    { opacity: 1 })
    gsap.set(portalImageRef.current, { opacity: 1 })
    gsap.set(videoRef.current,       { opacity: 0 })
    gsap.set(fullTitleRef.current,   { opacity: 0 })
    gsap.set(contentRef.current,     { opacity: 1 })
    gsap.set(scrollCueRef.current,   { opacity: 1 })
    gsap.set(heroImageRef.current,   { scale: 1 })

    // ── Single ScrollTrigger ──────────────────────────────────
    const st = ScrollTrigger.create({
      trigger: heroRef.current,
      start: 'top top',
      end: '+=700%',
      scrub: 1,
      pin: true,
      invalidateOnRefresh: true,

      onRefresh: () => {
        // Update cached viewport dimensions on resize
        vwRef.current = window.innerWidth
        vhRef.current = window.innerHeight
        // Re-apply clip at current progress (will be called before next onUpdate)
      },

      onUpdate: (self) => {
        const p  = self.progress
        const vw = vwRef.current
        const vh = vhRef.current

        // ── SVG clip rect ───────────────────────────────────────
        // The only property changed is the <rect> attributes.
        // clip-path: url(#heroPortalClip) stays static in CSS.
        gsap.set(clipRectRef.current, {
          attr: computeClipAttrs(p, vw, vh),
        })

        // ── Ken Burns background ────────────────────────────────
        gsap.set(heroImageRef.current, { scale: 1 + p * 0.08 })

        // ── Phase 3: green fill fades (p 0→0.25) ───────────────
        gsap.set(logoFillRef.current, { opacity: Math.max(0, 1 - remap(p, 0, 0.25)) })

        // ── Phase 4a: logo mark fades (p 0.28→0.48) ────────────
        gsap.set(logoMarkRef.current, { opacity: Math.max(0, 1 - remap(p, 0.28, 0.48)) })

        // ── Phase 4a: small content fades (p 0.28→0.48) ────────
        gsap.set(contentRef.current,  { opacity: Math.max(0, 1 - remap(p, 0.28, 0.48)) })

        // ── Scroll cue fades (p 0→0.18) ────────────────────────
        gsap.set(scrollCueRef.current, { opacity: Math.max(0, 1 - remap(p, 0, 0.18)) })

        // ── Phase 4b: fullscreen title fades in (p 0.58→0.72) ──
        gsap.set(fullTitleRef.current, { opacity: remap(p, 0.58, 0.72) })

        // ── Phase 4c: crossfade still → video (p 0.75→0.90) ────
        const xfade = remap(p, 0.75, 0.90)
        gsap.set(portalImageRef.current, { opacity: 1 - xfade })
        gsap.set(videoRef.current,        { opacity: xfade })

        // ── Video pre-start (one-way flag — no direction state) ─
        if (p > 0.65 && !videoStarted.current && videoRef.current) {
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

      {/* ── Hidden SVG: defines the portal clip path ─────────────
          clipPathUnits="userSpaceOnUse" → coordinates are in CSS
          pixels relative to the portal div's top-left (= viewport
          top-left during pin). The <rect> is updated by GSAP every
          scroll frame via its attr{} special prop.
      ─────────────────────────────────────────────────────────── */}
      <svg className={styles.clipDefs} aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="heroPortalClip" clipPathUnits="userSpaceOnUse">
            {/*
             * Initial attributes are set by useLayoutEffect before
             * first paint. The rect starts sized to the logo capsule
             * (matching the exact SVG geometry: rx/ry from the
             * original 100×136 viewBox) and expands to viewport.
             */}
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

      {/* ── Portal: clipped to the SVG logo capsule shape ─────── */}
      <div ref={portalRef} className={styles.portal}>

        {/* Still hero image inside the portal */}
        <img
          ref={portalImageRef}
          src={heroImageSrc}
          alt=""
          aria-hidden="true"
          className={styles.portalImage}
        />

        {/* Green fill — opaque until window opens */}
        <div ref={logoFillRef} className={styles.logoFill} aria-hidden="true" />

        {/*
         * Logo mark SVG — all paths fill="none", pure outline.
         * Visible as the window frame / mountain engraving.
         * Centred in the portal div (= centred in the viewport).
         * As the clip rect expands, this element scales visually
         * with it (it's inside the clipped area). Fades to 0 during
         * portal expansion.
         */}
        <img
          ref={logoMarkRef}
          src={logoSvg}
          alt="Serene Heights"
          className={styles.logoMark}
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

        {/* Dark vignette for fullscreen readability */}
        <div className={styles.portalOverlay} aria-hidden="true" />

        {/* Fullscreen title */}
        <div ref={fullTitleRef} className={styles.fullTitleWrap}>
          <h1 className={styles.fullTitle}>Serene Heights</h1>
          <p className={styles.fullSubtitle}>Hotel &amp; Residences &nbsp;·&nbsp; Nathia Gali</p>
        </div>

      </div>

      {/* ── Small decorative title below portal ──────────────── */}
      <div ref={contentRef} className={styles.content} aria-hidden="true">
        <p className={styles.smallTitle}>Serene Heights</p>
        <p className={styles.smallSubtitle}>Hotel &amp; Residences · Nathia Gali</p>
      </div>

      {/* ── Scroll cue ────────────────────────────────────────── */}
      <div ref={scrollCueRef} className={styles.scrollCue} aria-hidden="true">
        <span className={styles.scrollCueLine} />
        <span>Scroll</span>
      </div>

    </section>
  )
}
