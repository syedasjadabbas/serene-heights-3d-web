import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { gsap } from 'gsap'
import { HERO_PHOTOS, computeImageState } from './heroPhotos'
import styles from './HeroPhotography.module.css'

export interface HeroPhotographyHandle {
  setScrollProgress: (value: number) => void
}

interface BreakpointConfig {
  amplitude: number
}

function getBreakpointConfig(width: number): BreakpointConfig {
  if (width < 640) return { amplitude: 0.55 }
  if (width < 1081) return { amplitude: 0.78 }
  return { amplitude: 1 }
}

/**
 * Second cinematic Hero layer: real-estate photography that reveals/zooms
 * through the same normalized scroll progress driving HeroScene's 3D rig
 * (fed in via setScrollProgress from Hero.tsx's single ScrollTrigger — no
 * second trigger). Purely imperative: progress in via a ref, styles written
 * directly to each <img> on the existing gsap.ticker, no React state in the
 * hot path.
 */
const HeroPhotography = forwardRef<HeroPhotographyHandle>(function HeroPhotography(_props, ref) {
  const rawProgressRef = useRef(0)
  const smoothedProgressRef = useRef(0)
  const imageRefs = useRef<(HTMLImageElement | null)[]>([])
  const breakpointRef = useRef<BreakpointConfig>(
    getBreakpointConfig(typeof window === 'undefined' ? 1440 : window.innerWidth),
  )

  useImperativeHandle(
    ref,
    () => ({
      setScrollProgress: (value: number) => {
        rawProgressRef.current = value
      },
    }),
    [],
  )

  useEffect(() => {
    const mqTablet = window.matchMedia('(max-width: 1080px)')
    const mqMobile = window.matchMedia('(max-width: 640px)')

    const update = () => {
      breakpointRef.current = getBreakpointConfig(window.innerWidth)
    }
    update()

    mqTablet.addEventListener('change', update)
    mqMobile.addEventListener('change', update)

    return () => {
      mqTablet.removeEventListener('change', update)
      mqMobile.removeEventListener('change', update)
    }
  }, [])

  useEffect(() => {
    if (HERO_PHOTOS.length === 0) return

    const tick = (_time: number, deltaTime: number) => {
      const smoothing = Math.min(1, (deltaTime || 0.016) * 4)
      smoothedProgressRef.current += (rawProgressRef.current - smoothedProgressRef.current) * smoothing

      const progress = smoothedProgressRef.current
      const { amplitude } = breakpointRef.current

      for (let i = 0; i < HERO_PHOTOS.length; i += 1) {
        const el = imageRefs.current[i]
        if (!el) continue

        const config = HERO_PHOTOS[i]
        const state = computeImageState(progress, config, amplitude)
        el.style.opacity = String(state.opacity)
        el.style.transformOrigin = `${config.focal.x}% ${config.focal.y}%`
        el.style.transform = `translate3d(${state.driftXPct}%, ${state.driftYPct}%, 0) scale(${state.scale})`
        el.style.clipPath = `circle(${state.maskRadiusPct}% at ${config.focal.x}% ${config.focal.y}%)`
      }
    }

    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  if (HERO_PHOTOS.length === 0) return null

  return (
    <div className={styles.photography} aria-hidden="true">
      {HERO_PHOTOS.map((photo, index) => (
        <div key={photo.id} className={styles.frame}>
          <img
            ref={(el) => {
              imageRefs.current[index] = el
            }}
            src={photo.src}
            alt={photo.alt}
            className={`${styles.image} ${styles[photo.focalClass]}`}
            loading={photo.loading}
            fetchPriority={photo.fetchPriority}
            decoding="async"
          />
        </div>
      ))}
    </div>
  )
})

export default HeroPhotography
