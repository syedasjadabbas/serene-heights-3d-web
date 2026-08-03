import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import { setHeroProgress } from '../../components/stage/masterVisualStageState'
import Logo from '../../components/ui/Logo'
import styles from './Hero.module.css'

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const cinematicTitleRef = useRef<HTMLDivElement>(null)
  const brandTitleRef = useRef<HTMLHeadingElement>(null)
  const scrollCueRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }
      window.scrollTo(0, 0)
    }
  }, [])

  useLayoutEffect(() => {
    const reduced = prefersReducedMotion()

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      // Page Load Intro Animation
      if (cinematicTitleRef.current) {
        const children = Array.from(cinematicTitleRef.current.children)
        if (reduced) {
          gsap.set(children, { opacity: 1, y: 0 })
          if (scrollCueRef.current) gsap.set(scrollCueRef.current, { opacity: 1 })
        } else {
          gsap
            .timeline({ delay: 0.25, defaults: { ease: 'power3.out' } })
            .fromTo(
              children,
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 1.35, stagger: 0.14 },
              0.1,
            )
            .fromTo(scrollCueRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.7)
        }
      }

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
          const runwayVh = conditions.isMobile ? 320 : conditions.isTablet ? 380 : 440

          const applyProgress = (p: number) => {
            // Update global stage progress
            setHeroProgress(p)

            // Phase-Based Brand Growth & Optical Tracking
            if (cinematicTitleRef.current) {
              // Phase 1 (0.00 -> 0.18): Small centered title (scale: 0.65)
              let scale = 0.65
              let tracking = 0.34

              if (p > 0.18) {
                const normP = Math.min(1, (p - 0.18) / 0.67)
                // Continuous, smooth brand growth (0.65 -> 1.30)
                scale = 0.65 + 0.65 * Math.sin((normP * Math.PI) / 2)
                // Optical tracking tightening (0.34em -> 0.22em)
                tracking = 0.34 - 0.12 * normP
              }

              // Phase 4 Exit Fade (0.90 -> 1.00)
              let opacity = 1
              if (p > 0.90) {
                const fade = Math.min(1, Math.max(0, (p - 0.90) / 0.10))
                opacity = 1 - fade
              }

              gsap.set(cinematicTitleRef.current, {
                opacity: reduced ? (p > 0.88 ? 0 : 1) : opacity,
                scale: reduced ? 1 : scale,
                pointerEvents: p > 0.88 ? 'none' : 'auto',
              })

              if (brandTitleRef.current && !reduced) {
                gsap.set(brandTitleRef.current, {
                  letterSpacing: `${tracking.toFixed(3)}em`,
                  paddingLeft: `${tracking.toFixed(3)}em`,
                })
              }
            }

            // Scroll Cue Fade (0.00 -> 0.10)
            if (scrollCueRef.current) {
              const cueFade = Math.min(1, Math.max(0, p / 0.10))
              gsap.set(scrollCueRef.current, { opacity: 1 - cueFade })
            }
          }

          const st = ScrollTrigger.create({
            trigger: heroRef.current,
            start: 'top top',
            end: () => {
              const heroH = heroRef.current?.offsetHeight ?? window.innerHeight
              return `+=${(window.innerHeight * runwayVh) / 100 - heroH}`
            },
            scrub: true,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => applyProgress(self.progress),
          })

          return () => {
            st.kill()
          }
        },
      )
    }, heroRef)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section ref={heroRef} id="top" className={styles.hero}>
      <div className={styles.frame}>
        <div className={styles.backgroundVignette} aria-hidden="true" />

        {/* Cinematic Opening Title Sequence Lockup */}
        <div ref={cinematicTitleRef} className={styles.cinematicTitleLayer}>
          <Logo markOnly className={styles.brandLogoMark} />
          <h1 ref={brandTitleRef} className={styles.brandTitle}>
            SERENE HEIGHTS
          </h1>
          <p className={styles.brandSubtitle}>HOTEL &amp; RESIDENCES · NATHIA GALI</p>
          <p className={styles.brandTagline}>A sanctuary above the clouds.</p>
        </div>

        {/* Quiet Scroll Cue */}
        <div ref={scrollCueRef} className={styles.scrollCue}>
          <span className={styles.scrollCueLine} />
          <span>Scroll</span>
        </div>
      </div>
    </section>
  )
}
