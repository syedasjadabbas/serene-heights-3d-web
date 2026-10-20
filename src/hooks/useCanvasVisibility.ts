import { useEffect, useRef, useState } from 'react'

interface UseCanvasVisibilityOptions {
  /**
   * IntersectionObserver rootMargin.
   * Positive values pre-wake the canvas before it enters the viewport,
   * giving Three.js time to compile shaders.
   * Default: "200px 0px" (200 px lookahead at top & bottom).
   */
  rootMargin?: string
  /**
   * IntersectionObserver rootMargin that forces the <Canvas> to mount if the
   * visitor scrolls towards it before the idle pre-warm queue reached it.
   * Default: "150% 0px".
   */
  mountMargin?: string
}

interface UseCanvasVisibilityResult {
  /** Attach this ref to the wrapper div that contains the <Canvas>. */
  containerRef: React.RefObject<HTMLDivElement | null>
  /**
   * True when the section is within rootMargin of the viewport.
   * Drive <Canvas frameloop={isVisible ? 'always' : 'demand'}> with this.
   */
  isVisible: boolean
  /**
   * Becomes true once (idle pre-warm, or approaching the section) and stays
   * true. Render the <Canvas> only when this is true.
   */
  shouldMount: boolean
}

// ── Idle pre-warm queue ────────────────────────────────────────────────
// Creating a WebGL context and compiling its shaders stalls the main thread
// for 100–250 ms on integrated GPUs. Doing that mid-scroll is a visible
// hitch, so every canvas is created ahead of time, one per idle slot after
// the page has loaded, and then kept for the life of the page.
const warmQueue: Array<() => void> = []
let warmScheduled = false

const whenIdle = (fn: () => void) => {
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 3000 })
  else setTimeout(fn, 200)
}

function drainWarmQueue() {
  const next = warmQueue.shift()
  if (!next) {
    warmScheduled = false
    return
  }
  next()
  // Leave a gap so one context's shader compile never stacks on the next
  setTimeout(() => whenIdle(drainWarmQueue), 400)
}

function enqueueWarm(fn: () => void) {
  warmQueue.push(fn)
  if (warmScheduled) return
  warmScheduled = true
  const start = () => setTimeout(() => whenIdle(drainWarmQueue), 1500)
  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })
}

/**
 * Visibility-gates an R3F <Canvas> so it only renders when near the viewport.
 *
 * Usage:
 *   const { containerRef, isVisible, shouldMount } = useCanvasVisibility()
 *   <div ref={containerRef}>
 *     {shouldMount && (
 *       <Canvas frameloop={isVisible ? 'always' : 'demand'}>
 *         ...
 *       </Canvas>
 *     )}
 *   </div>
 *
 * - The <Canvas> mounts during idle time after load (or earlier if the
 *   visitor scrolls towards it first) and is never unmounted, so no WebGL
 *   context is created or destroyed while the visitor is scrolling.
 * - frameloop 'demand' while off-screen renders exactly one frame on mount
 *   (compiling shaders off the critical path) and then nothing: all
 *   useFrame callbacks stop and zero draw calls are submitted until the
 *   section comes back into view.
 */
export function useCanvasVisibility(
  options: UseCanvasVisibilityOptions = {},
): UseCanvasVisibilityResult {
  const { rootMargin = '200px 0px', mountMargin = '150% 0px' } = options
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldMount, setShouldMount] = useState(false)

  useEffect(() => {
    let cancelled = false
    enqueueWarm(() => {
      if (!cancelled) setShouldMount(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { rootMargin },
    )

    const mountObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldMount(true)
          mountObserver.disconnect()
        }
      },
      { rootMargin: mountMargin },
    )

    observer.observe(el)
    mountObserver.observe(el)
    return () => {
      observer.disconnect()
      mountObserver.disconnect()
    }
  }, [rootMargin, mountMargin])

  return { containerRef, isVisible, shouldMount }
}
