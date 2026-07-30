import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import {
  FRAME_COUNT,
  FRAME_WIDTH,
  FRAME_HEIGHT,
  FOCAL,
  REDUCED_MOTION_FRAME,
  frameUrl,
  progressToFrame,
  canvasOpacityFor,
  approachEasingFor,
} from './deconstructionFrames'
import styles from './DeconstructionSequence.module.css'

export interface DeconstructionSequenceHandle {
  setScrollProgress: (value: number) => void
}

interface FrameEntry {
  image: HTMLImageElement
  status: 'idle' | 'loading' | 'ready'
}

function getMaxDpr(width: number): number {
  if (width < 640) return 1.5
  if (width < 1081) return 1.75
  return 2
}

type IdleHandle = number

function scheduleIdle(cb: () => void): IdleHandle {
  const w = window as unknown as {
    requestIdleCallback?: (cb: () => void) => number
  }
  if (typeof w.requestIdleCallback === 'function') {
    return w.requestIdleCallback(cb)
  }
  return window.setTimeout(cb, 200)
}

function cancelIdle(handle: IdleHandle): void {
  const w = window as unknown as {
    cancelIdleCallback?: (handle: number) => void
  }
  if (typeof w.cancelIdleCallback === 'function') {
    w.cancelIdleCallback(handle)
    return
  }
  window.clearTimeout(handle)
}

/**
 * Third cinematic Hero layer: a canvas-drawn, scroll-scrubbed frame sequence
 * sourced from the V2 architectural-deconstruction clip. Follows the same
 * imperative contract as HeroScene/HeroPhotography — progress arrives via
 * setScrollProgress from Hero.tsx's single ScrollTrigger, everything else is
 * refs + gsap.ticker, no React state in the hot path, no second trigger.
 */
const DeconstructionSequence = forwardRef<DeconstructionSequenceHandle>(
  function DeconstructionSequence(_props, ref) {
    const wrapRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const progressRef = useRef(0)
    const lastDrawnFrameRef = useRef(-1)
    const dprRef = useRef(1)
    const reducedRef = useRef(false)
    const framesRef = useRef<FrameEntry[]>([])
    const loadingRef = useRef<Set<number>>(new Set())

    if (framesRef.current.length === 0) {
      framesRef.current = Array.from({ length: FRAME_COUNT }, () => ({
        image: new Image(),
        status: 'idle',
      }))
    }

    useImperativeHandle(
      ref,
      () => ({
        setScrollProgress: (value: number) => {
          progressRef.current = value
        },
      }),
      [],
    )

    useEffect(() => {
      reducedRef.current = prefersReducedMotion()
    }, [])

    useEffect(() => {
      const wrap = wrapRef.current
      const canvas = canvasRef.current
      if (!wrap || !canvas) return

      const ctx = canvas.getContext('2d')

      const drawFrame = (index: number) => {
        const entry = framesRef.current[index]
        if (!ctx || !entry || entry.status !== 'ready') return
        const cw = canvas.width
        const ch = canvas.height
        if (cw === 0 || ch === 0) return
        const scale = Math.max(cw / FRAME_WIDTH, ch / FRAME_HEIGHT)
        const drawW = FRAME_WIDTH * scale
        const drawH = FRAME_HEIGHT * scale
        const dx = (cw - drawW) * (FOCAL.x / 100)
        const dy = (ch - drawH) * (FOCAL.y / 100)
        ctx.clearRect(0, 0, cw, ch)
        ctx.drawImage(entry.image, dx, dy, drawW, drawH)
        lastDrawnFrameRef.current = index
      }

      const loadFrame = (index: number, onReady?: () => void) => {
        const entry = framesRef.current[index]
        if (!entry || entry.status === 'ready' || loadingRef.current.has(index)) return
        loadingRef.current.add(index)
        entry.status = 'loading'
        const img = entry.image

        const finish = () => {
          entry.status = 'ready'
          loadingRef.current.delete(index)
          onReady?.()
        }
        const fail = () => {
          entry.status = 'idle'
          loadingRef.current.delete(index)
        }

        img.decoding = 'async'
        img.src = frameUrl(index)

        if (typeof img.decode === 'function') {
          img.decode().then(finish).catch(() => {
            // decode() can reject on some browsers even after a valid load; fall
            // back to the load event rather than treating it as unusable.
            if (img.complete && img.naturalWidth > 0) finish()
            else fail()
          })
        } else {
          img.onload = finish
          img.onerror = fail
        }
      }

      const resize = () => {
        const width = wrap.clientWidth
        const height = wrap.clientHeight
        if (width === 0 || height === 0) return
        const dpr = Math.min(window.devicePixelRatio || 1, getMaxDpr(width))
        dprRef.current = dpr
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)

        if (lastDrawnFrameRef.current >= 0) {
          drawFrame(lastDrawnFrameRef.current)
        } else {
          const fallbackIndex = reducedRef.current ? REDUCED_MOTION_FRAME : 0
          if (framesRef.current[fallbackIndex]?.status === 'ready') drawFrame(fallbackIndex)
        }
      }

      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(wrap)

      // Staged preload: first frame is highest priority (must be ready before the
      // transition becomes visible), then a small nearby window, then the rest
      // trickles in progressively during idle time.
      let cancelled = false
      let idleHandle: IdleHandle | null = null

      if (reducedRef.current) {
        loadFrame(REDUCED_MOTION_FRAME, () => drawFrame(REDUCED_MOTION_FRAME))
      } else {
        loadFrame(0, () => drawFrame(0))
        for (let i = 1; i <= 5; i += 1) loadFrame(i)

        let nextIndex = 6
        const step = () => {
          if (cancelled) return
          let loadedInBatch = 0
          while (nextIndex < FRAME_COUNT && loadedInBatch < 4) {
            loadFrame(nextIndex)
            nextIndex += 1
            loadedInBatch += 1
          }
          if (nextIndex < FRAME_COUNT) {
            idleHandle = scheduleIdle(step)
          }
        }
        idleHandle = scheduleIdle(step)
      }

      const tick = () => {
        const progress = progressRef.current
        const opacity = canvasOpacityFor(progress)
        const eased = approachEasingFor(progress)
        wrap.style.opacity = String(opacity)
        // "Approach" settle: canvas arrives slightly zoomed/offset and eases to
        // rest as it reaches full opacity, instead of a flat crossfade.
        wrap.style.transform = `scale(${1.06 - 0.06 * eased}) translateY(${(1 - eased) * 1.5}%)`

        if (reducedRef.current) return

        const targetFrame = progressToFrame(progress)
        const entry = framesRef.current[targetFrame]
        if (entry.status === 'ready') {
          if (lastDrawnFrameRef.current !== targetFrame) drawFrame(targetFrame)
        } else {
          loadFrame(targetFrame, () => {
            if (progressToFrame(progressRef.current) === targetFrame) drawFrame(targetFrame)
          })
        }

        for (const offset of [1, -1, 2, -2, 3, -3]) {
          const idx = targetFrame + offset
          if (idx >= 0 && idx < FRAME_COUNT) loadFrame(idx)
        }
      }

      gsap.ticker.add(tick)

      return () => {
        cancelled = true
        if (idleHandle !== null) cancelIdle(idleHandle)
        gsap.ticker.remove(tick)
        ro.disconnect()
        // Reset (not just abort) any in-flight loads so a remount — StrictMode's
        // dev-mode mount/cleanup/remount cycle, or a real unmount/remount — can
        // re-request them; otherwise loadingRef keeps them marked in-flight forever.
        for (const entry of framesRef.current) {
          if (entry.status === 'loading') {
            entry.image.onload = null
            entry.image.onerror = null
            entry.image.src = ''
            entry.status = 'idle'
          }
        }
        loadingRef.current.clear()
      }
    }, [])

    return (
      <div ref={wrapRef} className={styles.wrap} aria-hidden="true">
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
    )
  },
)

export default DeconstructionSequence
