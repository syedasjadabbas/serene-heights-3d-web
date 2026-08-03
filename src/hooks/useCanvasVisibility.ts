import { useEffect, useRef, useState } from 'react'

interface UseCanvasVisibilityOptions {
  /**
   * IntersectionObserver rootMargin.
   * Positive values pre-wake the canvas before it enters the viewport,
   * giving Three.js time to compile shaders.
   * Default: "200px 0px" (200 px lookahead at top & bottom).
   */
  rootMargin?: string
}

interface UseCanvasVisibilityResult {
  /** Attach this ref to the wrapper div that contains the <Canvas>. */
  containerRef: React.RefObject<HTMLDivElement>
  /**
   * True when the section is within rootMargin of the viewport.
   * Drive <Canvas frameloop={isVisible ? 'always' : 'never'}> with this.
   */
  isVisible: boolean
}

/**
 * Visibility-gates an R3F <Canvas> so it only renders when near the viewport.
 *
 * Usage:
 *   const { containerRef, isVisible } = useCanvasVisibility()
 *   <div ref={containerRef}>
 *     <Canvas frameloop={isVisible ? 'always' : 'never'}>
 *       ...
 *     </Canvas>
 *   </div>
 *
 * When isVisible is false, R3F's render loop is paused completely:
 * - All useFrame callbacks stop executing
 * - Zero GPU draw calls are submitted
 * - The WebGL context remains alive and warm, resuming in one frame
 *   when visibility returns (no shader recompilation, no flash)
 */
export function useCanvasVisibility(
  options: UseCanvasVisibilityOptions = {},
): UseCanvasVisibilityResult {
  const { rootMargin = '200px 0px' } = options
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return { containerRef, isVisible }
}
