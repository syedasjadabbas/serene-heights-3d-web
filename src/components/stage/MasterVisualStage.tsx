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
 * Cinematic color grade baked directly into the canvas pixel buffer.
 *
 * Uses 2D compositing blend modes — no CSS filter applied.
 * The result feels like naturally beautiful cinematography, not a filtered image.
 *
 * Grade target: warm golden-hour daylight, Aman / Six Senses editorial quality.
 *   1. Warm ivory multiply  → reduces exposure + warms highlights toward soft gold
 *   2. Soft-light contrast  → adds local depth without crushing shadows
 */
function applyCanvasCinematicGrade(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.save()

  // Pass 1: Warm Ivory Multiply
  // — Darkens exposure slightly
  // — Warm color shifts whites toward soft golden daylight
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = 'rgba(228, 212, 190, 0.14)'
  ctx.fillRect(0, 0, w, h)

  // Pass 2: Soft-Light Contrast Punch
  // — Lifts mid-tone contrast, makes architecture stand out
  // — Does not crush deep shadows
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
    let cachedMaxScroll = 1

    const loader = createSequenceLoader(() => redraw())
    let resizeObserver: ResizeObserver | null = null

    function updateMaxScroll() {
      const docEl = document.documentElement
      const body = document.body
      const scrollHeight = Math.max(
        body.scrollHeight,
        docEl.scrollHeight,
        body.offsetHeight,
        docEl.offsetHeight,
        body.clientHeight,
        docEl.clientHeight,
      )
      const clientHeight = window.innerHeight || docEl.clientHeight
      cachedMaxScroll = Math.max(1, scrollHeight - clientHeight)
    }

    function redraw(force = false) {
      const canvas = canvasRef.current
      if (!canvas) return
      const target = frameIndexRef.current
      const available = nearestLoadedFrame(loader, target)
      if (available === -1) return
      if (available === lastDrawnIndexRef.current && !force) return
      const img = loader.getFrame(available)
      const ctx = canvas.getContext('2d')
      if (!img || !ctx) return
      drawCover(ctx, img, FRAME_WIDTH, FRAME_HEIGHT, canvas.width, canvas.height)
      applyCanvasCinematicGrade(ctx, canvas.width, canvas.height)
      lastDrawnIndexRef.current = available
    }

    function resizeCanvas() {
      const canvas = canvasRef.current
      if (!canvas) return
      updateMaxScroll()
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

    // Request initial frame 0 eagerly so building is visible inside portal immediately
    loader.request(0)
    for (let i = 1; i <= 11; i += 1) loader.request(i)
    loader.startBackgroundFill()

    if (canvasRef.current) {
      resizeObserver = new ResizeObserver(() => resizeCanvas())
      resizeObserver.observe(canvasRef.current)
    }
    window.addEventListener('resize', updateMaxScroll, { passive: true })
    window.addEventListener('orientationchange', resizeCanvas)
    resizeCanvas()

    const updateStageFromScroll = () => {
      const p = getHeroProgress()

      // Phase 3 & 4: Synchronized Camera Push toward world (p = 0.35 -> 0.65 portal expansion)
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

      // Living Window: Subtle ambient environmental breathing & micro-drift behind portal window cutout
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

      if (canvasRef.current) {
        gsap.set(canvasRef.current, {
          scale: totalCanvasScale,
          x: ambientX,
          y: ambientY,
        })
      }

      // Mode 1: Update frame for Hero cinematic
      const targetFrame = mapProgressToFrame()
      if (targetFrame !== frameIndexRef.current) {
        frameIndexRef.current = targetFrame
        loader.request(targetFrame)
        loader.request(Math.max(0, targetFrame - 2))
        loader.request(Math.min(FRAME_COUNT - 1, targetFrame + 2))
        redraw()
      }

      // Mode 1 -> Mode 2: Cross-fade opacity at end of Hero into Section 2
      const mode1Opacity = getHeroCinematicOpacity()
      if (canvasWrapRef.current) {
        gsap.set(canvasWrapRef.current, { opacity: mode1Opacity })
      }

      // Hero Still Cover: art-direction benchmark image, visible p=0.65–0.96
      const stillOpacity = getHeroStillOpacity()
      if (heroStillRef.current) {
        gsap.set(heroStillRef.current, { opacity: stillOpacity })
      }
    }

    // Attach ScrollTrigger on entire page scroll to drive ticker updates
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: () => {
        updateStageFromScroll()
      },
    })

    window.addEventListener('scroll', updateStageFromScroll, { passive: true })
    gsap.ticker.add(updateStageFromScroll)
    updateStageFromScroll()

    return () => {
      st.kill()
      window.removeEventListener('scroll', updateStageFromScroll)
      window.removeEventListener('resize', updateMaxScroll)
      gsap.ticker.remove(updateStageFromScroll)
      loader.destroy()
      resizeObserver?.disconnect()
      window.removeEventListener('orientationchange', resizeCanvas)
    }
  }, [])

  return (
    <div ref={stageRef} className={styles.stage} aria-hidden="true">
      {/* Mode 2: Permanent Green Architectural World (Sections 2–10) */}
      <div className={styles.architecturalWorld}>
        <div className={styles.ambientBreathingGrid} />
        <div className={styles.ambientGlowMesh} />
      </div>

      {/* Mode 1: Hero Cinematic Canvas (Hero Only, cross-fades out at end of Hero) */}
      <div ref={canvasWrapRef} className={styles.heroCinematicWrap}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      {/* Hero Still Cover: Art-direction benchmark — holds after portal, crossfades invisibly into canvas */}
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
