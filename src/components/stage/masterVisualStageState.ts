/**
 * Master visual stage state for Serene Heights.
 *
 * Phase-Based Cinematic Choreography:
 * Phase 1 (0.00 -> 0.18): Calm green world (Frame 0). Small centered title. Still camera.
 * Phase 2 (0.18 -> 0.38): Title growth begins. Imperceptible camera push. Frame 0 holds.
 * Phase 3 (0.38 -> 0.82): Exploded architectural assembly unfolds (Frame 0 -> 68) with S-curve camera push.
 * Phase 4 (0.82 -> 1.00): Iconic hold at Frame 68 (0.82 -> 0.90), then cross-fade (0.90 -> 1.00) into Mode 2 Section 2+.
 */

let heroProgress = 0

export function setHeroProgress(progress: number) {
  heroProgress = Math.min(1, Math.max(0, progress))
}

export function getHeroProgress(): number {
  return heroProgress
}

/** Returns the frame index (0..68) for Hero Cinematic */
export function mapProgressToFrame(progressOverride?: number): number {
  const p = progressOverride !== undefined ? progressOverride : heroProgress
  const MAX_FRAME = 68

  // Phase 1 & Phase 2 (0.00 -> 0.38): Hold Frame 0 while brand establishes
  if (p <= 0.38) return 0

  // Phase 3 (0.38 -> 0.82): Exploded architectural sequence unfolds with S-curve easing
  if (p < 0.82) {
    const normP = (p - 0.38) / 0.44
    // Smooth S-curve easing
    const easeP = (1 - Math.cos(normP * Math.PI)) / 2
    return Math.min(MAX_FRAME, Math.max(0, Math.round(easeP * MAX_FRAME)))
  }

  // Phase 4 (0.82 -> 1.00): Hold completed frame
  return MAX_FRAME
}

/**
 * Returns opacity (1 -> 0) for Hero Canvas layer.
 * Cross-fades out between p = 0.90 and p = 1.00 at end of Hero into Section 2.
 */
export function getHeroCinematicOpacity(progressOverride?: number): number {
  const p = progressOverride !== undefined ? progressOverride : heroProgress
  if (p <= 0.90) return 1
  if (p < 1.00) {
    const fade = (p - 0.90) / 0.10
    return 1 - Math.min(1, Math.max(0, fade))
  }
  return 0
}
