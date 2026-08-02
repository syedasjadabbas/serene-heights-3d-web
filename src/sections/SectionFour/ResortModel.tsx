import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RESORT_MODEL_URL } from './config'

/**
 * Neutral Architectural Placeholder Model.
 * Rendered when GLB asset is loading or not yet present at RESORT_MODEL_URL.
 */
function ResortPlaceholderModel() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    groupRef.current.rotation.y = Math.sin(t * 0.12) * 0.05
  })

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Mountain Base Terrace */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[12, 0.4, 8]} />
        <meshStandardMaterial color="#1a2c25" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Main Alpine Resort Slabs */}
      {[0, 1.4, 2.8, 4.2, 5.6].map((y, idx) => (
        <group key={idx} position={[0, y, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[8.5 - idx * 0.6, 0.25, 5.5 - idx * 0.4]} />
            <meshStandardMaterial color="#2d4438" roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[7.8 - idx * 0.6, 0.95, 4.8 - idx * 0.4]} />
            <meshStandardMaterial
              color="#e9e2d1"
              roughness={0.1}
              metalness={0.9}
              transparent
              opacity={0.35}
            />
          </mesh>
          <mesh position={[4.2 - idx * 0.3, 0.5, 0]}>
            <boxGeometry args={[0.3, 0.8, 4.2 - idx * 0.4]} />
            <meshStandardMaterial color="#c8a264" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Roof Canopy Feature */}
      <mesh position={[0, 6.6, 0]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[6.5, 0.2, 4.2]} />
        <meshStandardMaterial color="#c8a264" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  )
}

/**
 * GLB Loader Component with Fallback Handling.
 * When real GLB model is added to public/models/resort.glb, it drops in automatically.
 */
function ResortGLBModel({ url }: { url: string }) {
  const gltf = useGLTF(url)
  const clonedScene = useMemo(() => gltf.scene.clone(), [gltf])

  useEffect(() => {
    return () => {
      // Clean resource disposal on unmount
      clonedScene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) => mat.dispose())
          } else {
            obj.material.dispose()
          }
        }
      })
    }
  }, [clonedScene])

  return <primitive object={clonedScene} position={[0, -1, 0]} />
}

export default function ResortModel() {
  // Preload model URL dynamically
  try {
    return <ResortGLBModel url={RESORT_MODEL_URL} />
  } catch {
    // If GLB asset is not yet created in /public/models/resort.glb, render placeholder
    return <ResortPlaceholderModel />
  }
}

// Preload GLB helper
useGLTF.preload(RESORT_MODEL_URL)
