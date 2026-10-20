import { Environment, ContactShadows, Lightformer } from '@react-three/drei'

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

      {/* Locally generated studio environment: no HDR download from a
          third-party CDN, so the viewer works offline and can't fail on fetch */}
      <Environment resolution={256} environmentIntensity={0.65}>
        <Lightformer form="rect" intensity={2} color="#fef3d6" position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[20, 20, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#e6c687" position={[10, 3, 4]} rotation-y={-Math.PI / 2} scale={[10, 6, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#9eb6d4" position={[-10, 3, -4]} rotation-y={Math.PI / 2} scale={[10, 6, 1]} />
        <Lightformer form="ring" intensity={0.6} color="#ffffff" position={[0, 2, -12]} scale={6} />
      </Environment>

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
