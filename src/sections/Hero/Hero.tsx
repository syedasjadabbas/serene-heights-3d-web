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
  const glassStopCenterRef = useRef<SVGStopElement>(null)
  const glassStopEdgeRef = useRef<SVGStopElement>(null)
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
        gsap.set(cinematicTitleRef.current, { opacity: 0, y: 6, filter: 'blur(6px)' })
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
          const runwayVh = conditions.isMobile ? 900 : conditions.isTablet ? 1050 : 1200

          /**
           * Pure deterministic render function: HeroVisual = f(progress p).
           * Reconstructs the exact DOM/SVG visual state for any p in [0, 1],
           * forward or backward. Zero closure flags, zero time-dependent state.
           */
          const applyProgress = (p: number) => {
            // Update global stage progress synchronously
            setHeroProgress(p)

            // --- 1. Viewport-Locked Centered Portal Sequence (Phases 1-4: p = 0.00 -> 0.65) ---
            if (portalWrapRef.current) {
              if (reduced) {
                gsap.set(portalWrapRef.current, { opacity: 0, display: 'none' })
              } else if (p <= 0.12) {
                // Phase 1 -- Luxury Brand Identity
                gsap.set(portalWrapRef.current, { opacity: 1, display: 'block', pointerEvents: 'auto' })
                if (portalWindowRef.current) {
                  gsap.set(portalWindowRef.current, {
                    scale: 1.0,
                    xPercent: -50,
                    yPercent: -50,
                    transformOrigin: 'center center',
                  })
                }
                if (glassStopCenterRef.current) {
                  glassStopCenterRef.current.setAttribute('offset', '0%')
                  glassStopCenterRef.current.setAttribute('stop-color', '#ffffff')
                }
                if (glassStopEdgeRef.current) {
                  glassStopEdgeRef.current.setAttribute('offset', '0%')
                  glassStopEdgeRef.current.setAttribute('stop-color', '#ffffff')
                }
                if (portalLogoSolidFillRef.current) gsap.set(portalLogoSolidFillRef.current, { opacity: 1 })
                if (portalLogoImageRef.current) gsap.set(portalLogoImageRef.current, { opacity: 1 })
                if (openingSignatureRef.current) gsap.set(openingSignatureRef.current, { opacity: 1 })
              } else if (p <= 0.30) {
                // Phase 2 -- Radial Glass Un-frosting
                const normGlassP = (p - 0.12) / 0.18

                gsap.set(portalWrapRef.current, {
                  opacity: 1,
                  display: 'block',
                  pointerEvents: 'auto',
                })
                if (portalWindowRef.current) {
                  gsap.set(portalWindowRef.current, {
                    scale: 1.0,
                    xPercent: -50,
                    yPercent: -50,
                    transformOrigin: 'center center',
                  })
                }
                const centerOffset = `${(normGlassP * 120).toFixed(1)}%`
                const edgeOffset = `${Math.min(100, normGlassP * 140 + 15).toFixed(1)}%`

                if (glassStopCenterRef.current) {
                  glassStopCenterRef.current.setAttribute('offset', centerOffset)
                  glassStopCenterRef.current.setAttribute('stop-color', '#000000')
                }
                if (glassStopEdgeRef.current) {
                  glassStopEdgeRef.current.setAttribute('offset', edgeOffset)
                  glassStopEdgeRef.current.setAttribute('stop-color', '#ffffff')
                }
                if (portalLogoSolidFillRef.current) {
                  gsap.set(portalLogoSolidFillRef.current, { opacity: Math.max(0, 1 - normGlassP * 1.4) })
                }
                if (portalLogoImageRef.current) {
                  gsap.set(portalLogoImageRef.current, { opacity: 1 })
                }
                if (openingSignatureRef.current) {
                  gsap.set(openingSignatureRef.current, { opacity: Math.max(0, 1 - normGlassP * 0.9) })
                }
              } else if (p < 0.58) {
                // Phase 3 -- Overlapping Physical Expansion
                const normP = (p - 0.28) / 0.30
                const portalScale = 1.0 + 39.0 * (normP * normP)
                const logoOpacity = Math.max(0, 1 - normP * 1.8)

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
                if (glassStopCenterRef.current) {
                  glassStopCenterRef.current.setAttribute('offset', '100%')
                  glassStopCenterRef.current.setAttribute('stop-color', '#000000')
                }
                if (glassStopEdgeRef.current) {
                  glassStopEdgeRef.current.setAttribute('offset', '100%')
                  glassStopEdgeRef.current.setAttribute('stop-color', '#000000')
                }
                if (portalLogoSolidFillRef.current) {
                  gsap.set(portalLogoSolidFillRef.current, { opacity: 0 })
                }
                if (portalLogoImageRef.current) {
                  gsap.set(portalLogoImageRef.current, { opacity: logoOpacity })
                }
                if (openingSignatureRef.current) {
                  gsap.set(openingSignatureRef.current, { opacity: 0 })
                }
              } else if (p < 0.65) {
                // Phase 4 -- Seamless Transition
                const fadeOut = (p - 0.58) / 0.07
                const portalScale = 40.0 + 12.0 * ((p - 0.58) / 0.07)

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
                if (glassStopCenterRef.current) {
                  glassStopCenterRef.current.setAttribute('offset', '100%')
                  glassStopCenterRef.current.setAttribute('stop-color', '#000000')
                }
                if (glassStopEdgeRef.current) {
                  glassStopEdgeRef.current.setAttribute('offset', '100%')
                  glassStopEdgeRef.current.setAttribute('stop-color', '#000000')
                }
                if (portalLogoSolidFillRef.current) {
                  gsap.set(portalLogoSolidFillRef.current, { opacity: 0 })
                }
                if (portalLogoImageRef.current) {
                  gsap.set(portalLogoImageRef.current, { opacity: 0 })
                }
                if (openingSignatureRef.current) {
                  gsap.set(openingSignatureRef.current, { opacity: 0 })
                }
              } else {
                // Phase 5+ -- Fully entered world
                gsap.set(portalWrapRef.current, {
                  opacity: 0,
                  display: 'none',
                  pointerEvents: 'none',
                })
              }
            }

            // --- 2. World Arrival Pause & Hero Title Card Emergence (p = 0.65 -> 1.00) ---
            if (cinematicTitleRef.current) {
              if (reduced) {
                gsap.set(cinematicTitleRef.current, {
                  opacity: p > 0.9 ? 0 : 1,
                  scale: 1,
                  y: 0,
                  filter: 'blur(0px)',
                })
              } else if (p < 0.70) {
                gsap.set(cinematicTitleRef.current, {
                  opacity: 0,
                  scale: 0.92,
                  y: 6,
                  filter: 'blur(6px)',
                })
              } else if (p <= 0.78) {
                const normP = (p - 0.70) / 0.08
                const easeP = (1 - Math.cos(normP * Math.PI)) / 2

                gsap.set(cinematicTitleRef.current, {
                  opacity: easeP,
                  scale: 0.92 + 0.08 * easeP,
                  y: 6 * (1 - easeP),
                  filter: `blur(${(6 * (1 - easeP)).toFixed(2)}px)`,
                  pointerEvents: 'auto',
                })
              } else {
                const normP = Math.min(1, (p - 0.78) / 0.18)
                const scale = 1.0 + 0.28 * Math.sin((normP * Math.PI) / 2)
                const tracking = 0.18 - 0.10 * normP

                let opacity = 1
                if (p > 0.94) {
                  const fade = Math.min(1, Math.max(0, (p - 0.94) / 0.06))
                  opacity = 1 - fade
                }

                gsap.set(cinematicTitleRef.current, {
                  opacity,
                  scale,
                  y: 0,
                  filter: 'blur(0px)',
                  pointerEvents: p > 0.92 ? 'none' : 'auto',
                })

                if (brandTitleRef.current) {
                  const trackingStr = `${tracking.toFixed(3)}em`
                  gsap.set(brandTitleRef.current, {
                    letterSpacing: trackingStr,
                    paddingLeft: trackingStr,
                  })
                }
              }
            }

            if (brandTitleRef.current && p <= 0.78) {
              gsap.set(brandTitleRef.current, {
                letterSpacing: '0.18em',
                paddingLeft: '0.18em',
              })
            }

            // --- 3. Deterministic Scroll Cue ---
            if (scrollCueRef.current) {
              if (p < 0.04) {
                gsap.set(scrollCueRef.current, { opacity: 0 })
              } else if (p < 0.15) {
                const cueIn = (p - 0.04) / 0.11
                gsap.set(scrollCueRef.current, { opacity: cueIn })
              } else if (p > 0.85) {
                const cueFade = Math.min(1, Math.max(0, (p - 0.85) / 0.10))
                gsap.set(scrollCueRef.current, { opacity: 1 - cueFade })
              } else {
                gsap.set(scrollCueRef.current, { opacity: 1 })
              }
            }
          }

          // Smooth inertial scrub for reversible cinematic film progress
          const st = ScrollTrigger.create({
            trigger: heroRef.current,
            start: 'top top',
            end: () => {
              const heroH = heroRef.current?.offsetHeight ?? window.innerHeight
              return `+=${(window.innerHeight * runwayVh) / 100 - heroH}`
            },
            scrub: 1.4,
            pin: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => applyProgress(self.progress),
          })

          applyProgress(st.progress)

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
                {/* Radial Glass Un-Frosting Gradient (Center-outward transition in Phase 2) */}
                <radialGradient
                  id="sereneGlassUnfrostGradient"
                  cx="50%"
                  cy="50%"
                  r="50%"
                  fx="50%"
                  fy="50%"
                >
                  <stop ref={glassStopCenterRef} offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop ref={glassStopEdgeRef} offset="0%" stopColor="#ffffff" stopOpacity="1" />
                </radialGradient>

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
                  {/* Capsule Pill Window Cutout filled with radial glass un-frosting gradient */}
                  <rect
                    x="3"
                    y="3"
                    width="94"
                    height="130"
                    rx="47"
                    ry="47"
                    fill="url(#sereneGlassUnfrostGradient)"
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

              {/* Official Logo Emblem Overlay (Stroke & Gold Contour with Soft Ambient Glow) */}
              <image
                ref={portalLogoImageRef}
                href={logoSvg}
                x="0"
                y="0"
                width="100"
                height="136"
                className={styles.openingEmblemImage}
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
