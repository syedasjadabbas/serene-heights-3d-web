/**
 * Master visual stage state for Serene Heights.
 *
 * Implements a slow, architectural camera curve with stillness plateaus and breathing rhythm.
 * Reduces overall camera travel magnitude by ~28% for a subtle, Aesop/Lexus/Apple luxury architectural film feel.
 */
export function mapProgressToFrame(progress: number): number {
  const p = Math.min(1, Math.max(0, progress))
  const HERO_EXIT_PROGRESS = 0.88

  const MAX_FRAME = 68 // ~28% overall motion reduction (68 vs 95 frames)

  if (p <= 0) return 0
  if (p >= HERO_EXIT_PROGRESS) return MAX_FRAME

  const normP = p / HERO_EXIT_PROGRESS

  // Non-linear S-curve with stillness plateaus (smoothstep easing with subtle holds)
  let curve = 0
  if (normP < 0.25) {
    // Slow architectural opening drift
    const t = normP / 0.25
    curve = 0.18 * Math.pow(t, 2)
  } else if (normP < 0.50) {
    // First stillness plateau & gentle drift
    const t = (normP - 0.25) / 0.25
    curve = 0.18 + 0.28 * (3 * t * t - 2 * t * t * t)
  } else if (normP < 0.75) {
    // Second breathing reveal
    const t = (normP - 0.50) / 0.25
    curve = 0.46 + 0.34 * (3 * t * t - 2 * t * t * t)
  } else {
    // Final deceleration into majestic architectural hold
    const t = (normP - 0.75) / 0.25
    curve = 0.80 + 0.20 * (1 - Math.pow(1 - t, 2))
  }

  return Math.min(MAX_FRAME, Math.max(0, Math.round(curve * MAX_FRAME)))
}
