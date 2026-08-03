/**
 * Master visual stage state for Serene Heights.
 *
 * Scopes the Cinematic Opening Portal & Hero Sequence:
 * Phase 1 to 4 (0.00 -> 0.70): Portal opening window sequence & World Arrival Pause (Frame 0 holds).
 * Phase 5 & 6 (0.70 -> 0.88): SERENE HEIGHTS Title Emergence & Navigation Reveal (Frame 0 holds).
 * Phase 7 (0.88 -> 0.96): Exploded architectural assembly unfolds (Frame 0 -> 68).
 * Phase 8 (0.96 -> 1.00): Hold at Frame 68 & cross-fade into Mode 2 Permanent Green World for Section 2+.
 *
 * Hero Still Cover Layer:
 * The opening still (art-direction benchmark image) is visible from p=0.65 to p=0.96.
 * It holds fully opaque from p=0.70–0.88, then crossfades invisibly with the canvas p=0.88–0.96.
 * The canvas mirrors this: invisible until p=0.88, then fades in p=0.88–0.96.
 * The visitor should never notice where the still ends and the living film begins.
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

  // Hold Frame 0 pristine through portal expansion, arrival pause, title emergence & nav reveal
  if (p <= 0.88) return 0

  // Exploded architectural assembly unfolds only after arrival & UI have settled (0.88 -> 0.96)
  if (p < 0.96) {
    const normP = (p - 0.88) / 0.08
    // Smooth S-curve easing
    const easeP = (1 - Math.cos(normP * Math.PI)) / 2
    return Math.min(MAX_FRAME, Math.max(0, Math.round(easeP * MAX_FRAME)))
  }

  // Phase 8 (0.96 -> 1.00): Hold completed frame
  return MAX_FRAME
}

/**
 * Returns opacity for the Hero Still Cover layer (the art-direction benchmark image).
 *
 * Timeline:
 *   p < 0.65  → 0   (portal not yet complete)
 *   0.65–0.72 → 0→1 (fade in gently as world is revealed)
 *   0.72–0.88 → 1   (hold perfectly still — visitor absorbs the destination)
 *   0.88–0.96 → 1→0 (invisible crossfade out as canvas fades in)
 *   p > 0.96  → 0
 */
export function getHeroStillOpacity(progressOverride?: number): number {
  const p = progressOverride !== undefined ? progressOverride : heroProgress

  if (p < 0.65) return 0

  // Fade in: 0.65 → 0.72
  if (p < 0.72) {
    const normIn = (p - 0.65) / 0.07
    const easeIn = (1 - Math.cos(normIn * Math.PI)) / 2
    return Math.min(1, Math.max(0, easeIn))
  }

  // Hold still: 0.72 → 0.88
  if (p <= 0.88) return 1

  // Crossfade out: 0.88 → 0.96 (mirrors canvas fade-in)
  if (p < 0.96) {
    const normOut = (p - 0.88) / 0.08
    const easeOut = (1 - Math.cos(normOut * Math.PI)) / 2
    return Math.min(1, Math.max(0, 1 - easeOut))
  }

  return 0
}

/**
 * Returns opacity for the Hero Canvas layer (frame sequence animation).
 *
 * Timeline:
 *   p < 0.88  → 0   (canvas invisible — still cover is showing)
 *   0.88–0.96 → 0→1 (crossfade in as still fades out — invisible transition)
 *   0.96–1.00 → 1→0 (cross-fade out at end of Hero into Section 2)
 */
export function getHeroCinematicOpacity(progressOverride?: number): number {
  const p = progressOverride !== undefined ? progressOverride : heroProgress

  // Canvas invisible while still cover is showing
  if (p < 0.88) return 0

  // Crossfade in: 0.88 → 0.96 (mirrors still fade-out)
  if (p < 0.96) {
    const normIn = (p - 0.88) / 0.08
    const easeIn = (1 - Math.cos(normIn * Math.PI)) / 2
    return Math.min(1, Math.max(0, easeIn))
  }

  // Full opacity during architectural animation
  if (p < 1.00) {
    const fade = (p - 0.96) / 0.04
    return 1 - Math.min(1, Math.max(0, fade))
  }

  return 0
}
