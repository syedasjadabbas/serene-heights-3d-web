import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCanvasVisibility } from '../../hooks/useCanvasVisibility'

function FloatingInvestmentWireframes() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    groupRef.current.rotation.y = Math.sin(t * 0.04) * 0.06
    groupRef.current.rotation.x = Math.cos(t * 0.03) * 0.03
    groupRef.current.position.y = Math.sin(t * 0.1) * 0.12
  })

  // Blueprint wireframe cubes & planes data
  const frames = useMemo(() => {
    return [
      { pos: [-6, 3, -4] as const, scale: 1.5, rotSpeed: 0.08 },
      { pos: [6.5, -2, -3] as const, scale: 1.8, rotSpeed: 0.06 },
      { pos: [-5.5, -6, -5] as const, scale: 1.2, rotSpeed: 0.1 },
    ]
  }, [])

  return (
    <group ref={groupRef}>
      {/* Blueprint Grid Floor Mesh */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[45, 45, 30, 30]} />
        <meshBasicMaterial
          color="#c8a264"
          wireframe
          transparent
          opacity={0.03}
        />
      </mesh>

      {/* Floating Blueprint Wireframe Cubes */}
      {frames.map((item, i) => (
        <mesh key={i} position={item.pos} scale={item.scale}>
          <boxGeometry args={[1.6, 1.6, 1.6]} />
          <meshBasicMaterial
            color={i === 1 ? '#f3d498' : '#8ba89b'}
            wireframe
            transparent
            opacity={0.13}
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
      pos[i * 3] = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
    }
    return pos
  }, [count])

  useFrame((state) => {
    if (!particlesRef.current) return
    const t = state.clock.getElapsedTime()
    particlesRef.current.rotation.y = t * 0.015
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
        opacity={0.2}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function SectionFiveCanvas() {
  const { containerRef, isVisible } = useCanvasVisibility()

  return (
    <div
      ref={containerRef}
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
        frameloop={isVisible ? 'always' : 'never'}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={0.6} color="#f3d498" />

        <FloatingInvestmentWireframes />
        <FloatingGoldParticles />

        <fog attach="fog" args={['#0a1410', 6, 22]} />
      </Canvas>
    </div>
  )
}
