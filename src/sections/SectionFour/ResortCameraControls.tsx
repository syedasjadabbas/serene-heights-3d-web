import { useEffect, useRef } from 'react'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { CAMERA_CONFIG } from './config'

export default function ResortCameraControls() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()

  // Adjust camera distance responsively on screen resize
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
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
      ref={controlsRef}
      enableDamping
      dampingFactor={CAMERA_CONFIG.dampingFactor}
      minDistance={CAMERA_CONFIG.minDistance}
      maxDistance={CAMERA_CONFIG.maxDistance}
      minPolarAngle={CAMERA_CONFIG.minPolarAngle}
      maxPolarAngle={CAMERA_CONFIG.maxPolarAngle}
      target={CAMERA_CONFIG.defaultTarget}
      makeDefault
    />
  )
}
