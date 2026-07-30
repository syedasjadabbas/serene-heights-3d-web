import { forwardRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Group } from 'three'
import type { MutableRefObject } from 'react'
import type { HeroSceneProgress } from './HeroScene'

interface HeroModelProps {
  progressRef: MutableRefObject<HeroSceneProgress>
}

/**
 * Placeholder central visual for the Hero. This is the intended swap point
 * for the production asset — replace the returned geometry with
 * `useGLTF('/models/resort.glb').scene` once it exists. The camera rig and
 * scroll-driven transforms in HeroScene operate on the forwarded group ref
 * and are otherwise unaffected by what this component renders.
 */
const HeroModel = forwardRef<Group, HeroModelProps>(function HeroModel({ progressRef }, ref) {
  const creamMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f4efe4',
        roughness: 0.55,
        metalness: 0.05,
        flatShading: true,
        transparent: true,
      }),
    [],
  )

  const forestMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3c5b4c',
        roughness: 0.6,
        metalness: 0.08,
        flatShading: true,
        transparent: true,
      }),
    [],
  )

  const ringMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f4efe4',
        roughness: 0.25,
        metalness: 0.2,
        transparent: true,
        opacity: 0.45,
      }),
    [],
  )

  const peaks = useMemo(
    () => [
      { position: [0, -0.35, 0] as const, scale: [1.05, 1.3, 1.05] as const, material: creamMaterial },
      { position: [-0.95, -0.62, -0.5] as const, scale: [0.72, 0.8, 0.72] as const, material: forestMaterial },
      { position: [1, -0.68, -0.75] as const, scale: [0.64, 0.7, 0.64] as const, material: forestMaterial },
    ],
    [creamMaterial, forestMaterial],
  )

  // As photography takes over (see HeroPhotography), fade fully out well before
  // the DeconstructionSequence canvas transition begins at progress 0.55 — camera
  // motion and scale in HeroScene's SceneRig are untouched.
  useFrame((_, delta) => {
    const smoothing = Math.min(1, delta * 4)
    const fadeFactor = THREE.MathUtils.lerp(
      1,
      0,
      THREE.MathUtils.smoothstep(progressRef.current.scroll, 0.28, 0.5),
    )

    creamMaterial.opacity += (fadeFactor - creamMaterial.opacity) * smoothing
    forestMaterial.opacity += (fadeFactor - forestMaterial.opacity) * smoothing
    ringMaterial.opacity += (0.45 * fadeFactor - ringMaterial.opacity) * smoothing
  })

  return (
    <group ref={ref}>
      {peaks.map((peak, i) => (
        <mesh key={i} position={peak.position} scale={peak.scale} material={peak.material}>
          <coneGeometry args={[1, 2, 4, 1]} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2.15, 0, 0]} material={ringMaterial}>
        <torusGeometry args={[1.65, 0.01, 16, 128]} />
      </mesh>
    </group>
  )
})

export default HeroModel
