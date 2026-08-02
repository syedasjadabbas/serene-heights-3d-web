import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SectionEightCanvasProps {
  activeSeason: number // 0: Winter, 1: Spring, 2: Summer, 3: Autumn
}

function SeasonalParticles({ activeSeason }: { activeSeason: number }) {
  const count = 64
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return pos
  }, [count])

  // Color, size & opacity tailored to season atmosphere
  const { color, size, opacity } = useMemo(() => {
    switch (activeSeason) {
      case 0:
        return { color: new THREE.Color('#e2f2f8'), size: 0.05, opacity: 0.22 } // Winter cool drifting snow
      case 1:
        return { color: new THREE.Color('#88bfa0'), size: 0.042, opacity: 0.18 } // Spring alpine petal mist
      case 2:
        return { color: new THREE.Color('#f6d89b'), size: 0.058, opacity: 0.24 } // Summer warm sunbeams
      case 3:
        return { color: new THREE.Color('#e09448'), size: 0.046, opacity: 0.20 } // Autumn copper amber embers
      default:
        return { color: new THREE.Color('#f6d89b'), size: 0.05, opacity: 0.20 }
    }
  }, [activeSeason])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.getElapsedTime()

    if (activeSeason === 0) {
      // Winter: Soft downward snowfall drift
      pointsRef.current.rotation.y = Math.sin(t * 0.06) * 0.06
      pointsRef.current.position.y = -((t * 0.18) % 3.5)
    } else if (activeSeason === 1) {
      // Spring: Swirling petal mist haze
      pointsRef.current.rotation.y = t * 0.018
      pointsRef.current.rotation.z = Math.sin(t * 0.05) * 0.04
    } else if (activeSeason === 2) {
      // Summer: Shimmering sunbeam float
      pointsRef.current.rotation.y = t * 0.022
      pointsRef.current.position.y = Math.sin(t * 0.28) * 0.14
    } else {
      // Autumn: Slow drifting amber embers
      pointsRef.current.rotation.y = Math.cos(t * 0.09) * 0.09
      pointsRef.current.position.x = Math.sin(t * 0.14) * 0.18
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={opacity}
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
