import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

interface FrameLimiterProps {
  /** Target frames per second while active. */
  fps: number
  /** Render only while true (e.g. the section is on screen). */
  active: boolean
}

/**
 * Drives a frameloop="demand" <Canvas> at a capped frame rate.
 *
 * The decorative background scenes are slow-drifting wireframes: at 30 fps
 * they look identical to 60 fps but cost the GPU half as much, which leaves
 * room for the scroll animations on integrated graphics. useFrame receives
 * the real elapsed delta, so motion speed is unchanged.
 */
export default function FrameLimiter({ fps, active }: FrameLimiterProps) {
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    if (!active) return
    const interval = 1000 / fps
    let last = 0
    let rafId = requestAnimationFrame(function tick(now) {
      // Small tolerance so a 60 Hz display lands on every 2nd vsync
      if (now - last >= interval - 2) {
        last = now
        invalidate()
      }
      rafId = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(rafId)
  }, [fps, active, invalidate])

  return null
}
