export const FRAME_COUNT = 75
export const FRAME_WIDTH = 1280
export const FRAME_HEIGHT = 720
export const FRAME_BASE_PATH = '/media/serene-heights/hero/deconstruction/sequence'

/** cover-fit anchor (0-100), matching heroPhotos.ts's focal convention — the
 * building mass in V2 sits left-of-centre with the freestanding tower further right. */
export const FOCAL = { x: 45, y: 46 }

/** Hero-progress sub-range this layer owns. Below TRANSITION_START it's invisible
 * (HeroPhotography still owns the frame). Between TRANSITION_START and
 * TRANSITION_END it settles in over the outgoing photography (opacity + a
 * small scale/translate "arrival" move, not a flat crossfade). From
 * TRANSITION_END through SEQUENCE_HOLD it owns the visual outright and maps
 * scroll to sequence frame; past SEQUENCE_HOLD it holds the final clean frame.
 *
 * TRANSITION_START intentionally starts BEFORE HeroPhotography's last envelope
 * exits (0.55, see heroPhotos.ts) — this layer fades in while photography is
 * still fading out, so the handoff is a genuine opacity overlap rather than a
 * sequential cut (which left a dead gap at exactly 0.55 in testing: photography
 * already at 0 opacity, canvas not yet begun). */
export const TRANSITION_START = 0.5
export const TRANSITION_END = 0.6

/**
 * progress -> sequence frame index, piecewise-linear. The source clip holds an
 * intact establishing shot for its first ~4s (extracted frames 0-48) before the
 * building actually starts separating (frames 48-74, the last clean frame).
 * Weighting the breakpoints this way spends most of the scroll budget on the
 * deconstruction itself rather than the static establishing hold.
 */
const FRAME_BREAKPOINTS: Array<[progress: number, frame: number]> = [
  [TRANSITION_END, 0],
  [0.7, 48],
  [0.94, FRAME_COUNT - 1],
]

export const SEQUENCE_HOLD = FRAME_BREAKPOINTS[FRAME_BREAKPOINTS.length - 1][0]

/** Reduced-motion users get one static, resolved frame instead of the scrubbed sequence. */
export const REDUCED_MOTION_FRAME = FRAME_COUNT - 1

export function frameUrl(index: number): string {
  const n = String(index + 1).padStart(4, '0')
  return `${FRAME_BASE_PATH}/frame-${n}.webp`
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function smoothstep(t: number): number {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

/** Pure function of progress — deterministic and reversible: the same progress
 * always resolves to the same frame index, so scrolling backwards reconstructs
 * the building exactly, with no velocity-dependent smoothing in the mapping itself. */
export function progressToFrame(progress: number): number {
  const [firstP, firstF] = FRAME_BREAKPOINTS[0]
  if (progress <= firstP) return firstF

  for (let i = 0; i < FRAME_BREAKPOINTS.length - 1; i += 1) {
    const [p0, f0] = FRAME_BREAKPOINTS[i]
    const [p1, f1] = FRAME_BREAKPOINTS[i + 1]
    if (progress <= p1) {
      const t = (progress - p0) / (p1 - p0)
      return Math.round(f0 + (f1 - f0) * t)
    }
  }

  return FRAME_COUNT - 1
}

export function canvasOpacityFor(progress: number): number {
  if (progress <= TRANSITION_START) return 0
  if (progress >= TRANSITION_END) return 1
  return smoothstep((progress - TRANSITION_START) / (TRANSITION_END - TRANSITION_START))
}

/** 0->1 across the transition window; drives the "approach" scale/translate settle. */
export function approachEasingFor(progress: number): number {
  return smoothstep((progress - TRANSITION_START) / (TRANSITION_END - TRANSITION_START))
}
