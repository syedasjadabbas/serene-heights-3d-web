import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import logoPng from '../../assets/branding/serene-heights-logo.png'
import logoSvg from '../../assets/branding/serene-heights-logo.svg'
import heroImageSrc from '../../assets/hero/scene-01-establish.png'
import styles from './HeroV2.module.css'

/**
 * HeroV2 — Minimal Opening & Airplane Window Camera Fly-Through
 *
 * ─── Opening Frame ────────────────────────────────────────────────
 *   - Deep green background (#0a1410).
 *   - Official mountain logo capsule emblem ONLY.
 *   - REMOVED COMPLETELY: All titles, subtitles, "Lahore", scroll text,
 *     small lockups. Ultra-minimal, silent, luxury opening.
 *
 * ─── Airplane Window Fly-Through ─────────────────────────────────
 *   - Logo remains almost fixed on screen (slight perspective creep scale 1.00 → 1.05).
 *   - Interior reveals the resort photograph inside the window.
 *   - Camera moves toward the window (photograph zooms 1.00 → 1.35 inside frame).
 *   - Camera passes THROUGH the logo window plane (clip-path expands to fullscreen).
 *   - Logo naturally dissolves as camera enters the resort world.
 *   - ONLY AFTER entering the world does the large SERENE HEIGHTS title fade in.
 *
 * ─── Timeline (runway: +=700%) ────────────────────────────────────
 *   p 0.00 → 0.20   Static Green Opening & Minimal Logo Hold
 *                   Full-screen deep green background (#0a1410).
 *                   Original logo asset (serene-heights-logo.png) ONLY.
 *                   100% static hold. Zero typography.
 *
 *   p 0.18 → 0.24   Invisible Logo Handoff (150–200ms crossfade)
 *                   PNG logo (officialLogoRef) crossfades 1→0 into SVG clip window.
 *
 *   p 0.20 → 0.40   Airplane Window Camera Approach
 *                   Window frame stays anchored in screen space.
 *                   Photograph behind logo zooms forward (scale 1.00 → 1.35).
 *                   Simulates camera walking toward the glass window.
 *
 *   p 0.40 → 0.60   Camera Fly-Through Window Plane
 *                   SVG clip-path expands from capsule → fullscreen.
 *                   Photograph passes through glass plane (scale 1.35 → 1.00).
 *                   Logo outline dissolves as camera steps into resort world (p 0.48→0.58).
 *                   Reaches full-screen resort landscape at p = 0.60.
 *
 *   p 0.60 → 0.78   Fullscreen Photograph Hold
 *                   Clean fullscreen resort landscape (scale 1.00). Zero text, zero movement.
 *
 *   p 0.78 → 0.86   Title Reveal (Only After Entering World)
 *                   Large SERENE HEIGHTS title fades in.
 *
 *   p 0.86 → 0.92   Subtle Ken Burns Zoom
 *                   portalImage scale 1.00 → 1.03.
 *
 *   p 0.92 → 1.00   Invisible Video Crossfade
 *                   portalImage opacity 1→0, heroVideo opacity 0→1.
 *                   Photograph comes alive.
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

  // p 0.00→0.40: Window frame stays anchored at natural logo capsule size (expandP = 0)
  // p 0.40→0.60: Aperture expansion as camera passes through window frame
  const expandP = Math.max(0, Math.min(1, (p - 0.40) / 0.20))

  const effW = lw
  const effH = lh

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
  const heroRef         = useRef<HTMLElement>(null)
  const clipRectRef     = useRef<SVGRectElement>(null)
  const portalRef       = useRef<HTMLDivElement>(null)
  const portalImageRef  = useRef<HTMLImageElement>(null)
  const officialLogoRef = useRef<HTMLImageElement>(null)
  const logoMarkRef     = useRef<HTMLImageElement>(null)
  const videoRef        = useRef<HTMLVideoElement>(null)
  const fullTitleRef    = useRef<HTMLDivElement>(null)

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
    gsap.set(officialLogoRef.current,{ opacity: 1, scale: 1 })
    gsap.set(logoMarkRef.current,    { opacity: 1, scale: 1 })
    gsap.set(portalImageRef.current, { scale: 1.00, opacity: 1 })
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

        // ── SVG clip rect ─────────────────────────────────────────
        gsap.set(clipRectRef.current, {
          attr: computeClipAttrs(p, vw, vh),
        })

        // ── p 0.18→0.24  Invisible Handoff: PNG logo crossfades to SVG clip ──
        gsap.set(officialLogoRef.current, {
          opacity: Math.max(0, 1 - remap(p, 0.18, 0.24)),
        })

        // ── Logo Frame Perspective (anchored on screen, slight perspective creep) ──
        // p 0.20 → 0.40: logo stays almost fixed on screen (scale 1.00 → 1.05)
        // p 0.40 → 0.60: logo outline dissolves naturally as camera passes through (opacity 1→0)
        const frameCreepP = remap(p, 0.20, 0.40)
        gsap.set(logoMarkRef.current, {
          scale: 1.00 + frameCreepP * 0.05,
          opacity: Math.max(0, 1 - remap(p, 0.48, 0.58)),
        })

        // ── p 0.78→0.86  Large title fades in (ONLY AFTER entering resort world) ──
        gsap.set(fullTitleRef.current, { opacity: remap(p, 0.78, 0.86) })

        // ── Camera Motion Profile (Airplane Window Fly-Through) ────
        // p 0.00 → 0.20: scale = 1.00 (static hold)
        // p 0.20 → 0.40: scale = 1.00 → 1.35 (camera moves forward toward window glass pane)
        // p 0.40 → 0.60: scale = 1.35 → 1.00 (camera passes through window plane into resort landscape)
        // p 0.60 → 0.86: scale = 1.00 (motion stops completely, clean still hold & title reveal)
        // p 0.86 → 0.92: scale = 1.00 → 1.03 (subtle Ken Burns zoom)
        // p 0.92 → 1.00: scale = 1.03 (held during video crossfade)
        const approachP = remap(p, 0.20, 0.40)
        const flyP      = remap(p, 0.40, 0.60)
        const kbP       = remap(p, 0.86, 0.92)
        const xfade     = remap(p, 0.92, 1.00)

        let imageScale = 1.00
        if (p >= 0.20 && p < 0.40) {
          imageScale = 1.00 + approachP * 0.35 // 1.00 → 1.35 (approaching glass)
        } else if (p >= 0.40 && p < 0.60) {
          imageScale = 1.35 - flyP * 0.35      // 1.35 → 1.00 (passing through window)
        } else if (p >= 0.60 && p < 0.86) {
          imageScale = 1.00
        } else if (p >= 0.86) {
          imageScale = 1.00 + kbP * 0.03       // 1.00 → 1.03
        }

        gsap.set(portalImageRef.current, {
          scale:   imageScale,
          opacity: 1 - xfade,
        })
        gsap.set(videoRef.current, { opacity: xfade })

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

      {/* ── Official PNG Brand Logo (Opening Hold - Minimal, No Text) ── */}
      <img
        ref={officialLogoRef}
        src={logoPng}
        alt="Serene Heights"
        className={styles.officialLogo}
      />

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

        {/* SVG logo mark — outline frame inside window */}
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

        {/* Fullscreen title — fades in p 0.78→0.86 ONLY AFTER entering resort world */}
        <div ref={fullTitleRef} className={styles.fullTitleWrap}>
          <h1 className={styles.fullTitle}>Serene Heights</h1>
          <p className={styles.fullSubtitle}>Hotel &amp; Residences &nbsp;·&nbsp; Nathia Gali</p>
        </div>

      </div>

    </section>
  )
}
