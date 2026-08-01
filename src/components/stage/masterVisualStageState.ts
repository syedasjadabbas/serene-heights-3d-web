/**
 * Master visual stage state for Serene Heights.
 * 
 * - Hero owns the complete 96-frame cinematic deconstruction sequence (Frame 1 to Frame 96).
 * - As the user scrolls through Hero (progress 0.0 to 0.80 across document scroll, corresponding to Hero's 500vh pinned runway),
 *   the sequence scrubs from Frame 1 (index 0) to Frame 96 (index 95), reaching the strongest exploded architectural state alongside the late wordmark.
 * - At Hero exit and beyond (progress >= 0.80), the visual stage holds on Frame 96 (index 95) continuously behind Section 2.
 */
export function mapProgressToFrame(progress: number): number {
  const p = Math.min(1, Math.max(0, progress))
  const HERO_EXIT_PROGRESS = 0.80

  if (p <= 0) return 0
  if (p >= HERO_EXIT_PROGRESS) return 95

  const heroProgress = p / HERO_EXIT_PROGRESS
  return Math.round(heroProgress * 95)
}



