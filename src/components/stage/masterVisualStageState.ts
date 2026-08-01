export interface TimelineSegment {
  id: string
  /** Start progress of this segment in full document scroll (0.0 to 1.0) */
  startProgress: number
  /** End progress of this segment in full document scroll (0.0 to 1.0) */
  endProgress: number
  /** Start frame index (0 to 95, corresponding to frame-0001 to frame-0096) */
  startFrame: number
  /** End frame index (0 to 95, corresponding to frame-0001 to frame-0096) */
  endFrame: number
}

/**
 * Clean, configurable timeline mapping for the 96-frame homepage sequence.
 * Top of homepage (Hero top) = frame 0 (frame-0001.webp)
 * Hero exit (end of Hero runway) = frame 38 (frame-0039.webp) -- WELL BELOW 96
 * Section 2 entry / header (HOLD) = frame 38
 * Page bottom / Footer = frame 95 (frame-0096.webp)
 */
export const HOMEPAGE_TIMELINE_MAP: TimelineSegment[] = [
  {
    id: 'hero-intro',
    startProgress: 0.00,
    endProgress: 0.25,
    startFrame: 0,
    endFrame: 12,
  },
  {
    id: 'hero-chapters-early',
    startProgress: 0.25,
    endProgress: 0.50,
    startFrame: 12,
    endFrame: 25,
  },
  {
    id: 'hero-chapters-late',
    startProgress: 0.50,
    endProgress: 0.72,
    startFrame: 25,
    endFrame: 35,
  },
  {
    id: 'hero-exit-wordmark',
    startProgress: 0.72,
    endProgress: 0.80,
    startFrame: 35,
    endFrame: 38,
  },
  {
    id: 'section-2-hold',
    startProgress: 0.80,
    endProgress: 0.86,
    startFrame: 38,
    endFrame: 38, // Hold frame 38 while Section 2 header enters
  },
  {
    id: 'section-2-scrub',
    startProgress: 0.86,
    endProgress: 1.00,
    startFrame: 38,
    endFrame: 95, // Progresses to frame 96 (index 95) at page bottom
  },
]

export function mapProgressToFrame(progress: number): number {
  const p = Math.min(1, Math.max(0, progress))
  const segments = HOMEPAGE_TIMELINE_MAP

  if (segments.length === 0) return 0
  if (p <= segments[0].startProgress) return segments[0].startFrame

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (p >= seg.startProgress && p <= seg.endProgress) {
      if (seg.endProgress === seg.startProgress) return seg.startFrame
      const t = (p - seg.startProgress) / (seg.endProgress - seg.startProgress)
      return Math.round(seg.startFrame + (seg.endFrame - seg.startFrame) * t)
    }
  }

  return segments[segments.length - 1].endFrame
}

