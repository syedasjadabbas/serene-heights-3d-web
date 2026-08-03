import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useCanvasVisibility } from '../../hooks/useCanvasVisibility'

/**
 * Floating Wireframe Glass Cubes & Architectural Geometries.
 */
function FloatingArchitecturalObjects() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.08
    groupRef.current.rotation.x = Math.cos(t * 0.04) * 0.04
    groupRef.current.position.y = Math.sin(t * 0.12) * 0.15
  })

  // Create floating cube data with refined positions
  const cubes = useMemo(() => {
    return [
      { pos: [-6.5, 3.5, -4] as const, scale: 1.3, rotSpeed: 0.1 },
      { pos: [6.5, -2.5, -3] as const, scale: 1.6, rotSpeed: 0.08 },
      { pos: [-5.5, -7, -5] as const, scale: 1.1, rotSpeed: 0.12 },
      { pos: [6, 7.5, -4] as const, scale: 1.4, rotSpeed: 0.09 },
    ]
  }, [])

  return (
    <group ref={groupRef}>
      {cubes.map((c, i) => (
        <mesh key={i} position={c.pos} scale={c.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#c8a264"
            wireframe
            transparent
            opacity={0.25}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      ))}

      {/* Floating Blueprint Wireframe Plane */}
      <mesh position={[0, -2, -8]} rotation={[-Math.PI / 3, 0, 0]}>
        <planeGeometry args={[30, 30, 20, 20]} />
        <meshStandardMaterial
          color="#1e3a2f"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  )
}

/**
 * Floating Gold Particles Field.
 */
function GoldParticles() {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, colors] = useMemo(() => {
    const count = 120
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const goldColor = new THREE.Color('#f3d498')

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12

      col[i * 3] = goldColor.r
      col[i * 3 + 1] = goldColor.g
      col[i * 3 + 2] = goldColor.b
    }
    return [pos, col]
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.getElapsedTime()
    pointsRef.current.rotation.y = t * 0.03
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.45}
        sizeAttenuation
      />
    </points>
  )
}

export default function SectionThreeCanvas() {
  const { containerRef, isVisible } = useCanvasVisibility()

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 1.5]}
        frameloop={isVisible ? 'always' : 'never'}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} color="#fef3d6" />
        <fog attach="fog" args={['#080f0c', 8, 26]} />

        <FloatingArchitecturalObjects />
        <GoldParticles />
      </Canvas>
    </div>
  )
}
