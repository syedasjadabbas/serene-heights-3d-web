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
   * IntersectionObserver rootMargin for mounting the <Canvas> at all.
   * Wider than rootMargin so the WebGL context is created a little before
   * rendering starts, and released once the section is far away.
   * Default: "100% 0px" (one viewport of lookahead).
   */
  mountMargin?: string
}

interface UseCanvasVisibilityResult {
  /** Attach this ref to the wrapper div that contains the <Canvas>. */
  containerRef: React.RefObject<HTMLDivElement | null>
  /**
   * True when the section is within rootMargin of the viewport.
   * Drive <Canvas frameloop={isVisible ? 'always' : 'never'}> with this.
   */
  isVisible: boolean
  /**
   * True when the section is within mountMargin of the viewport.
   * Render the <Canvas> only while this is true: unmounting releases the
   * WebGL context, so only the canvases near the viewport hold GPU memory.
   */
  shouldMount: boolean
}

/**
 * Visibility-gates an R3F <Canvas> so it only renders when near the viewport.
 *
 * Usage:
 *   const { containerRef, isVisible, shouldMount } = useCanvasVisibility()
 *   <div ref={containerRef}>
 *     {shouldMount && (
 *       <Canvas frameloop={isVisible ? 'always' : 'never'}>
 *         ...
 *       </Canvas>
 *     )}
 *   </div>
 *
 * When isVisible is false, R3F's render loop is paused completely:
 * - All useFrame callbacks stop executing
 * - Zero GPU draw calls are submitted
 * - The WebGL context stays warm while the section is within mountMargin,
 *   so scrolling back and forth nearby resumes in one frame
 * - Beyond mountMargin the <Canvas> unmounts and its context is released
 */
export function useCanvasVisibility(
  options: UseCanvasVisibilityOptions = {},
): UseCanvasVisibilityResult {
  const { rootMargin = '200px 0px', mountMargin = '100% 0px' } = options
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldMount, setShouldMount] = useState(false)

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
        setShouldMount(entry.isIntersecting)
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
