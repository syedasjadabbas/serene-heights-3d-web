import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SectionEightCanvasProps {
  activeSeason: number // 0: Winter, 1: Spring, 2: Summer, 3: Autumn
}

function SeasonalParticles({ activeSeason }: { activeSeason: number }) {
  const count = 64
  const pointsRef = useRef<THREE.Points>(null)
  const matRef = useRef<THREE.PointsMaterial>(null)
  const currentColor = useRef(new THREE.Color('#e2f2f8'))

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return pos
  }, [count])

  // Color, size & opacity parameters per season
  const seasonParams = useMemo(() => {
    return [
      { color: new THREE.Color('#e2f2f8'), size: 0.052, opacity: 0.24 }, // 0: Winter (cool snow)
      { color: new THREE.Color('#88bfa0'), size: 0.044, opacity: 0.20 }, // 1: Spring (alpine petal mist)
      { color: new THREE.Color('#f6d89b'), size: 0.062, opacity: 0.26 }, // 2: Summer (golden sunbeams)
      { color: new THREE.Color('#e09448'), size: 0.048, opacity: 0.22 }, // 3: Autumn (copper embers)
    ]
  }, [])

  useFrame((state, delta) => {
    if (!pointsRef.current || !matRef.current) return
    const t = state.clock.getElapsedTime()
    const target = seasonParams[activeSeason] || seasonParams[0]

    // Smooth 0.9s environmental blending across seasons
    currentColor.current.lerp(target.color, delta * 3.2)
    matRef.current.color.copy(currentColor.current)
    matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, target.opacity, delta * 3.2)
    matRef.current.size = THREE.MathUtils.lerp(matRef.current.size, target.size, delta * 3.2)

    if (activeSeason === 0) {
      // Winter: Gentle falling snow across the viewport
      pointsRef.current.rotation.y = Math.sin(t * 0.05) * 0.08
      pointsRef.current.position.y = -((t * 0.22) % 4)
    } else if (activeSeason === 1) {
      // Spring: Slow drifting flower petals & soft breeze movement
      pointsRef.current.rotation.y = t * 0.02
      pointsRef.current.rotation.z = Math.sin(t * 0.06) * 0.05
      pointsRef.current.position.x = Math.sin(t * 0.1) * 0.2
    } else if (activeSeason === 2) {
      // Summer: Volumetric sunlight float & heat shimmer
      pointsRef.current.rotation.y = t * 0.025
      pointsRef.current.position.y = Math.sin(t * 0.3) * 0.16
    } else {
      // Autumn: Slow drifting amber leaves & copper haze
      pointsRef.current.rotation.y = Math.cos(t * 0.08) * 0.1
      pointsRef.current.position.x = Math.sin(t * 0.15) * 0.22
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.05}
        color="#e2f2f8"
        transparent
        opacity={0.22}
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
        <ambientLight intensity={0.38} />
        <SeasonalParticles activeSeason={activeSeason} />
        <fog attach="fog" args={['#0a1410', 4, 20]} />
      </Canvas>
    </div>
  )
}
