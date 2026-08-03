/**
 * Master visual stage state for Serene Heights.
 *
 * Pure state module deriving all visual stage values deterministically
 * from normalized scroll progress p (0.0 -> 1.0).
 */

let heroProgress = 0
type Listener = (p: number) => void
const listeners = new Set<Listener>()

export function setHeroProgress(progress: number) {
  heroProgress = Math.min(1, Math.max(0, progress))
  listeners.forEach((fn) => fn(heroProgress))
}

export function getHeroProgress(): number {
  return heroProgress
}

export function subscribeHeroProgress(fn: Listener): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** Returns the frame index (0..68) for Hero Cinematic */
export function mapProgressToFrame(progressOverride?: number): number {
  const p = progressOverride !== undefined ? progressOverride : heroProgress
  const MAX_FRAME = 68

  if (p <= 0.88) return 0

  if (p < 0.96) {
    const normP = (p - 0.88) / 0.08
    const easeP = (1 - Math.cos(normP * Math.PI)) / 2
    return Math.min(MAX_FRAME, Math.max(0, Math.round(easeP * MAX_FRAME)))
  }

  return MAX_FRAME
}

/** Returns opacity for the Hero Still Cover layer */
export function getHeroStillOpacity(progressOverride?: number): number {
  const p = progressOverride !== undefined ? progressOverride : heroProgress

  if (p < 0.65) return 0

  if (p < 0.72) {
    const normIn = (p - 0.65) / 0.07
    const easeIn = (1 - Math.cos(normIn * Math.PI)) / 2
    return Math.min(1, Math.max(0, easeIn))
  }

  if (p <= 0.88) return 1

  if (p < 0.96) {
    const normOut = (p - 0.88) / 0.08
    const easeOut = (1 - Math.cos(normOut * Math.PI)) / 2
    return Math.min(1, Math.max(0, 1 - easeOut))
  }

  return 0
}

/** Returns opacity for the Hero Canvas layer */
export function getHeroCinematicOpacity(progressOverride?: number): number {
  const p = progressOverride !== undefined ? progressOverride : heroProgress

  if (p < 0.88) return 0

  if (p < 0.96) {
    const normIn = (p - 0.88) / 0.08
    const easeIn = (1 - Math.cos(normIn * Math.PI)) / 2
    return Math.min(1, Math.max(0, easeIn))
  }

  if (p < 1.00) {
    const fade = (p - 0.96) / 0.04
    return 1 - Math.min(1, Math.max(0, fade))
  }

  return 0
}
