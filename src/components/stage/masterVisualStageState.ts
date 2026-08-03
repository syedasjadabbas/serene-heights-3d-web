/**
 * Master visual stage state for Serene Heights.
 *
 * Scopes the Cinematic Opening Portal & Hero Sequence:
 * Phase 1 to 4 (0.00 -> 0.55): Portal opening window sequence (Frame 0 holds).
 * Phase 5 & 6 (0.55 -> 0.92): Hero title reveal & exploded architectural assembly (Frame 0 -> 68).
 * Phase 7 (0.92 -> 1.00): Hold at Frame 68 & cross-fade into Mode 2 Permanent Green World for Section 2+.
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

  // Phases 1 to 4 (0.00 -> 0.55): Hold Frame 0 while entering portal world
  if (p <= 0.55) return 0

  // Phases 5 & 6 (0.55 -> 0.92): Exploded architectural assembly unfolds with S-curve easing
  if (p < 0.92) {
    const normP = (p - 0.55) / 0.37
    // Smooth S-curve easing
    const easeP = (1 - Math.cos(normP * Math.PI)) / 2
    return Math.min(MAX_FRAME, Math.max(0, Math.round(easeP * MAX_FRAME)))
  }

  // Phase 7 (0.92 -> 1.00): Hold completed frame
  return MAX_FRAME
}

/**
 * Returns opacity (1 -> 0) for Hero Canvas layer.
 * Cross-fades out between p = 0.94 and p = 1.00 at end of Hero into Section 2.
 */
export function getHeroCinematicOpacity(progressOverride?: number): number {
  const p = progressOverride !== undefined ? progressOverride : heroProgress
  if (p <= 0.94) return 1
  if (p < 1.00) {
    const fade = (p - 0.94) / 0.06
    return 1 - Math.min(1, Math.max(0, fade))
  }
  return 0
}
