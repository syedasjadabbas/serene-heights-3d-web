import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import { setHeroProgress } from '../../components/stage/masterVisualStageState'
import logoSvg from '../../assets/branding/serene-heights-logo.svg'
import Logo from '../../components/ui/Logo'
import styles from './Hero.module.css'

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const portalWrapRef = useRef<HTMLDivElement>(null)
  const portalWindowRef = useRef<HTMLDivElement>(null)
  const portalLogoImageRef = useRef<SVGImageElement>(null)
  const portalMaskCutoutRef = useRef<SVGRectElement>(null)
  const portalLogoSolidFillRef = useRef<SVGRectElement>(null)
  const openingSignatureRef = useRef<HTMLDivElement>(null)

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

      // Initial Hidden State for Title Card
      if (cinematicTitleRef.current) {
        gsap.set(cinematicTitleRef.current, { opacity: 0 })
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
          // 2x Longer Runway (~1150vh Desktop) for deliberate, slow portal world transformation
          const runwayVh = conditions.isMobile ? 850 : conditions.isTablet ? 1000 : 1150

          const applyProgress = (p: number) => {
            // Update global stage progress deterministically
            setHeroProgress(p)

            // --- 1. Viewport-Locked Centered Portal Sequence (Phases 1-4: p = 0.00 -> 0.54) ---
            if (portalWrapRef.current) {
              if (reduced) {
                gsap.set(portalWrapRef.current, { opacity: 0, display: 'none' })
              } else if (p <= 0.04) {
                // Phase 1 — Official Brand Identity: Pristine luxury hotel brand mark on deep green background
                const time = Date.now() * 0.0016
                const breathing = 1.0 + 0.02 * Math.sin(time)

                gsap.set(portalWrapRef.current, {
                  opacity: 1,
                  display: 'block',
                  pointerEvents: 'auto',
                })
                if (portalWindowRef.current) {
                  gsap.set(portalWindowRef.current, {
                    scale: breathing,
                    xPercent: -50,
                    yPercent: -50,
                    transformOrigin: 'center center',
                  })
                }
                // Mask cutout is closed (solid green background), logo solid fill is opaque
                if (portalMaskCutoutRef.current) {
                  gsap.set(portalMaskCutoutRef.current, { opacity: 0 })
                }
                if (portalLogoSolidFillRef.current) {
                  gsap.set(portalLogoSolidFillRef.current, { opacity: 1 })
                }
                if (portalLogoImageRef.current) {
                  gsap.set(portalLogoImageRef.current, { opacity: 1 })
                }
                if (openingSignatureRef.current) {
                  gsap.set(openingSignatureRef.current, { opacity: 1 })
                }
              } else if (p <= 0.18) {
                // Phase 2 — Logo Comes Alive: Interior of logo slowly transforms into live 3D resort world
                const normRevealP = (p - 0.04) / 0.14
                const time = Date.now() * 0.0016
                const breathing = 1.0 + 0.02 * Math.sin(time)

                gsap.set(portalWrapRef.current, {
                  opacity: 1,
                  display: 'block',
                  pointerEvents: 'auto',
                })
                if (portalWindowRef.current) {
                  gsap.set(portalWindowRef.current, {
                    scale: breathing,
                    xPercent: -50,
                    yPercent: -50,
                    transformOrigin: 'center center',
                  })
                }
                // Mask cutout opens progressively, revealing 3D world behind emblem
                if (portalMaskCutoutRef.current) {
                  gsap.set(portalMaskCutoutRef.current, { opacity: normRevealP })
                }
                if (portalLogoSolidFillRef.current) {
                  gsap.set(portalLogoSolidFillRef.current, { opacity: 1 - normRevealP })
                }
                if (portalLogoImageRef.current) {
                  gsap.set(portalLogoImageRef.current, { opacity: 1 })
                }
                if (openingSignatureRef.current) {
                  gsap.set(openingSignatureRef.current, { opacity: 1 - normRevealP * 0.4 })
                }
              } else if (p < 0.46) {
                // Phase 3 — Portal Expansion: Logo fully transformed into window, expanding into resort world
                const normP = (p - 0.18) / 0.28
                const portalScale = 1.0 + 38.0 * (normP * normP) // Smooth inertial acceleration
                const logoOpacity = Math.max(0, 1 - normP * 1.8) // Logo stroke & gold border dissolve
                const signatureOpacity = Math.max(0, 0.6 - normP * 2.0) // Signature text fades quietly

                gsap.set(portalWrapRef.current, {
                  opacity: 1,
                  display: 'block',
                  pointerEvents: 'auto',
                })
                if (portalWindowRef.current) {
                  gsap.set(portalWindowRef.current, {
                    scale: portalScale,
                    xPercent: -50,
                    yPercent: -50,
                    transformOrigin: 'center center',
                  })
                }
                if (portalMaskCutoutRef.current) {
                  gsap.set(portalMaskCutoutRef.current, { opacity: 1 })
                }
                if (portalLogoSolidFillRef.current) {
                  gsap.set(portalLogoSolidFillRef.current, { opacity: 0 })
                }
                if (portalLogoImageRef.current) {
                  gsap.set(portalLogoImageRef.current, { opacity: logoOpacity })
                }
                if (openingSignatureRef.current) {
                  gsap.set(openingSignatureRef.current, { opacity: signatureOpacity })
                }
              } else if (p < 0.54) {
                // Phase 4 — Seamless Transition: Portal fills viewport, overlay dissolves cleanly
                const fadeOut = (p - 0.46) / 0.08
                const portalScale = 39.0 + 12.0 * ((p - 0.46) / 0.08)

                gsap.set(portalWrapRef.current, {
                  opacity: 1 - fadeOut,
                  display: 'block',
                  pointerEvents: 'none',
                })
                if (portalWindowRef.current) {
                  gsap.set(portalWindowRef.current, {
                    scale: portalScale,
                    xPercent: -50,
                    yPercent: -50,
                    transformOrigin: 'center center',
                  })
                }
                if (openingSignatureRef.current) {
                  gsap.set(openingSignatureRef.current, { opacity: 0 })
                }
              } else {
                // Entered world completely
                gsap.set(portalWrapRef.current, {
                  opacity: 0,
                  display: 'none',
                  pointerEvents: 'none',
                })
              }
            }

            // --- 2. World Arrival Pause & Hero Title Card Reveal (Phases 5-7: p = 0.54 -> 1.00) ---
            if (cinematicTitleRef.current) {
              if (reduced) {
                gsap.set(cinematicTitleRef.current, {
                  opacity: p > 0.9 ? 0 : 1,
                  scale: 1,
                })
              } else if (p < 0.70) {
                // World Arrival Pause (p = 0.54 -> 0.70): Visitor experiences the pristine architecture holding still
                gsap.set(cinematicTitleRef.current, { opacity: 0, scale: 0.88 })
              } else if (p <= 0.78) {
                // Soft fade-in of Hero Title Card after arrival pause (p = 0.70 -> 0.78)
                const fadeIn = (p - 0.70) / 0.08
                gsap.set(cinematicTitleRef.current, {
                  opacity: fadeIn,
                  scale: 0.88 + 0.12 * fadeIn,
                  pointerEvents: 'auto',
                })
              } else {
                // Phase 6 — Cinematic Scroll Sequence: Title growth & optical tracking (p = 0.78 -> 0.94)
                const normP = Math.min(1, (p - 0.78) / 0.16)
                const scale = 1.0 + 0.28 * Math.sin((normP * Math.PI) / 2)
                const tracking = 0.18 - 0.10 * normP

                let opacity = 1
                if (p > 0.90) {
                  const fade = Math.min(1, Math.max(0, (p - 0.90) / 0.10))
                  opacity = 1 - fade
                }

                gsap.set(cinematicTitleRef.current, {
                  opacity,
                  scale,
                  pointerEvents: p > 0.88 ? 'none' : 'auto',
                })

                if (brandTitleRef.current) {
                  gsap.set(brandTitleRef.current, {
                    letterSpacing: `${tracking.toFixed(3)}em`,
                    paddingLeft: `${tracking.toFixed(3)}em`,
                  })
                }
              }
            }

            // --- 3. Deterministic Scroll Cue ---
            if (scrollCueRef.current) {
              if (p < 0.04) {
                gsap.set(scrollCueRef.current, { opacity: 0 })
              } else if (p < 0.12) {
                const cueIn = (p - 0.04) / 0.08
                gsap.set(scrollCueRef.current, { opacity: cueIn })
              } else if (p > 0.82) {
                const cueFade = Math.min(1, Math.max(0, (p - 0.82) / 0.10))
                gsap.set(scrollCueRef.current, { opacity: 1 - cueFade })
              } else {
                gsap.set(scrollCueRef.current, { opacity: 1 })
              }
            }
          }

          // Smooth inertial scrub (1.4s) for reversible cinematic film progress
          const st = ScrollTrigger.create({
            trigger: heroRef.current,
            start: 'top top',
            end: () => {
              const heroH = heroRef.current?.offsetHeight ?? window.innerHeight
              return `+=${(window.innerHeight * runwayVh) / 100 - heroH}`
            },
            scrub: 1.4,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => applyProgress(self.progress),
          })

          // Drive ambient breathing loop ticker when stationary at p = 0
          const tickerFn = () => {
            if (st.progress <= 0.04) {
              applyProgress(st.progress)
            }
          }
          gsap.ticker.add(tickerFn)

          return () => {
            st.kill()
            gsap.ticker.remove(tickerFn)
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

        {/* --- Viewport-Locked Centered Portal Layer (Phases 1-4) --- */}
        <div ref={portalWrapRef} className={styles.portalWrap}>
          <div ref={portalWindowRef} className={styles.portalWindow}>
            <svg
              className={styles.portalSvg}
              viewBox="0 0 100 136"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                <mask
                  id="sereneOfficialPortalCutoutMask"
                  maskUnits="userSpaceOnUse"
                  x="-9950"
                  y="-9932"
                  width="20000"
                  height="20000"
                >
                  {/* Concentric 20,000x20,000 unit rect filled white (deep green overlay) */}
                  <rect x="-9950" y="-9932" width="20000" height="20000" fill="#ffffff" />
                  {/* Capsule Pill Window Cutout (Opacity controlled dynamically during Phase 2 reveal) */}
                  <rect
                    ref={portalMaskCutoutRef}
                    x="3"
                    y="3"
                    width="94"
                    height="130"
                    rx="47"
                    ry="47"
                    fill="#000000"
                  />
                </mask>
              </defs>

              {/* Concentric Deep Green Overlay covering screen EXCEPT inside emblem cutout */}
              <rect
                x="-9950"
                y="-9932"
                width="20000"
                height="20000"
                fill="#0a1410"
                mask="url(#sereneOfficialPortalCutoutMask)"
              />

              {/* Phase 1 Solid Brand Mark Interior Fill (Fades out in Phase 2 as world reveals) */}
              <rect
                ref={portalLogoSolidFillRef}
                x="3"
                y="3"
                width="94"
                height="130"
                rx="47"
                ry="47"
                fill="#0a1410"
              />

              {/* Official Logo Emblem Overlay (Stroke & Gold Contour) */}
              <image
                ref={portalLogoImageRef}
                href={logoSvg}
                x="0"
                y="0"
                width="100"
                height="136"
              />
            </svg>
          </div>

          {/* Opening Luxury Brand Signature Presentation (Phase 1 Arrival) */}
          <div ref={openingSignatureRef} className={styles.openingSignature}>
            <p className={styles.signatureTitle}>SERENE HEIGHTS</p>
            <p className={styles.signatureSubtitle}>HOTEL &amp; RESIDENCES · NATHIA GALI</p>
          </div>
        </div>

        {/* --- Master Hero Title Card (Phases 5-7) --- */}
        <div ref={cinematicTitleRef} className={styles.cinematicTitleLayer}>
          <Logo markOnly className={styles.brandLogoMark} />
          <h1 ref={brandTitleRef} className={styles.brandTitle}>
            SERENE HEIGHTS
          </h1>
          <p className={styles.brandSubtitle}>HOTEL &amp; RESIDENCES · NATHIA GALI</p>
          <div className={styles.brandDividerRule} aria-hidden="true" />
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
