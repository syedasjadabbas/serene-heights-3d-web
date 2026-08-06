import background from '../../assets/hero/hero-background.png'
import bottom from '../../assets/hero/hero-bottom.png'
import building from '../../assets/hero/hero-building.png'

// Source files for the old narrative scene sequence (scene-01..05, plus the
// foreground occlusion passes timed to their cut points) still live in
// ../../assets/hero/ and HeroPhotography's rendering path still supports them —
// they were pulled from the ACTIVE choreography below because chaining five
// distinct photographed scenes plus four occlusion cutaways read as a slideshow
// (especially in reverse). The single establishing composite (background/bottom/
// building — three depth layers of one shot) now carries the Hero on its own
// until DeconstructionSequence (V2) takes over. See Hero.tsx for the handoff.

export interface HeroPhotoEnvelope {
  /** progress at which this image starts revealing (arrival begins) */
  enter: number
  /** progress at which the mask finishes opening / opacity settles */
  peakIn: number
  /** progress at which departure (opacity fade) begins (equal to exit means it never fades) */
  peakOut: number
  /** progress at which opacity reaches zero */
  exit: number
}

export interface HeroPhotoFocal {
  /** 0-100 — the architectural target this image pushes toward; drives transform-origin,
   * drift direction, and the mask-reveal centre (all three read the same point on purpose,
   * so a scene zooms toward, and reveals from, the same spot). */
  x: number
  y: number
}

export interface HeroPhotoConfig {
  id: string
  src: string
  alt: string
  envelope: HeroPhotoEnvelope
  focal: HeroPhotoFocal
  /** scale at `enter` */
  arrivalScale: number
  /** scale at `exit` — chained so it equals the *next* image's arrivalScale (nothing resets down) */
  departScale: number
  /** magnitude (%) of the focal-directed translate at `exit` */
  driftDistance: number
  /** starting circle radius (%) for the clip-path mask reveal; 140 effectively disables the
   * bloom reveal (used for the occlusion passes, which want broad coverage, not a shaped reveal) */
  maskRadiusFrom: number
  /** ceiling multiplied onto the computed opacity — 1 for the real scenes/depth layers,
   * lower (~0.3-0.45) for the occlusion passes so foreground.png (a complete photo, not a
   * transparent branch cutout) reads as a translucent veil over the cut rather than briefly
   * becoming a second fully-opaque, unrelated picture */
  opacityCap: number
  focalClass: string
  loading: 'eager' | 'lazy'
  fetchPriority: 'high' | 'auto'
}

/**
 * One continuous camera journey through Serene Heights — five renders standing
 * in for a single 3D camera move we don't have footage for. Two things make
 * that illusion work, neither of which is opacity:
 *
 * 1. SCALE NEVER RESETS. Each image's `arrivalScale` equals the previous
 *    image's `departScale`, and scale/drift are linear (not eased-flat) across
 *    each image's own [enter,exit] — so the perceived camera distance only
 *    ever closes in, and motion never goes static during a "hold".
 * 2. THE INCOMING IMAGE IS REVEALED THROUGH A GROWING CIRCLE centred on its
 *    own `focal` point (also its transform-origin and drift target), not a
 *    full-viewport fade — so there's never a moment where two full-screen
 *    photos are both ~50% visible. `background/bottom/building` reveal from
 *    view-centre (matching where the R3F mountain already sits) so the first
 *    photography reads as emerging from inside the abstract scene rather than
 *    replacing it. `foreground.png` is reused four more times (`occlusion-*`)
 *    as a brief near-camera pass timed to each scene boundary, partially
 *    obscuring the frame right as the swap happens (maskRadiusFrom:140 — no
 *    shaped reveal for these, they're a broad cover pass).
 *
 * Envelope shape (relative pacing) is unchanged from the approved round — only
 * how each image's scale/drift/mask is computed within its window has changed.
 * The absolute envelope numbers ARE compressed (uniformly x0.55) from that
 * original 0-1 pass so this whole photography story now resolves by progress
 * 0.55 instead of 1.0, handing the remaining runway to DeconstructionSequence
 * (see Hero.tsx / deconstructionSequence.ts) — same relative story beats, new budget.
 */
export const HERO_PHOTOS: HeroPhotoConfig[] = [
  {
    id: 'background',
    src: background,
    alt: '',
    // enter is negative so this layer is already fully ramped-in (opacity 1)
    // at progress 0 — a ramp is 0 at its own starting point by construction,
    // so enter:0 meant the Hero opened on green background before any scroll.
    envelope: { enter: -0.05, peakIn: 0.03, peakOut: 0.3, exit: 0.4 },
    focal: { x: 50, y: 45 },
    arrivalScale: 1.0,
    departScale: 1.16,
    driftDistance: 6,
    maskRadiusFrom: 16,
    opacityCap: 1,
    focalClass: 'background',
    loading: 'eager',
    fetchPriority: 'high',
  },
  {
    id: 'bottom',
    src: bottom,
    alt: '',
    envelope: { enter: -0.05, peakIn: 0.035, peakOut: 0.3, exit: 0.4 },
    focal: { x: 50, y: 45 },
    arrivalScale: 1.0,
    departScale: 1.22,
    driftDistance: 8,
    maskRadiusFrom: 16,
    opacityCap: 1,
    focalClass: 'bottom',
    loading: 'eager',
    fetchPriority: 'auto',
  },
  {
    id: 'building',
    src: building,
    alt: 'Serene Heights hotel building, the single establishing view the Hero opens on',
    envelope: { enter: -0.05, peakIn: 0.045, peakOut: 0.3, exit: 0.4 },
    focal: { x: 50, y: 45 },
    arrivalScale: 1.02,
    departScale: 1.55,
    driftDistance: 16,
    maskRadiusFrom: 14,
    opacityCap: 1,
    focalClass: 'building',
    loading: 'eager',
    fetchPriority: 'high',
  },
]

export interface HeroPhotoState {
  opacity: number
  scale: number
  driftXPct: number
  driftYPct: number
  maskRadiusPct: number
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function smoothstep(t: number): number {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Pure — safe to call every tick without allocation concerns beyond the returned object. */
export function computeImageState(
  progress: number,
  config: HeroPhotoConfig,
  amplitude: number,
): HeroPhotoState {
  const { enter, peakIn, peakOut, exit } = config.envelope

  // Opacity ramps in over the first ~40% of the arrival window (fast — the mask, not
  // opacity, is what tells the reveal story), holds at 1, then fades on departure.
  let opacity = 0
  if (progress > enter && progress < exit) {
    if (progress < peakIn) {
      const rampWindow = Math.max((peakIn - enter) * 0.4, 0.0001)
      opacity = smoothstep((progress - enter) / rampWindow)
    } else if (progress <= peakOut) {
      opacity = 1
    } else {
      opacity = 1 - smoothstep((progress - peakOut) / Math.max(exit - peakOut, 0.0001))
    }
  }
  opacity *= config.opacityCap

  // Scale and drift: one linear curve across the image's whole life — never flat, never
  // resets. Chaining arrivalScale/departScale across images is what keeps the perceived
  // camera distance closing in monotonically instead of resetting at each boundary.
  const spanT = clamp01((progress - enter) / Math.max(exit - enter, 0.0001))
  const rawScale = lerp(config.arrivalScale, config.departScale, spanT)
  const scale = 1 + (rawScale - 1) * amplitude

  const dirX = (config.focal.x - 50) / 50
  const dirY = (config.focal.y - 50) / 50
  const driftXPct = dirX * config.driftDistance * spanT * amplitude
  const driftYPct = dirY * config.driftDistance * spanT * amplitude

  // Mask: a circle centred on the focal point blooms from maskRadiusFrom to full coverage
  // across the arrival window, then stays fully open — a shaped reveal, not a global fade.
  let maskRadiusPct: number
  if (progress <= peakIn) {
    const t = clamp01((progress - enter) / Math.max(peakIn - enter, 0.0001))
    maskRadiusPct = lerp(config.maskRadiusFrom, 140, smoothstep(t))
  } else {
    maskRadiusPct = 140
  }

  return { opacity, scale, driftXPct, driftYPct, maskRadiusPct }
}
