import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SectionEightCanvasProps {
  activeSeason: number // 0: Winter, 1: Spring, 2: Summer, 3: Autumn
}

function SeasonalParticles({ activeSeason }: { activeSeason: number }) {
  const count = 40
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return pos
  }, [count])

  // Color tint depending on season
  const color = useMemo(() => {
    switch (activeSeason) {
      case 0:
        return new THREE.Color('#e8f4f8') // Winter snow dust
      case 1:
        return new THREE.Color('#7aa885') // Spring alpine sage
      case 2:
        return new THREE.Color('#f3d498') // Summer warm gold
      case 3:
        return new THREE.Color('#c67d38') // Autumn amber ember
      default:
        return new THREE.Color('#f3d498')
    }
  }, [activeSeason])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.getElapsedTime()
    pointsRef.current.rotation.y = t * 0.012
    pointsRef.current.position.y = Math.sin(t * 0.2) * 0.1
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={color}
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function SectionEightCanvas({ activeSeason }: SectionEightCanvasProps) {
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
        <ambientLight intensity={0.3} />
        <SeasonalParticles activeSeason={activeSeason} />
        <fog attach="fog" args={['#0a1410', 5, 18]} />
      </Canvas>
    </div>
  )
}
