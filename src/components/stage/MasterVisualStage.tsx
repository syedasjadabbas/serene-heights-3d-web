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
import { mapProgressToFrame } from './masterVisualStageState'
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

export default function MasterVisualStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const frameIndexRef = { current: 0 }
    const lastDrawnIndexRef = { current: -1 }

    const loader = createSequenceLoader(() => redraw())
    let resizeObserver: ResizeObserver | null = null

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

    // Request initial frame 0 eagerly so building is visible immediately
    loader.request(0)
    for (let i = 1; i <= 11; i += 1) loader.request(i)
    loader.startBackgroundFill()

    if (canvasRef.current) {
      resizeObserver = new ResizeObserver(() => resizeCanvas())
      resizeObserver.observe(canvasRef.current)
    }
    window.addEventListener('orientationchange', resizeCanvas)
    resizeCanvas()

    const updateFrameFromScroll = () => {
      const docEl = document.documentElement
      const body = document.body
      const scrollTop = window.scrollY || docEl.scrollTop || body.scrollTop || 0
      const scrollHeight = Math.max(
        body.scrollHeight,
        docEl.scrollHeight,
        body.offsetHeight,
        docEl.offsetHeight,
        body.clientHeight,
        docEl.clientHeight,
      )
      const clientHeight = window.innerHeight || docEl.clientHeight
      const maxScroll = Math.max(1, scrollHeight - clientHeight)
      const pageProgress = Math.min(1, Math.max(0, scrollTop / maxScroll))

      const targetFrame = mapProgressToFrame(pageProgress)
      if (targetFrame !== frameIndexRef.current) {
        frameIndexRef.current = targetFrame
        loader.request(targetFrame)
        loader.request(Math.max(0, targetFrame - 2))
        loader.request(Math.min(FRAME_COUNT - 1, targetFrame + 2))
        redraw()
      }
    }

    // Attach ScrollTrigger on entire page scroll
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: () => {
 updateFrameFromScroll()
      },
    })

    // Smooth ScrollTrigger Fade Out: Fades video backdrop to 0 as Section 8 (#story) enters
    let fadeSt: ScrollTrigger | null = null
    const sectionEightEl = document.getElementById('story')
    if (sectionEightEl && stageRef.current) {
      fadeSt = ScrollTrigger.create({
        trigger: sectionEightEl,
        start: 'top 95%',  // Begins fade as Section 8 enters lower viewport
        end: 'top 30%',    // Fully faded out before Section 8 reaches top
        scrub: true,
        onUpdate: (self) => {
          if (stageRef.current) {
            gsap.set(stageRef.current, { opacity: 1 - self.progress })
          }
        },
      })
    }

    window.addEventListener('scroll', updateFrameFromScroll, { passive: true })
    gsap.ticker.add(updateFrameFromScroll)
    updateFrameFromScroll()

    return () => {
      st.kill()
      fadeSt?.kill()
      window.removeEventListener('scroll', updateFrameFromScroll)
      gsap.ticker.remove(updateFrameFromScroll)
      loader.destroy()
      resizeObserver?.disconnect()
      window.removeEventListener('orientationchange', resizeCanvas)
    }
  }, [])

  return (
    <div ref={stageRef} className={styles.stage} aria-hidden="true">
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label="Serene Heights visual sequence"
      />
    </div>
  )
}
