import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SectionEightCanvasProps {
  activeSeason: number // 0: Winter, 1: Spring, 2: Summer, 3: Autumn
}

function SeasonalParticles({ activeSeason }: { activeSeason: number }) {
  const count = 48
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return pos
  }, [count])

  // Color & Size depending on season
  const { color, size, opacity } = useMemo(() => {
    switch (activeSeason) {
      case 0:
        return { color: new THREE.Color('#dceef5'), size: 0.045, opacity: 0.18 } // Winter cool snow dust
      case 1:
        return { color: new THREE.Color('#7aa885'), size: 0.038, opacity: 0.15 } // Spring alpine sage mist
      case 2:
        return { color: new THREE.Color('#f3d498'), size: 0.052, opacity: 0.20 } // Summer warm sunbeams
      case 3:
        return { color: new THREE.Color('#d88a42'), size: 0.042, opacity: 0.18 } // Autumn amber embers
      default:
        return { color: new THREE.Color('#f3d498'), size: 0.045, opacity: 0.18 }
    }
  }, [activeSeason])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.getElapsedTime()

    if (activeSeason === 0) {
      // Winter: Gentle downward snow drift
      pointsRef.current.rotation.y = Math.sin(t * 0.05) * 0.05
      pointsRef.current.position.y = -((t * 0.15) % 3)
    } else if (activeSeason === 1) {
      // Spring: Swirling mist haze
      pointsRef.current.rotation.y = t * 0.015
      pointsRef.current.rotation.z = Math.sin(t * 0.04) * 0.03
    } else if (activeSeason === 2) {
      // Summer: Shimmering sunbeam float
      pointsRef.current.rotation.y = t * 0.02
      pointsRef.current.position.y = Math.sin(t * 0.25) * 0.12
    } else {
      // Autumn: Gentle amber embers sway
      pointsRef.current.rotation.y = Math.cos(t * 0.08) * 0.08
      pointsRef.current.position.x = Math.sin(t * 0.12) * 0.15
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
        <ambientLight intensity={0.35} />
        <SeasonalParticles activeSeason={activeSeason} />
        <fog attach="fog" args={['#0a1410', 5, 18]} />
      </Canvas>
    </div>
  )
}
