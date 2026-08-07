import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useCanvasVisibility } from '../../hooks/useCanvasVisibility'
import ResortLighting from './ResortLighting'
import ResortCameraControls from './ResortCameraControls'
import ResortModel, { ResortPlaceholderModel } from './ResortModel'
import ResortHotspots from './ResortHotspots'
import ResortLoader from './ResortLoader'
import { CAMERA_CONFIG } from './config'

export default function ResortViewer() {
  // One-time latch: once the section enters the viewport, the Canvas mounts
  // permanently — we never unmount it (avoids GPU context destruction / flash).
  const [hasMounted, setHasMounted] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)

  // Shared visibility hook: drives both the one-time mount and the frameloop gate.
  // rootMargin '300px' pre-wakes 300 px before entry (same as the old custom IO)
  // so the Canvas and ContactShadows have time to initialise before the user arrives.
  const { containerRef, isVisible } = useCanvasVisibility({ rootMargin: '300px 0px' })

  // Promote isVisible → hasMounted exactly once (never reverts to false).
  useEffect(() => {
    if (isVisible && !hasMounted) setHasMounted(true)
  }, [isVisible, hasMounted])

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

      {hasMounted && (
        <div
          style={{
            width: '100%',
            height: '100%',
            opacity: canvasReady ? 1 : 0,
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
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
            // Gate the render loop: when off-screen, frameloop="never" stops
            // ALL useFrame subscribers — ContactShadows shadow pass, OrbitControls
            // damping updates, model drift animations — everything freezes at zero
            // GPU cost until the section is visible again.
            frameloop={isVisible ? 'always' : 'never'}
            onCreated={() => setCanvasReady(true)}
          >
            <ResortLighting />

            <Suspense fallback={<ResortPlaceholderModel />}>
              <ResortModel />
              <ResortHotspots />
            </Suspense>

            <ResortCameraControls />
          </Canvas>
        </div>
      )}
    </div>
  )
}

