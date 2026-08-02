import { Environment, ContactShadows } from '@react-three/drei'

export default function ResortLighting() {
  return (
    <>
      {/* Soft Alpine Ambient Lighting */}
      <ambientLight intensity={0.45} />

      {/* Primary Key Light (Warm Sun / Directional) */}
      <directionalLight
        position={[14, 22, 12]}
        intensity={2.2}
        color="#fef3d6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={40}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
      />

      {/* Secondary Fill Light (Cool Alpine Sky Diffuse) */}
      <directionalLight
        position={[-12, 10, -8]}
        intensity={0.7}
        color="#9eb6d4"
      />

      {/* Rim / Accent Highlight (Gold Architectural Fin Reflection) */}
      <directionalLight
        position={[0, 16, -14]}
        intensity={1.2}
        color="#e6c687"
      />

      {/* HDRI Environment Preset Shading */}
      <Environment preset="city" environmentIntensity={0.65} />

      {/* Floor Soft Contact Shadows */}
      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.6}
        scale={24}
        blur={2.5}
        far={12}
        color="#040907"
      />
    </>
  )
}
