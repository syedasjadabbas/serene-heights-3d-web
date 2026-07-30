import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import HeroScene from '../../three/HeroScene'
import type { HeroSceneHandle } from '../../three/HeroScene'
import HeroPhotography from './HeroPhotography'
import type { HeroPhotographyHandle } from './HeroPhotography'
import DeconstructionSequence from './DeconstructionSequence'
import type { DeconstructionSequenceHandle } from './DeconstructionSequence'
import styles from './Hero.module.css'

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const sceneWrapRef = useRef<HTMLDivElement>(null)
  const sceneHandleRef = useRef<HeroSceneHandle>(null)
  const photographyHandleRef = useRef<HeroPhotographyHandle>(null)
  const deconstructionHandleRef = useRef<DeconstructionSequenceHandle>(null)
  const headlineGroupRef = useRef<HTMLDivElement>(null)
  const kickerRef = useRef<HTMLParagraphElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const foregroundRef = useRef<HTMLDivElement>(null)
  const supportingRef = useRef<HTMLDivElement>(null)
  const scrollCueRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const reduced = prefersReducedMotion()

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      const lineInnerEls = headlineRef.current
        ? Array.from(headlineRef.current.querySelectorAll<HTMLElement>(`.${styles.lineInner}`))
        : []

      // --- Entrance timeline: plays once on mount ---
      const entranceProxy = { progress: 0 }
      const introTl = gsap.timeline({
        delay: 0.2,
        defaults: { ease: 'power3.out' },
        onUpdate: () => sceneHandleRef.current?.setEntranceProgress(entranceProxy.progress),
      })

      if (reduced) {
        introTl.set([kickerRef.current, ...lineInnerEls, supportingRef.current, scrollCueRef.current], {
          opacity: 1,
          yPercent: 0,
          y: 0,
        })
        entranceProxy.progress = 1
        sceneHandleRef.current?.setEntranceProgress(1)
      } else {
        introTl
          .fromTo(kickerRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 0)
          .fromTo(lineInnerEls, { yPercent: 115 }, { yPercent: 0, duration: 1.15, stagger: 0.09 }, 0.08)
          .to(entranceProxy, { progress: 1, duration: 1.3, ease: 'power3.out' }, 0.15)
          .fromTo(sceneWrapRef.current, { opacity: 0 }, { opacity: 1, duration: 1.3 }, 0.15)
          .fromTo(supportingRef.current, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9 }, 0.55)
          .fromTo(scrollCueRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.9)
      }

      // --- Scrubbed exit timeline: pinned to the hero, responsive per breakpoint ---
      const mm = gsap.matchMedia()

      mm.add(
        {
          isMobile: '(max-width: 640px)',
          isTablet: '(min-width: 641px) and (max-width: 1080px)',
          isDesktop: '(min-width: 1081px)',
        },
        (context) => {
          const conditions = context.conditions as {
            isMobile: boolean
            isTablet: boolean
            isDesktop: boolean
          }
          const runwayVh = conditions.isMobile ? 480 : conditions.isTablet ? 560 : 650
          const headlineTravel = conditions.isMobile ? -28 : conditions.isTablet ? -45 : -60
          const headlineScale = conditions.isMobile ? 0.85 : 0.72

          const scrubTl = gsap.timeline({
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: () => `+=${(window.innerHeight * runwayVh) / 100}`,
              scrub: reduced ? true : 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                sceneHandleRef.current?.setScrollProgress(self.progress)
                photographyHandleRef.current?.setScrollProgress(self.progress)
                deconstructionHandleRef.current?.setScrollProgress(self.progress)
              },
            },
          })

          // Every tween below gets an explicit duration so its position parameter is a
          // literal 0-1 fraction of the scroll runway (GSAP's implicit default-duration
          // timeline sizing would otherwise remap these unpredictably) — the last tweens
          // to finish (sceneWrap/background/overlay) end at exactly 1.
          scrubTl
            .to(kickerRef.current, { opacity: 0, yPercent: -60, ease: 'none', duration: 0.13 }, 0)
            .to(
              headlineGroupRef.current,
              { yPercent: headlineTravel, scale: headlineScale, opacity: 0, ease: 'none', duration: 0.15 },
              0,
            )
            .to(sceneWrapRef.current, { scale: 1.12, ease: 'none', duration: 1 }, 0)
            .to(backgroundRef.current, { yPercent: 16, ease: 'none', duration: 1 }, 0)
            .to(
              foregroundRef.current,
              { scaleY: 1.4, opacity: 1, ease: 'none', duration: 0.85 },
              0.05,
            )
            .to(supportingRef.current, { opacity: 0, yPercent: 40, ease: 'none', duration: 0.13 }, 0.02)
            .to(scrollCueRef.current, { opacity: 0, ease: 'none', duration: 0.05 }, 0)
            .to(overlayRef.current, { opacity: 0.92, ease: 'none', duration: 0.1 }, 0.9)

          return () => {
            scrubTl.scrollTrigger?.kill()
            scrubTl.kill()
          }
        },
      )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} id="top" className={styles.hero}>
      <div className={styles.frame}>
        <div ref={backgroundRef} className={styles.background} />

        <HeroPhotography ref={photographyHandleRef} />

        <div ref={headlineGroupRef} className={styles.headlineGroup}>
          <p ref={kickerRef} className={styles.kicker}>
            Est. 2017 — Hotel &amp; Resorts, Nathiagali
          </p>
          <h1 ref={headlineRef} className={styles.headline}>
            <span className={styles.lineMask}>
              <span className={styles.lineInner}>Serene</span>
            </span>
            <span className={styles.lineMask}>
              <span className={styles.lineInner}>Heights</span>
            </span>
          </h1>
        </div>

        <div ref={sceneWrapRef} className={styles.sceneWrap}>
          <HeroScene ref={sceneHandleRef} className={styles.canvas} />
        </div>

        <DeconstructionSequence ref={deconstructionHandleRef} />

        <div ref={foregroundRef} className={styles.foreground} />

        <div ref={supportingRef} className={styles.supporting}>
          <p className={styles.tagline}>Above the ordinary.</p>
          <p className={styles.description}>A mountain retreat in the heart of Nathiagali.</p>
        </div>

        <div ref={scrollCueRef} className={styles.scrollCue}>
          <span className={styles.scrollCueLine} />
          <span>Scroll</span>
        </div>

        <div ref={overlayRef} className={styles.transitionOverlay} />
      </div>
    </section>
  )
}
