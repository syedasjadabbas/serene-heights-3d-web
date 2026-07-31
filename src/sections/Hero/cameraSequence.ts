// Frame sequence extracted from reference/serene-hero-camera.mp4 (8s, 24fps,
// 192 native frames) at 12fps -> 96 frames, native 1280x720, no upscale.
// See public/media/serene-heights/hero/exploded-sequence/.
export const FRAME_COUNT = 96
export const FRAME_WIDTH = 1280
export const FRAME_HEIGHT = 720

const PRIMARY_FRAME_BASE_PATH = '/media/serene-heights/hero/exploded-sequence'
const FALLBACK_FRAME_BASE_PATH = '/media/serene-heights/hero/camera-sequence'

function frameSrc(index: number, useFallback = false): string {
  const clamped = Math.min(FRAME_COUNT - 1, Math.max(0, index))
  const n = String(clamped + 1).padStart(4, '0')
  const basePath = useFallback ? FALLBACK_FRAME_BASE_PATH : PRIMARY_FRAME_BASE_PATH
  return `${basePath}/frame-${n}.webp`
}

export interface SequenceLoader {
  /** Returns the loaded image for this frame index, if available yet. */
  getFrame: (index: number) => HTMLImageElement | undefined
  /** Kick off (or no-op if already loaded/inflight) loading a specific frame. */
  request: (index: number) => void
  /** Start filling in every remaining frame during browser idle time. */
  startBackgroundFill: () => void
  destroy: () => void
}

type IdleWindow = Window & {
  requestIdleCallback?: (cb: (deadline: IdleDeadline) => void) => number
  cancelIdleCallback?: (handle: number) => void
}

/**
 * Progressive loader for the frame sequence: frame 0 loads eagerly, an early
 * window loads right after, everything else fills in during idle time.
 * `request()` is also called from the scroll handler so scrubbing into an
 * unloaded region jumps that frame to the front of the queue.
 */
export function createSequenceLoader(onFrameReady: () => void): SequenceLoader {
  const frames: (HTMLImageElement | undefined)[] = new Array(FRAME_COUNT)
  const inflight = new Set<number>()
  let destroyed = false
  let idleHandle: number | null = null

  const win = window as IdleWindow

  function requestIdle(cb: (deadline?: IdleDeadline) => void): number {
    if (typeof win.requestIdleCallback === 'function') {
      return win.requestIdleCallback(cb)
    }
    return window.setTimeout(() => cb(undefined), 60) as unknown as number
  }

  function cancelIdle(handle: number) {
    if (typeof win.cancelIdleCallback === 'function') {
      win.cancelIdleCallback(handle)
    } else {
      window.clearTimeout(handle)
    }
  }

  function request(index: number, useFallback = false) {
    if (destroyed || index < 0 || index >= FRAME_COUNT) return
    if (frames[index] || inflight.has(index)) return
    inflight.add(index)
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      inflight.delete(index)
      if (destroyed) return
      frames[index] = img
      onFrameReady()
    }
    img.onerror = () => {
      if (!useFallback) {
        const fallbackImg = new Image()
        fallbackImg.decoding = 'async'
        fallbackImg.onload = () => {
          inflight.delete(index)
          if (destroyed) return
          frames[index] = fallbackImg
          onFrameReady()
        }
        fallbackImg.onerror = () => {
          inflight.delete(index)
        }
        fallbackImg.src = frameSrc(index, true)
      } else {
        inflight.delete(index)
      }
    }
    img.src = frameSrc(index, useFallback)
  }

  function startBackgroundFill() {
    let cursor = 0
    const step = (deadline?: IdleDeadline) => {
      if (destroyed) return
      const hasTime = () => !deadline || deadline.timeRemaining() > 0 || deadline.didTimeout
      while (cursor < FRAME_COUNT && (frames[cursor] || inflight.has(cursor))) cursor += 1
      while (cursor < FRAME_COUNT && hasTime()) {
        request(cursor)
        cursor += 1
        while (cursor < FRAME_COUNT && (frames[cursor] || inflight.has(cursor))) cursor += 1
      }
      if (cursor < FRAME_COUNT) {
        idleHandle = requestIdle(step)
      }
    }
    idleHandle = requestIdle(step)
  }

  return {
    getFrame: (index) => frames[index],
    request,
    startBackgroundFill,
    destroy: () => {
      destroyed = true
      if (idleHandle !== null) cancelIdle(idleHandle)
    },
  }
}

/** Nearest loaded frame to `target`, checking outward on both sides. Purely
 * an asset-availability fallback while frames are still streaming in — once
 * loaded, the same progress always resolves to the same exact frame. */
export function nearestLoadedFrame(loader: SequenceLoader, target: number): number {
  if (loader.getFrame(target)) return target
  for (let d = 1; d < FRAME_COUNT; d += 1) {
    const lower = target - d
    const upper = target + d
    if (lower >= 0 && loader.getFrame(lower)) return lower
    if (upper < FRAME_COUNT && loader.getFrame(upper)) return upper
  }
  return -1
}
