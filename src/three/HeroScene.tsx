import { Suspense, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Group, PerspectiveCamera } from 'three'
import HeroModel from './HeroModel'
import { prefersReducedMotion } from '../motion/reducedMotion'

export interface HeroSceneProgress {
  /** 0 -> 1 scrub progress through the pinned Hero scroll sequence */
  scroll: number
  /** 0 -> 1 one-shot entrance progress, driven by the mount timeline */
  entrance: number
}

export interface HeroSceneHandle {
  setScrollProgress: (value: number) => void
  setEntranceProgress: (value: number) => void
}

interface CameraTargets {
  zStart: number
  zEnd: number
  fov: number
}

function getCameraTargets(width: number): CameraTargets {
  if (width < 640) return { zStart: 10.5, zEnd: 7.6, fov: 36 }
  if (width < 1080) return { zStart: 9.5, zEnd: 6.4, fov: 32 }
  return { zStart: 8.6, zEnd: 4.8, fov: 27 }
}

function SceneRig({ progressRef }: { progressRef: MutableRefObject<HeroSceneProgress> }) {
  const modelRef = useRef<Group>(null)
  const { camera, size } = useThree()
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const targets = useRef<CameraTargets>(getCameraTargets(size.width))

  useEffect(() => {
    targets.current = getCameraTargets(size.width)
    const perspective = camera as PerspectiveCamera
    if (typeof perspective.fov === 'number') {
      perspective.fov = targets.current.fov
      perspective.updateProjectionMatrix()
    }
  }, [size.width, camera])

  useFrame((_, delta) => {
    const { scroll, entrance } = progressRef.current
    const { zStart, zEnd } = targets.current
    const smoothing = Math.min(1, delta * 4)

    const dollyZ = THREE.MathUtils.lerp(zStart, zEnd, scroll)
    const entranceZ = THREE.MathUtils.lerp(zStart + 3.5, dollyZ, entrance)

    camera.position.z += (entranceZ - camera.position.z) * smoothing
    camera.position.y += (0.35 - camera.position.y) * smoothing
    camera.lookAt(0, 0, 0)

    const model = modelRef.current
    if (model) {
      const baseScale = THREE.MathUtils.lerp(0.7, 1, entrance)
      const scrollScale = THREE.MathUtils.lerp(1, 1.6, scroll)
      const targetScale = baseScale * scrollScale
      model.scale.setScalar(model.scale.x + (targetScale - model.scale.x) * smoothing)

      const targetY = THREE.MathUtils.lerp(-2.1, -0.75, entrance) + scroll * 0.35
      model.position.y += (targetY - model.position.y) * smoothing

      const targetTilt = THREE.MathUtils.lerp(0.35, 0, entrance)
      model.rotation.x += (targetTilt - model.rotation.x) * smoothing

      if (!reduced) {
        model.rotation.y += delta * 0.04
      }
    }
  })

  return (
    <>
      <ambientLight intensity={0.7} color="#f4efe4" />
      <directionalLight position={[4, 6, 5]} intensity={1.5} color="#fff8ea" />
      <directionalLight position={[-5, -2, -4]} intensity={0.4} color="#274435" />
      <HeroModel ref={modelRef} progressRef={progressRef} />
    </>
  )
}

interface HeroSceneProps {
  className?: string
}

const HeroScene = forwardRef<HeroSceneHandle, HeroSceneProps>(function HeroScene(
  { className },
  ref,
) {
  const progressRef = useRef<HeroSceneProgress>({ scroll: 0, entrance: 0 })

  useImperativeHandle(
    ref,
    () => ({
      setScrollProgress: (value: number) => {
        progressRef.current.scroll = value
      },
      setEntranceProgress: (value: number) => {
        progressRef.current.entrance = value
      },
    }),
    [],
  )

  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 30, position: [0, 0.4, 12], near: 0.1, far: 50 }}
    >
      <Suspense fallback={null}>
        <SceneRig progressRef={progressRef} />
      </Suspense>
    </Canvas>
  )
})

export default HeroScene
