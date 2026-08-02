import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function FloatingGalleryWireframes() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    groupRef.current.rotation.y = Math.sin(t * 0.03) * 0.05
    groupRef.current.position.y = Math.sin(t * 0.08) * 0.1
  })

  const frames = useMemo(() => {
    return [
      { pos: [-8, 2.5, -4] as const, scale: [1.8, 2.4, 0.2] as const },
      { pos: [-2, -2.5, -5] as const, scale: [2.2, 1.6, 0.2] as const },
      { pos: [4, 3, -4] as const, scale: [1.6, 2.2, 0.2] as const },
      { pos: [10, -2, -3] as const, scale: [2.0, 1.8, 0.2] as const },
    ]
  }, [])

  return (
    <group ref={groupRef}>
      {/* Blueprint Grid Floor Mesh */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.5, 0]}>
        <planeGeometry args={[60, 30, 40, 20]} />
        <meshBasicMaterial
          color="#c8a264"
          wireframe
          transparent
          opacity={0.03}
        />
      </mesh>

      {/* Floating Blueprint Glass Panel Frames */}
      {frames.map((item, i) => (
        <mesh key={i} position={item.pos} scale={item.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? '#f3d498' : '#8ba89b'}
            wireframe
            transparent
            opacity={0.12}
          />
        </mesh>
      ))}
    </group>
  )
}

function FloatingGoldParticles() {
  const count = 35
  const particlesRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
    }
    return pos
  }, [count])

  useFrame((state) => {
    if (!particlesRef.current) return
    const t = state.clock.getElapsedTime()
    particlesRef.current.rotation.y = t * 0.012
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#f3d498"
        transparent
        opacity={0.18}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function SectionSixCanvas() {
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
        camera={{ position: [0, 0, 9], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={0.6} color="#f3d498" />

        <FloatingGalleryWireframes />
        <FloatingGoldParticles />

        <fog attach="fog" args={['#0a1410', 6, 22]} />
      </Canvas>
    </div>
  )
}
