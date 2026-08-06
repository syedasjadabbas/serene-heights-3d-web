/**
 * Section: Deconstruction (Masterplan Sequence)
 * Assets: src/assets/hero/
 */
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import { setHeroProgress, getHeroTypographyOpacity } from '../../components/stage/masterVisualStageState'
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
const NAV_REVEAL_LOCAL_START = CROSSFADE_LOCAL_P
const NAV_REVEAL_LOCAL_END   = CROSSFADE_LOCAL_P + 0.05
// Note: No TYPE_FADE constants here. Hero fades its own typography
// during the HERO_HOLD_PX appreciation hold, so by the time this
// section's ScrollTrigger fires, heroTypographyOpacity is already 0.

function remap(p: number, inMin: number, inMax: number): number {
  return Math.max(0, Math.min(1, (p - inMin) / (inMax - inMin)))
}

export default function Deconstruction() {
  const anchorRef     = useRef<HTMLImageElement>(null)
  const videoRef       = useRef<HTMLVideoElement>(null)
  const typeTitleRef   = useRef<HTMLHeadingElement>(null)
  const typeSubRef     = useRef<HTMLParagraphElement>(null)
  const typeCtaRef     = useRef<HTMLDivElement>(null)

  const videoReady      = useRef(false)
  const pendingProgress = useRef(0)

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

    const applyVideoTime = (p: number) => {
      pendingProgress.current = p
      if (video && videoReady.current && video.duration) {
        video.currentTime = p * VIDEO_PROGRESS_CAP * video.duration
      }
    }

    const onLoadedMetadata = () => {
      videoReady.current = true
      applyVideoTime(pendingProgress.current)
    }
    video?.addEventListener('loadedmetadata', onLoadedMetadata)
    video?.load()

    const heroEndPx = () => {
      const heroEl = document.getElementById('top')
      return heroEl ? heroEl.offsetTop + heroEl.offsetHeight * 2 + HERO_HOLD_PX : 0
    }

    const st = ScrollTrigger.create({
      start: heroEndPx,
      end: () => ScrollTrigger.maxScroll(window),
      scrub: 0.6,
      invalidateOnRefresh: true,

      onUpdate: (self) => {
        const videoP = self.progress

        const localSpanPx = window.innerHeight * LOCAL_REFERENCE_VH
        const localP = Math.min(1, (self.progress * (self.end - self.start)) / localSpanPx)

        // Hero image -> video dissolve, right at the handoff — Hero is
        // already fully off-screen by the time this fires.
        const crossfade = Math.min(1, localP / CROSSFADE_LOCAL_P)
        gsap.set(anchorRef.current, {
          opacity: 1 - crossfade,
          scale: 1 + (ANCHOR_PUSH_SCALE - 1) * crossfade,
        })
        gsap.set(videoRef.current, { opacity: crossfade })

        applyVideoTime(videoP)

        // Navbar — only once inside the video, never during the Hero.
        const navP = remap(localP, NAV_REVEAL_LOCAL_START, NAV_REVEAL_LOCAL_END)
        setHeroProgress(0.78 + navP * 0.06)

        // ── Typography: Hero has already faded this to 0 during HERO_HOLD_PX.
        // Sync from shared state — always 0 when Deconstruction is active.
        const typographyOpacity = getHeroTypographyOpacity()
        gsap.set([typeTitleRef.current, typeSubRef.current, typeCtaRef.current], {
          opacity: typographyOpacity,
          visibility: typographyOpacity > 0.01 ? 'visible' : 'hidden',
          pointerEvents: 'none',
        })
      },
    })

    return () => {
      st.kill()
      video?.removeEventListener('loadedmetadata', onLoadedMetadata)
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
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
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
          <div className={heroStyles.heroCtaGroup}>
            <div className={heroStyles.heroCtaRow}>
              <span className={heroStyles.heroCtaLabel}>EXPLORE RESIDENCES</span>
              <span className={heroStyles.heroCtaArrow} aria-hidden="true">→</span>
            </div>
            <div className={heroStyles.heroCtaLine} />
          </div>
        </div>
      </div>
    </div>
  )
}
