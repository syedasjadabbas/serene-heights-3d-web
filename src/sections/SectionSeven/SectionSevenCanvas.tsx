import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function FloatingBlueprintGrid() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    meshRef.current.rotation.z = Math.sin(t * 0.04) * 0.02
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -3.5, -2]}>
      <planeGeometry args={[50, 30, 35, 20]} />
      <meshBasicMaterial
        color="#c8a264"
        wireframe
        transparent
        opacity={0.035}
      />
    </mesh>
  )
}

function AmbientGoldParticles() {
  const count = 30
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2
    }
    return pos
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.getElapsedTime()
    pointsRef.current.rotation.y = t * 0.015
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#f3d498"
        transparent
        opacity={0.16}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function SectionSevenCanvas() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[4, 6, 4]} intensity={0.5} color="#f3d498" />

        <FloatingBlueprintGrid />
        <AmbientGoldParticles />

        <fog attach="fog" args={['#0a1410', 5, 18]} />
      </Canvas>
    </div>
  )
}
