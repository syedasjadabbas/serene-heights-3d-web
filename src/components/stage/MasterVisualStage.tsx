import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from '../../motion/scrollTrigger'
import {
  FRAME_COUNT,
  FRAME_WIDTH,
  FRAME_HEIGHT,
  createSequenceLoader,
  nearestLoadedFrame,
} from '../../sections/Hero/cameraSequence'
import {
  mapProgressToFrame,
  getHeroCinematicOpacity,
  getHeroStillOpacity,
  getHeroProgress,
} from './masterVisualStageState'
import heroStillSrc from '../../assets/hero/scene-01-establish.png'
import styles from './MasterVisualStage.module.css'

const FOCAL_X = 0.15

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  srcW: number,
  srcH: number,
  canvasW: number,
  canvasH: number,
) {
  const imgRatio = srcW / srcH
  const canvasRatio = canvasW / canvasH
  let sx = 0
  let sy = 0
  let sw = srcW
  let sh = srcH
  if (imgRatio > canvasRatio) {
    sw = srcH * canvasRatio
    sx = (srcW - sw) * FOCAL_X
  } else {
    sh = srcW / canvasRatio
    sy = (srcH - sh) * 0.5
  }
  ctx.clearRect(0, 0, canvasW, canvasH)
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH)
}

/**
 * Cinematic color grade -- applied ONCE per frame to an offscreen cache canvas.
 * The scroll paint path NEVER calls this. It only copies pre-graded pixels.
 */
function applyCanvasCinematicGrade(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = 'rgba(228, 212, 190, 0.14)'
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'soft-light'
  ctx.fillStyle = 'rgba(24, 16, 8, 0.10)'
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()
}

export default function MasterVisualStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const heroStillRef = useRef<HTMLImageElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const frameIndexRef = { current: 0 }
    const lastDrawnIndexRef = { current: -1 }

    // Pre-graded frame cache (PERF FIX #1)
    // Each raw frame graded once into an offscreen canvas at load time.
    // Scroll path: single drawImage copy, zero blending, zero GPU readback.
    const gradedCache = new Map<number, HTMLCanvasElement>()

    const loader = createSequenceLoader(() => redraw())
    let resizeObserver: ResizeObserver | null = null

    function buildGradedFrame(index: number): CanvasImageSource | undefined {
      const cached = gradedCache.get(index)
      if (cached) return cached
      const img = loader.getFrame(index)
      if (!img) return undefined
      const oc = document.createElement('canvas')
      oc.width = FRAME_WIDTH
      oc.height = FRAME_HEIGHT
      const ctx2 = oc.getContext('2d')
      if (!ctx2) return img
      ctx2.drawImage(img, 0, 0, FRAME_WIDTH, FRAME_HEIGHT)
      applyCanvasCinematicGrade(ctx2, FRAME_WIDTH, FRAME_HEIGHT)
      gradedCache.set(index, oc)
      return oc
    }

    function redraw(force = false) {
      const canvas = canvasRef.current
      if (!canvas) return
      const target = frameIndexRef.current
      const available = nearestLoadedFrame(loader, target)
      if (available === -1) return
      if (available === lastDrawnIndexRef.current && !force) return
      const graded = buildGradedFrame(available)
      if (!graded) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      drawCover(ctx, graded, FRAME_WIDTH, FRAME_HEIGHT, canvas.width, canvas.height)
      lastDrawnIndexRef.current = available
    }

    function resizeCanvas() {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(rect.width * dpr)
      const h = Math.round(rect.height * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        redraw(true)
      }
    }

    registerScrollTrigger()

    loader.request(0)
    for (let i = 1; i <= 11; i += 1) loader.request(i)
    loader.startBackgroundFill()

    if (canvasRef.current) {
      resizeObserver = new ResizeObserver(() => resizeCanvas())
      resizeObserver.observe(canvasRef.current)
    }
    window.addEventListener('resize', resizeCanvas, { passive: true })
    window.addEventListener('orientationchange', resizeCanvas)
    resizeCanvas()

    // Dirty-value tracking (PERF FIX #4)
    // Skip gsap.set() calls when the computed value matches the last written value.
    let lastCanvasScale = -1
    let lastCanvasX = 0
    let lastCanvasY = 0
    let lastCanvasWrapOpacity = -1
    let lastStillOpacity = -1

    const updateStageFromScroll = () => {
      const p = getHeroProgress()

      let camPushScale = 1.0
      if (p >= 0.35 && p <= 0.65) {
        const normPushP = (p - 0.35) / 0.30
        const easePush = (1 - Math.cos(normPushP * Math.PI)) / 2
        camPushScale = 1.0 + 0.06 * easePush
      } else if (p > 0.65) {
        const normPushP = Math.min(1, (p - 0.65) / 0.30)
        const easePush = (1 - Math.cos(normPushP * Math.PI)) / 2
        camPushScale = 1.06 + 0.04 * easePush
      }

      let ambientDriftScale = 1.0
      let ambientX = 0
      let ambientY = 0
      if (p < 0.65) {
        const time = Date.now() * 0.001
        ambientDriftScale = 1.0 + 0.008 * Math.sin(time * 0.8)
        ambientX = Math.sin(time * 0.6) * 2.5
        ambientY = Math.cos(time * 0.5) * 1.8
      }

      const totalCanvasScale = camPushScale * ambientDriftScale

      if (
        canvasRef.current &&
        (totalCanvasScale !== lastCanvasScale ||
          ambientX !== lastCanvasX ||
          ambientY !== lastCanvasY)
      ) {
        gsap.set(canvasRef.current, { scale: totalCanvasScale, x: ambientX, y: ambientY })
        lastCanvasScale = totalCanvasScale
        lastCanvasX = ambientX
        lastCanvasY = ambientY
      }

      const targetFrame = mapProgressToFrame()
      if (targetFrame !== frameIndexRef.current) {
        frameIndexRef.current = targetFrame
        loader.request(targetFrame)
        loader.request(Math.max(0, targetFrame - 2))
        loader.request(Math.min(FRAME_COUNT - 1, targetFrame + 2))
        redraw()
      }

      const mode1Opacity = getHeroCinematicOpacity()
      if (canvasWrapRef.current && mode1Opacity !== lastCanvasWrapOpacity) {
        gsap.set(canvasWrapRef.current, { opacity: mode1Opacity })
        lastCanvasWrapOpacity = mode1Opacity
      }

      const stillOpacity = getHeroStillOpacity()
      if (heroStillRef.current && stillOpacity !== lastStillOpacity) {
        gsap.set(heroStillRef.current, { opacity: stillOpacity })
        lastStillOpacity = stillOpacity
      }
    }

    // PERF FIX #2: Single scroll driver.
    // Lenis already drives ScrollTrigger.update on every tick (lenis.ts:19).
    // window 'scroll' listener REMOVED (was triple-firing updateStageFromScroll).
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: () => updateStageFromScroll(),
    })

    // PERF FIX #3: Ambient ticker gated to portal phase (p < 0.65).
    // Needed for breathing drift while stationary. Not needed post-portal.
    const ambientTickerFn = () => {
      if (getHeroProgress() < 0.65) {
        updateStageFromScroll()
      }
    }
    gsap.ticker.add(ambientTickerFn)

    updateStageFromScroll()

    return () => {
      st.kill()
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('orientationchange', resizeCanvas)
      gsap.ticker.remove(ambientTickerFn)
      loader.destroy()
      gradedCache.clear()
      resizeObserver?.disconnect()
    }
  }, [])

  return (
    <div ref={stageRef} className={styles.stage} aria-hidden="true">
      <div className={styles.architecturalWorld}>
        <div className={styles.ambientBreathingGrid} />
        <div className={styles.ambientGlowMesh} />
      </div>
      <div ref={canvasWrapRef} className={styles.heroCinematicWrap}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      <img
        ref={heroStillRef}
        src={heroStillSrc}
        className={styles.heroStill}
        alt=""
        aria-hidden="true"
        fetchpriority="high"
      />
    </div>
  )
}
