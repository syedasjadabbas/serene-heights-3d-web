/**
 * Section: Deconstruction (Masterplan Sequence)
 * Assets: src/assets/hero/
 */
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import { scrollToId } from '../../motion/lenis'
import { getHeroTypographyOpacity, setNavVisibilityProgress } from '../../components/stage/masterVisualStageState'
import { HERO_HOLD_PX } from '../Hero/HeroV2'
import heroImageSrc from '../../assets/hero/hero-main.webp'
import heroStyles from '../Hero/HeroV2.module.css'
import styles from './Deconstruction.module.css'

/**
 * Deconstruction — the deconstruction video as the fixed, global background
 * of the entire rest of the site: it never pins its own scroll distance
 * (position:fixed, zero layout height), it just sits behind Hero and every
 * section, driven by the page's own natural scroll from "Hero ends" to
 * "footer reached".
 *
 * ─── Continuity (unchanged) ───────────────────────────────────────
 *   The anchor is the Hero's OWN photo at opacity 1 the instant Hero's pin
 *   releases — pixel-identical handoff, then a short cross-dissolve into
 *   the live video (anchor still very slightly pushing in through the
 *   blend so motion never flat-lines and restarts).
 *
 * ─── Two progress values ──────────────────────────────────────────
 *   videoP  — 0 at Hero-end, 1 at the footer. Drives video.currentTime
 *             across the ENTIRE rest of the page, capped short of the
 *             clip's true final frame so ~10-15% of the structure is
 *             still standing by the time the footer is reached.
 *   localP  — 0 at Hero-end, 1 after a short fixed reference distance
 *             (LOCAL_REFERENCE_VH). Drives the crossfade, the navbar
 *             reveal, and the typography's fade-out — i.e. the SAME
 *             absolute-distance timing/feel as before, just no longer
 *             tied to a section that consumes its own scroll space.
 *
 * ─── Typography / navbar (unchanged mechanics) ────────────────────
 *   Reuses HeroV2's exact classes/content. .fullTitle/.fullSubtitle/
 *   .heroCtaWrap default to opacity:0 in the stylesheet (Hero overrides
 *   that via inline style on those exact elements) — this component sets
 *   opacity directly on those three refs, never on the outer wrapper,
 *   and never touches x/scale on them — perfectly static until the fade.
 *   Navbar: feeds the existing (otherwise-dormant) setHeroProgress() so
 *   Navigation's own built-in 0.78->0.84 fade-in fires the instant the
 *   crossfade completes. Navigation's own code is untouched.
 */

const VIDEO_SRC = '/media/serene-heights/hero/deconstruction/serene-heights-v2-scrub.mp4'
// Same 192 all-keyframe frames at 1280×720 (~12 MB instead of ~36 MB) for
// phones, small tablets and data-saver connections.
const VIDEO_SRC_SMALL = '/media/serene-heights/hero/deconstruction/serene-heights-v2-scrub-720.mp4'

function pickVideoSrc(): string {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  return saveData || window.matchMedia('(max-width: 900px)').matches ? VIDEO_SRC_SMALL : VIDEO_SRC
}

// How far into its own timeline the video is ever allowed to play, even at
// the footer — leaves ~13% of the clip (and so ~13% of the structure)
// unplayed/standing, per "don't let it fully disappear".
const VIDEO_PROGRESS_CAP = 0.87

// Fixed reference distance (independent of the new, much longer, whole-page
// video range) that the crossfade/navbar/typography-fade timing is keyed
// to — preserves their original absolute-distance feel from when this was
// a short, self-contained pinned section.
const LOCAL_REFERENCE_VH = 1.2

const CROSSFADE_LOCAL_P = 0.08        // Hero image -> video dissolve
const ANCHOR_PUSH_SCALE = 1.015       // tiny continued push on the anchor during the crossfade only
// Note: No TYPE_FADE constants here. Hero fades its own typography
// during the HERO_HOLD_PX appreciation hold, so by the time this
// section's ScrollTrigger fires, heroTypographyOpacity is already 0.


export default function Deconstruction() {
  const anchorRef     = useRef<HTMLImageElement>(null)
  const videoRef       = useRef<HTMLVideoElement>(null)
  const typeTitleRef   = useRef<HTMLHeadingElement>(null)
  const typeSubRef     = useRef<HTMLParagraphElement>(null)
  const typeCtaRef     = useRef<HTMLDivElement>(null)

  const pendingProgress = useRef(0)
  const rafIdRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    registerScrollTrigger()

    const video = videoRef.current
    video?.pause()

    // Initialise typography from the shared state — whatever opacity Hero left it at
    const initTypographyOpacity = getHeroTypographyOpacity()
    gsap.set(anchorRef.current, { opacity: 1, scale: 1 })
    gsap.set(videoRef.current,  { opacity: 0 })
    gsap.set([typeTitleRef.current, typeSubRef.current, typeCtaRef.current], {
      opacity: initTypographyOpacity,
      x: 0,
      visibility: initTypographyOpacity > 0.01 ? 'visible' : 'hidden',
      pointerEvents: 'none',
    })

    const ONE_FRAME_SEC = 1 / 30
    let lastSetTime = -1
    let isLoopRunning = false

    const updateVideoTime = () => {
      const v = videoRef.current
      if (
        v &&
        v.readyState >= 1 &&
        v.duration &&
        !isNaN(v.duration) &&
        isFinite(v.duration)
      ) {
        const targetTime = pendingProgress.current * VIDEO_PROGRESS_CAP * v.duration
        const diff = Math.abs(v.currentTime - targetTime)
        if (!v.seeking && diff >= ONE_FRAME_SEC && Math.abs(lastSetTime - targetTime) >= ONE_FRAME_SEC / 2) {
          v.currentTime = targetTime
          lastSetTime = targetTime
        }
        if (diff >= ONE_FRAME_SEC) {
          rafIdRef.current = requestAnimationFrame(updateVideoTime)
          return
        }
      }
      isLoopRunning = false
    }

    const requestVideoUpdate = () => {
      if (!isLoopRunning) {
        isLoopRunning = true
        rafIdRef.current = requestAnimationFrame(updateVideoTime)
      }
    }

    requestVideoUpdate()

    const onMetadata = () => {
      const v = videoRef.current
      if (v && v.readyState >= 1 && v.duration && !isNaN(v.duration) && isFinite(v.duration)) {
        const targetTime = pendingProgress.current * VIDEO_PROGRESS_CAP * v.duration
        v.currentTime = targetTime
        lastSetTime = targetTime
      }
    }

    // Last crossfade target from onUpdate — re-applied once the video has a
    // decoded frame, so the anchor photo never dissolves into an empty video.
    let lastCrossfade = 0
    const applyCrossfade = (crossfade: number) => {
      lastCrossfade = crossfade
      const v = videoRef.current
      const shown = v && v.readyState >= 2 ? crossfade : 0
      gsap.set(anchorRef.current, {
        opacity: 1 - shown,
        scale: 1 + (ANCHOR_PUSH_SCALE - 1) * crossfade,
      })
      gsap.set(videoRef.current, { opacity: shown })
    }
    const onFrameReady = () => {
      onMetadata()
      applyCrossfade(lastCrossfade)
    }

    video?.addEventListener('loadedmetadata', onMetadata)
    video?.addEventListener('loadeddata', onFrameReady)

    // The video only appears after the Hero's full pinned runway, so don't
    // spend bandwidth on it during first paint: start the download on the
    // visitor's first scroll (or straight away if the page opens scrolled).
    let loadStarted = false
    const startLoading = () => {
      if (loadStarted || !video) return
      loadStarted = true
      window.removeEventListener('scroll', startLoading)
      video.src = pickVideoSrc()
      video.load()
    }
    if (window.scrollY > 0) startLoading()
    else window.addEventListener('scroll', startLoading, { passive: true })

    const heroEndPx = () => {
      const heroEl = document.getElementById('top')
      return heroEl ? heroEl.offsetTop + heroEl.offsetHeight * 2 + HERO_HOLD_PX : 0
    }

    const st = ScrollTrigger.create({
      start: heroEndPx,
      end: 'max',
      scrub: 0.6,
      invalidateOnRefresh: true,

      onUpdate: (self) => {
        const videoP = self.progress
        pendingProgress.current = videoP
        requestVideoUpdate()

        const currentScroll = window.scrollY
        const hEnd = heroEndPx()
        const scrollPastHero = Math.max(0, currentScroll - hEnd)
        const localSpanPx = window.innerHeight * LOCAL_REFERENCE_VH
        const localP = Math.min(1, scrollPastHero / localSpanPx)

        // Hero image -> video dissolve, right at the handoff
        if (localP > 0) startLoading()
        applyCrossfade(Math.min(1, localP / CROSSFADE_LOCAL_P))

        // ── Navbar reveal
        const navReveal = Math.min(1, localP / 0.25)
        setNavVisibilityProgress(navReveal)

        // ── Typography
        const typographyOpacity = getHeroTypographyOpacity()
        gsap.set([typeTitleRef.current, typeSubRef.current, typeCtaRef.current], {
          opacity: typographyOpacity,
          visibility: typographyOpacity > 0.01 ? 'visible' : 'hidden',
          pointerEvents: 'none',
        })
      },
    })

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
      st.kill()
      window.removeEventListener('scroll', startLoading)
      video?.removeEventListener('loadedmetadata', onMetadata)
      video?.removeEventListener('loadeddata', onFrameReady)
    }
  }, [])

  return (
    <div className={styles.section}>
      <div className={styles.stage}>
        <img
          ref={anchorRef}
          src={heroImageSrc}
          alt=""
          aria-hidden="true"
          className={styles.heroAnchor}
        />
        <video
          ref={videoRef}
          className={styles.videoLayer}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      </div>

      {/* Static typography — identical markup/classes to HeroV2's resting
          state, so it reads as "the same text, still there" over the video. */}
      <div className={heroStyles.fullTitleWrap} style={{ zIndex: 6 }}>
        <h1 ref={typeTitleRef} className={heroStyles.fullTitle}>
          <span className={heroStyles.titleLine}>SERENE</span>
          <span className={heroStyles.titleLine}>HEIGHTS</span>
        </h1>
        <p ref={typeSubRef} className={heroStyles.fullSubtitle}>
          HOTEL &amp; RESIDENCES &nbsp;·&nbsp; NATHIA GALI
        </p>
        <div ref={typeCtaRef} className={heroStyles.heroCtaWrap}>
          <div className={heroStyles.subtitleDivider} aria-hidden="true" />
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault()
              scrollToId('about')
            }}
            className={heroStyles.heroCtaGroup}
            style={{ cursor: 'pointer', textDecoration: 'none' }}
          >
            <div className={heroStyles.heroCtaRow}>
              <span className={heroStyles.heroCtaLabel}>EXPLORE RESIDENCES</span>
              <span className={heroStyles.heroCtaArrow} aria-hidden="true">→</span>
            </div>
            <div className={heroStyles.heroCtaLine} />
          </a>
        </div>
      </div>
    </div>
  )
}
