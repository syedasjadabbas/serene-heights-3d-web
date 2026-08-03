import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import logoSvg from '../../assets/branding/serene-heights-logo.svg'
import heroImageSrc from '../../assets/hero/scene-01-establish.png'
import styles from './HeroV2.module.css'

/**
 * HeroV2 — Phase 5 (Official White Brand Logo Transformation)
 *
 * ─── Scroll Timeline (runway: +=700%) ────────────────────────────
 *
 *   p 0.00 → 0.20   Initial Hold
 *                   Full-screen deep green background (#0a1410).
 *                   Solid white official brand logo badge with crisp black outline
 *                   & mountain mark, small brand lockup below. 100% static hold.
 *
 *   p 0.20 → 0.40   Window Reveal Phase
 *                   White interior fill dissolves 1→0, revealing hero photograph
 *                   ONLY inside the logo window. Black outline & mountain mark
 *                   remain visible like an airplane window frame. Clip swells 1.0x → 1.10x.
 *
 *   p 0.40 → 0.60   Portal Expansion Phase
 *                   SVG logo capsule expands to fill viewport (rx/ry→0, rect→fullscreen).
 *                   Logo mark & small lockup fade out (p 0.44→0.56).
 *                   Portal reaches 100% fullscreen at p = 0.60.
 *
 *   p 0.60 → 0.78   Fullscreen Still Hold
 *                   Clean fullscreen photograph. Zero animation, no title.
 *
 *   p 0.78 → 0.86   Title Reveal
 *                   Large SERENE HEIGHTS title fades in.
 *
 *   p 0.86 → 0.92   Subtle Ken Burns Zoom
 *                   portalImage scale 1.00 → 1.03.
 *
 *   p 0.92 → 1.00   Invisible Video Crossfade
 *                   portalImage opacity 1→0, heroVideo opacity 0→1.
 *                   Scale held at 1.03 — photograph comes alive.
 *
 * ─── Architecture Invariants ──────────────────────────────────────
 *   ONE pinned section · ONE ScrollTrigger · ONE onUpdate
 *   SVG clipPath on exact logo capsule geometry
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

function computeClipAttrs(
  p: number,
  vw: number,
  vh: number,
): Record<string, number> {
  const lw = logoNaturalW(vw)
  const lh = logoNaturalH(lw)

  // p 0.00→0.20: Initial Hold (clip is natural logo capsule size)
  // p 0.20→0.40: Window Phase (clip swells 1.0x → 1.10x)
  const swellP    = Math.max(0, Math.min(1, (p - 0.20) / 0.20))
  const logoScale = 1 + swellP * 0.10

  // p 0.40→0.60: Portal Expansion (capsule → fullscreen rectangle)
  const expandP = Math.max(0, Math.min(1, (p - 0.40) / 0.20))

  const effW = lw * logoScale
  const effH = lh * logoScale

  const startX  = (vw - effW) / 2 + MARGIN_X  * effW
  const startY  = (vh - effH) / 2 + MARGIN_Y  * effH
  const startW  = CAPSULE_W * effW
  const startH  = CAPSULE_H * effH
  const startRx = RX_FRAC   * effW
  const startRy = RY_FRAC   * effH

  return {
    x:      startX  * (1 - expandP),
    y:      startY  * (1 - expandP),
    width:  startW  + (vw - startW) * expandP,
    height: startH  + (vh - startH) * expandP,
    rx:     startRx * (1 - expandP),
    ry:     startRy * (1 - expandP),
  }
}

function remap(p: number, inMin: number, inMax: number): number {
  return Math.max(0, Math.min(1, (p - inMin) / (inMax - inMin)))
}

export default function HeroV2() {
  const heroRef        = useRef<HTMLElement>(null)
  const clipRectRef    = useRef<SVGRectElement>(null)
  const portalRef      = useRef<HTMLDivElement>(null)
  const portalImageRef = useRef<HTMLImageElement>(null)
  const logoFillRef    = useRef<HTMLDivElement>(null)
  const logoMarkRef    = useRef<HTMLImageElement>(null)
  const videoRef       = useRef<HTMLVideoElement>(null)
  const fullTitleRef   = useRef<HTMLDivElement>(null)
  const contentRef     = useRef<HTMLDivElement>(null)
  const scrollCueRef   = useRef<HTMLDivElement>(null)

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
    gsap.set(logoFillRef.current,    { opacity: 1 })
    gsap.set(logoMarkRef.current,    { opacity: 1 })
    gsap.set(portalImageRef.current, { scale: 1, opacity: 1 })
    gsap.set(videoRef.current,       { opacity: 0 })
    gsap.set(fullTitleRef.current,   { opacity: 0 })
    gsap.set(contentRef.current,     { opacity: 1 })
    gsap.set(scrollCueRef.current,   { opacity: 1 })

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
        gsap.set(clipRectRef.current, {
          attr: computeClipAttrs(p, vw, vh),
        })

        // ── p 0.20→0.40  Window phase: green fill fades to reveal image ──
        gsap.set(logoFillRef.current, {
          opacity: Math.max(0, 1 - remap(p, 0.20, 0.40)),
        })

        // ── p 0.44→0.56  Expansion phase: logo mark & small lockup fade out ──
        gsap.set(logoMarkRef.current, {
          opacity: Math.max(0, 1 - remap(p, 0.44, 0.56)),
        })
        gsap.set(contentRef.current, {
          opacity: Math.max(0, 1 - remap(p, 0.44, 0.56)),
        })

        // ── p 0.20→0.35  Scroll cue fades out (staying 1.0 during 0.00-0.20) ──
        gsap.set(scrollCueRef.current, {
          opacity: Math.max(0, 1 - remap(p, 0.20, 0.35)),
        })

        // ── p 0.60→0.78  Fullscreen still hold (clean picture, no title) ──

        // ── p 0.78→0.86  Large title fades in (after portal expansion) ──
        gsap.set(fullTitleRef.current, { opacity: remap(p, 0.78, 0.86) })

        // ── p 0.86→0.92  Subtle Ken Burns zoom on still image (1.00 → 1.03) ──
        const kbP = remap(p, 0.86, 0.92)

        // ── p 0.92→1.00  Seamless crossfade still → preloaded video ──
        const xfade = remap(p, 0.92, 1.00)
        gsap.set(portalImageRef.current, {
          scale:   1 + kbP * 0.03,  // 1.00 → 1.03
          opacity: 1 - xfade,       // 1.00 → 0.00
        })
        gsap.set(videoRef.current, { opacity: xfade })

        // ── Video pre-start (starts at p > 0.85 so video is preloaded) ──
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

      {/* ── Hidden SVG: portal clip-path definition ───────────── */}
      <svg className={styles.clipDefs} aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="heroPortalClip" clipPathUnits="userSpaceOnUse">
            <rect ref={clipRectRef} />
          </clipPath>
        </defs>
      </svg>

      {/* ── Portal: clipped to SVG logo capsule → expands to fullscreen ──── */}
      <div ref={portalRef} className={styles.portal}>

        {/* Still hero image inside portal */}
        <img
          ref={portalImageRef}
          src={heroImageSrc}
          alt=""
          aria-hidden="true"
          className={styles.portalImage}
        />

        {/* Green fill — opaque until window phase (p 0.20→0.40) */}
        <div ref={logoFillRef} className={styles.logoFill} aria-hidden="true" />

        {/* Logo mark SVG — gold outline frame, centred in portal */}
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

        {/* Dark vignette inside portal */}
        <div className={styles.portalOverlay} aria-hidden="true" />

        {/* Fullscreen title — fades in p 0.78→0.86 */}
        <div ref={fullTitleRef} className={styles.fullTitleWrap}>
          <h1 className={styles.fullTitle}>Serene Heights</h1>
          <p className={styles.fullSubtitle}>Hotel &amp; Residences &nbsp;·&nbsp; Nathia Gali</p>
        </div>

      </div>

      {/* ── Small brand lockup below logo (p 0→0.56) ────────────── */}
      <div ref={contentRef} className={styles.content} aria-hidden="true">
        <p className={styles.smallTitle}>Serene Heights</p>
        <p className={styles.smallSubtitle}>Hotel &amp; Residences · Nathia Gali</p>
      </div>

      {/* ── Scroll cue (p 0→0.35) ─────────────────────────────── */}
      <div ref={scrollCueRef} className={styles.scrollCue} aria-hidden="true">
        <span className={styles.scrollCueLine} />
        <span>Scroll</span>
      </div>

    </section>
  )
}
