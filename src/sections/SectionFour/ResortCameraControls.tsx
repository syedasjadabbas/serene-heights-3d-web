import { useEffect, useState } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { CAMERA_CONFIG } from './config'

export default function ResortCameraControls() {
  const { camera } = useThree()
  const [finePointer] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches)

  // Frame the model per breakpoint. Only re-frames when the breakpoint
  // actually changes, so mobile URL-bar resizes don't wipe the user's view.
  useEffect(() => {
    let lastBucket = ''
    const handleResize = () => {
      const w = window.innerWidth
      const bucket = w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
      if (bucket === lastBucket) return
      lastBucket = bucket
      if (w < 768) {
        // Mobile view: Move camera further back to frame model
        camera.position.set(0, 6, 20)
      } else if (w < 1024) {
        // Tablet view
        camera.position.set(0, 5, 17)
      } else {
        // Desktop view
        camera.position.set(...CAMERA_CONFIG.defaultPosition)
      }
      camera.updateProjectionMatrix()
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [camera])

  return (
    <OrbitControls
      enableDamping
      dampingFactor={CAMERA_CONFIG.dampingFactor}
      minDistance={CAMERA_CONFIG.minDistance}
      maxDistance={CAMERA_CONFIG.maxDistance}
      minPolarAngle={CAMERA_CONFIG.minPolarAngle}
      maxPolarAngle={CAMERA_CONFIG.maxPolarAngle}
      target={CAMERA_CONFIG.defaultTarget}
      // The wheel keeps scrolling the page; drag orbits. On touch screens a
      // one-finger drag must scroll the page, so orbiting is mouse/trackpad only.
      enableZoom={false}
      enablePan={false}
      enabled={finePointer}
      makeDefault
    />
  )
}
