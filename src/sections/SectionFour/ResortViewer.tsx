import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import ResortLighting from './ResortLighting'
import ResortCameraControls from './ResortCameraControls'
import ResortModel from './ResortModel'
import ResortHotspots from './ResortHotspots'
import ResortLoader from './ResortLoader'
import { CAMERA_CONFIG } from './config'

export default function ResortViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldInitialize, setShouldInitialize] = useState(false)

  // Lazy Initialization: Only mount Three.js Canvas when Section 4 approaches viewport
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldInitialize(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px' }, // Pre-initializes 300px before scrolling into view
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: 'transparent',
      }}
    >
      <ResortLoader />

      {shouldInitialize && (
        <Canvas
          camera={{
            position: CAMERA_CONFIG.defaultPosition,
            fov: CAMERA_CONFIG.fov,
          }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
        >
          <color attach="background" args={['#0b1410']} />
          <fog attach="fog" args={['#0b1410', 14, 38]} />

          <ResortLighting />

          <Suspense fallback={null}>
            <ResortModel />
            <ResortHotspots />
          </Suspense>

          <ResortCameraControls />
        </Canvas>
      )}
    </div>
  )
}
