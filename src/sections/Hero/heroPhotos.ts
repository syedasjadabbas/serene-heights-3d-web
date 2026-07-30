import background from '../../assets/hero/background.png'
import bottom from '../../assets/hero/bottom.png'
import building from '../../assets/hero/building.png'
import sceneEstablish from '../../assets/hero/scene-01-establish.png'
import sceneApproach from '../../assets/hero/scene-02-approach.png'
import sceneArrival from '../../assets/hero/scene-03-arrival.png'
import sceneAscend from '../../assets/hero/scene-04-ascend.png'
import sceneRooftop from '../../assets/hero/scene-05-rooftop.png'
import foreground from '../../assets/hero/foreground.png'

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
    envelope: { enter: 0.011, peakIn: 0.044, peakOut: 0.132, exit: 0.187 },
    focal: { x: 50, y: 45 },
    arrivalScale: 1.0,
    departScale: 1.1,
    driftDistance: 4,
    maskRadiusFrom: 16,
    opacityCap: 1,
    focalClass: 'background',
    loading: 'eager',
    fetchPriority: 'auto',
  },
  {
    id: 'bottom',
    src: bottom,
    alt: '',
    envelope: { enter: 0.017, peakIn: 0.05, peakOut: 0.121, exit: 0.176 },
    focal: { x: 50, y: 45 },
    arrivalScale: 1.0,
    departScale: 1.15,
    driftDistance: 6,
    maskRadiusFrom: 16,
    opacityCap: 1,
    focalClass: 'bottom',
    loading: 'eager',
    fetchPriority: 'auto',
  },
  {
    id: 'building',
    src: building,
    alt: '',
    envelope: { enter: 0.022, peakIn: 0.061, peakOut: 0.132, exit: 0.187 },
    focal: { x: 50, y: 45 },
    arrivalScale: 1.02,
    departScale: 1.4,
    driftDistance: 12,
    maskRadiusFrom: 14,
    opacityCap: 1,
    focalClass: 'building',
    loading: 'eager',
    fetchPriority: 'auto',
  },
  {
    id: 'scene-01-establish',
    src: sceneEstablish,
    alt: 'Serene Heights seen from the forest at sunrise, mountains behind',
    envelope: { enter: 0.044, peakIn: 0.066, peakOut: 0.154, exit: 0.182 },
    focal: { x: 70, y: 48 },
    arrivalScale: 1.0,
    departScale: 1.24,
    driftDistance: 12,
    maskRadiusFrom: 12,
    opacityCap: 1,
    focalClass: 'scene01',
    loading: 'eager',
    fetchPriority: 'high',
  },
  {
    id: 'scene-02-approach',
    src: sceneApproach,
    alt: 'Approaching Serene Heights through the pines',
    envelope: { enter: 0.165, peakIn: 0.187, peakOut: 0.275, exit: 0.303 },
    focal: { x: 68, y: 58 },
    arrivalScale: 1.24,
    departScale: 1.48,
    driftDistance: 13,
    maskRadiusFrom: 14,
    opacityCap: 1,
    focalClass: 'scene02',
    loading: 'eager',
    fetchPriority: 'auto',
  },
  {
    id: 'scene-03-arrival',
    src: sceneArrival,
    alt: 'Arriving at the Serene Heights entrance drive at dusk',
    envelope: { enter: 0.286, peakIn: 0.308, peakOut: 0.396, exit: 0.424 },
    focal: { x: 58, y: 32 },
    arrivalScale: 1.48,
    departScale: 1.72,
    driftDistance: 13,
    maskRadiusFrom: 12,
    opacityCap: 1,
    focalClass: 'scene03',
    loading: 'lazy',
    fetchPriority: 'auto',
  },
  {
    id: 'scene-04-ascend',
    src: sceneAscend,
    alt: 'Looking up along the Serene Heights facade and balconies',
    envelope: { enter: 0.407, peakIn: 0.429, peakOut: 0.517, exit: 0.545 },
    focal: { x: 55, y: 12 },
    arrivalScale: 1.72,
    departScale: 2.05,
    driftDistance: 16,
    maskRadiusFrom: 14,
    opacityCap: 1,
    focalClass: 'scene04',
    loading: 'lazy',
    fetchPriority: 'auto',
  },
  {
    id: 'scene-05-rooftop',
    src: sceneRooftop,
    alt: 'Serene Heights rooftop terrace overlooking the mountains at sunset',
    envelope: { enter: 0.523, peakIn: 0.542, peakOut: 0.55, exit: 0.55 },
    focal: { x: 50, y: 35 },
    arrivalScale: 2.05,
    departScale: 2.3,
    driftDistance: 8,
    maskRadiusFrom: 16,
    opacityCap: 1,
    focalClass: 'scene05',
    loading: 'lazy',
    fetchPriority: 'auto',
  },
  {
    id: 'foreground',
    src: foreground,
    alt: '',
    envelope: { enter: 0.006, peakIn: 0.028, peakOut: 0.044, exit: 0.099 },
    focal: { x: 50, y: 45 },
    arrivalScale: 1.15,
    departScale: 1.7,
    driftDistance: 18,
    maskRadiusFrom: 140,
    opacityCap: 0.55,
    focalClass: 'foreground',
    loading: 'eager',
    fetchPriority: 'auto',
  },
  {
    // foreground.png is a complete composed photo (branches + the same hotel + valley
    // baked into one frame), not a clean branch-only alpha cutout — a dramatic scale
    // visibly warps its own recognizable architecture into the frame. Kept deliberately
    // subtle (near-1x scale) so it reads as a soft branch/haze pass at the cut rather
    // than a glitch; it's a supporting touch, not the primary continuity mechanism
    // (that's the chained scale + circular reveal on the scenes themselves).
    id: 'occlusion-1',
    src: foreground,
    alt: '',
    envelope: { enter: 0.149, peakIn: 0.165, peakOut: 0.182, exit: 0.204 },
    focal: { x: 22, y: 18 },
    arrivalScale: 1.0,
    departScale: 1.05,
    driftDistance: 3,
    maskRadiusFrom: 140,
    opacityCap: 0.7,
    focalClass: 'foreground',
    loading: 'lazy',
    fetchPriority: 'auto',
  },
  {
    id: 'occlusion-2',
    src: foreground,
    alt: '',
    envelope: { enter: 0.27, peakIn: 0.286, peakOut: 0.303, exit: 0.325 },
    focal: { x: 80, y: 18 },
    arrivalScale: 1.0,
    departScale: 1.05,
    driftDistance: 3,
    maskRadiusFrom: 140,
    opacityCap: 0.7,
    focalClass: 'foreground',
    loading: 'lazy',
    fetchPriority: 'auto',
  },
  {
    id: 'occlusion-3',
    src: foreground,
    alt: '',
    envelope: { enter: 0.391, peakIn: 0.407, peakOut: 0.424, exit: 0.446 },
    focal: { x: 20, y: 82 },
    arrivalScale: 1.0,
    departScale: 1.05,
    driftDistance: 3,
    maskRadiusFrom: 140,
    opacityCap: 0.7,
    focalClass: 'foreground',
    loading: 'lazy',
    fetchPriority: 'auto',
  },
  {
    id: 'occlusion-4',
    src: foreground,
    alt: '',
    envelope: { enter: 0.506, peakIn: 0.523, peakOut: 0.539, exit: 0.55 },
    focal: { x: 78, y: 80 },
    arrivalScale: 1.0,
    departScale: 1.05,
    driftDistance: 3,
    maskRadiusFrom: 140,
    opacityCap: 0.7,
    focalClass: 'foreground',
    loading: 'lazy',
    fetchPriority: 'auto',
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
