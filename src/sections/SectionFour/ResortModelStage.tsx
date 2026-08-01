import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Architectural GLB-Ready Placeholder Model.
 * Replace <ResortModelMesh /> inside this component with:
 * `const { scene } = useGLTF('/models/serene-heights.glb')`
 * `<primitive object={scene} />`
 */
function ResortModelMesh() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    // Subtle architectural breathing motion
    groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.08
    groupRef.current.position.y = Math.sin(t * 0.3) * 0.15
  })

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {/* Mountain Base Terrace */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[12, 0.4, 8]} />
        <meshStandardMaterial color="#1a2c25" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Main Alpine Resort Central Tower Slabs */}
      {[0, 1.4, 2.8, 4.2, 5.6].map((y, idx) => (
        <group key={idx} position={[0, y, 0]}>
          {/* Floor Slab */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[8.5 - idx * 0.6, 0.25, 5.5 - idx * 0.4]} />
            <meshStandardMaterial color="#2d4438" roughness={0.5} metalness={0.3} />
          </mesh>

          {/* Glazed Glass Window Bay */}
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

          {/* Cantilever Balcony Fins */}
          <mesh position={[4.2 - idx * 0.3, 0.5, 0]}>
            <boxGeometry args={[0.3, 0.8, 4.2 - idx * 0.4]} />
            <meshStandardMaterial color="#cea25c" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Roof Canopy Feature */}
      <mesh position={[0, 6.6, 0]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[6.5, 0.2, 4.2]} />
        <meshStandardMaterial color="#cea25c" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  )
}

export default function ResortModelStage() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 4, 16], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Alpine Atmosphere & Fog */}
        <color attach="background" args={['#101d18']} />
        <fog attach="fog" args={['#101d18', 12, 35]} />

        {/* Studio Architectural Lighting */}
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[14, 20, 12]}
          intensity={1.8}
          color="#f4efe4"
          castShadow
        />
        <directionalLight
          position={[-12, 10, -8]}
          intensity={0.6}
          color="#8ea3bf"
        />
        <pointLight position={[0, 8, 4]} intensity={0.8} color="#cea25c" />

        {/* 3D Model Scene */}
        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
          <ResortModelMesh />
        </Float>

        {/* Soft Floor Contact Shadows */}
        <ContactShadows
          position={[0, -1.8, 0]}
          opacity={0.65}
          scale={20}
          blur={2.4}
          far={10}
        />
      </Canvas>
    </div>
  )
}
