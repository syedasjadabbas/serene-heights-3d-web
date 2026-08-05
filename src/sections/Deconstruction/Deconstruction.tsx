import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import { setHeroProgress } from '../../components/stage/masterVisualStageState'
import heroImageSrc from '../../assets/hero/scene-01-establish.webp'
import heroStyles from '../Hero/HeroV2.module.css'
import styles from './Deconstruction.module.css'

/**
 * Deconstruction — scroll-scrubbed video, pinned second act after the Hero.
 *
 * ─── Sequence ───────────────────────────────────────────────────
 *   Hero (locked) → Hero appreciation hold → [this section] → Section 2
 *
 * ─── Continuity ─────────────────────────────────────────────────
 *   The anchor is the Hero's OWN photo (not a re-crop of the video) at
 *   opacity 1 from the very first pixel of scroll — so the instant Hero's
 *   pin releases and this section's pin engages, nothing on screen
 *   visibly changes. Only then does a short, deliberate cross-dissolve
 *   blend the Hero image into the video's live first frame, with the
 *   anchor still very slightly pushing in during that blend so motion
 *   never flat-lines and restarts — one continuous camera move, not a cut.
 *
 * ─── Typography ─────────────────────────────────────────────────
 *   Reuses HeroV2's exact classes/content (read-only import, HeroV2 itself
 *   untouched) so it reads as "the same text, still there" the instant
 *   the Hero hands off — fully visible for almost the entire scrub, only
 *   dissolving out right at the end, just before Section 2.
 *
 * ─── Navbar ─────────────────────────────────────────────────────
 *   Feeds the existing (otherwise-dormant) setHeroProgress() so
 *   Navigation's own built-in 0.78->0.84 fade-in activates shortly after
 *   the crossfade completes — i.e. only once inside the video, never
 *   during the Hero. Navigation's own code is untouched.
 *
 * ─── Scrub contract ─────────────────────────────────────────────
 *   video.currentTime is a pure function of scroll progress — no
 *   .play()/.pause() calls, ever. Scrolling down/up therefore plays the
 *   deconstruction forward/backward with zero drift, exactly mirroring
 *   HeroV2's own "ONE ScrollTrigger · pure f(progress)" architecture.
 */

const VIDEO_SRC = '/media/serene-heights/hero/deconstruction/serene-heights-v2-scrub.mp4'

const SCRUB_SPAN_MULTIPLIER = 2.5 // ~2.5 viewport heights of scroll to play the clip through
const HOLD_PX = 300               // short hold on the final frame before Section 2
const CROSSFADE_P = 0.08          // Hero image -> video dissolve, over the first 8% of local progress
const ANCHOR_PUSH_SCALE = 1.015   // tiny continued push on the anchor during the crossfade only

const NAV_REVEAL_START = 0.11 // navbar starts appearing shortly after the crossfade completes
const NAV_REVEAL_END   = 0.17

const TYPOGRAPHY_FADE_START = 0.90 // typography stays put until right near the end
const TYPOGRAPHY_FADE_END   = 1.00

function remap(p: number, inMin: number, inMax: number): number {
  return Math.max(0, Math.min(1, (p - inMin) / (inMax - inMin)))
}

export default function Deconstruction() {
  const sectionRef = useRef<HTMLElement>(null)
  const anchorRef  = useRef<HTMLImageElement>(null)
  const videoRef   = useRef<HTMLVideoElement>(null)
  const typeRef    = useRef<HTMLDivElement>(null)

  const videoReady      = useRef(false)
  const pendingProgress = useRef(0)

  useLayoutEffect(() => {
    registerScrollTrigger()

    const video = videoRef.current
    video?.pause()

    gsap.set(anchorRef.current, { opacity: 1, scale: 1 })
    gsap.set(videoRef.current,  { opacity: 0 })
    gsap.set(typeRef.current,   { opacity: 1 })

    const applyVideoTime = (p: number) => {
      pendingProgress.current = p
      if (video && videoReady.current && video.duration) {
        video.currentTime = p * video.duration
      }
    }

    const onLoadedMetadata = () => {
      videoReady.current = true
      applyVideoTime(pendingProgress.current)
    }
    video?.addEventListener('loadedmetadata', onLoadedMetadata)
    video?.load()

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: () => '+=' + ((sectionRef.current?.offsetHeight ?? window.innerHeight) * SCRUB_SPAN_MULTIPLIER + HOLD_PX),
      scrub: 0.6,
      pin: true,
      invalidateOnRefresh: true,

      onUpdate: (self) => {
        const originalSpanPx = (sectionRef.current?.offsetHeight ?? window.innerHeight) * SCRUB_SPAN_MULTIPLIER
        const totalSpanPx    = self.end - self.start
        const p = Math.min(1, self.progress * totalSpanPx / originalSpanPx)

        // Hero image -> video dissolve, only at the very start of this
        // section's own pin (Hero is already fully off-screen by then).
        // The anchor keeps very slightly pushing in throughout the blend
        // so the camera never visibly stops-then-restarts.
        const crossfade = Math.min(1, p / CROSSFADE_P)
        gsap.set(anchorRef.current, {
          opacity: 1 - crossfade,
          scale: 1 + (ANCHOR_PUSH_SCALE - 1) * crossfade,
        })
        gsap.set(videoRef.current, { opacity: crossfade })

        applyVideoTime(p)

        // Navbar — only once inside the video, never during the Hero.
        const navP = remap(p, NAV_REVEAL_START, NAV_REVEAL_END)
        setHeroProgress(0.78 + navP * 0.06)

        // Typography persists over the video, fading only right at the end.
        const typeFade = 1 - remap(p, TYPOGRAPHY_FADE_START, TYPOGRAPHY_FADE_END)
        gsap.set(typeRef.current, { opacity: typeFade })
      },
    })

    return () => {
      st.kill()
      video?.removeEventListener('loadedmetadata', onLoadedMetadata)
    }
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>
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
      <div ref={typeRef} className={heroStyles.fullTitleWrap} style={{ zIndex: 6 }}>
        <h1 className={heroStyles.fullTitle}>
          <span className={heroStyles.titleLine}>SERENE</span>
          <span className={heroStyles.titleLine}>HEIGHTS</span>
        </h1>
        <p className={heroStyles.fullSubtitle}>
          HOTEL &amp; RESIDENCES &nbsp;·&nbsp; NATHIA GALI
        </p>
        <div className={heroStyles.heroCtaWrap}>
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
    </section>
  )
}
