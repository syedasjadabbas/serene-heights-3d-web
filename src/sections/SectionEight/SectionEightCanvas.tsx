import { useEffect, useRef } from 'react'
import { useCanvasVisibility } from '../../hooks/useCanvasVisibility'
import { prefersReducedMotion } from '../../motion/reducedMotion'

interface SectionEightCanvasProps {
  activeSeason: number // 0: Winter, 1: Spring, 2: Summer, 3: Autumn
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  rotSpeed: number
  alpha: number
  isEdge: boolean
}

// Glow sprites: each season's particle shape is drawn ONCE with shadowBlur to
// an offscreen canvas, then stamped with drawImage — no per-particle blur.
const SPRITE_REF_SIZE = 8 // particle `size` (CSS px) the sprite is drawn at
const SPRITE_PAD = 14 // room for the blur halo
const SPRITE_SCALE = 2 // sprite resolution (matches the dpr cap)

const SEASON_STYLES = [
  { shadowBlur: 8, shadowColor: 'rgba(220, 238, 245, 0.8)', fill: 'rgba(240, 248, 255, 0.95)' },
  { shadowBlur: 6, shadowColor: 'rgba(232, 168, 184, 0.7)', fill: 'rgba(238, 184, 196, 0.90)' },
  { shadowBlur: 8, shadowColor: 'rgba(243, 212, 152, 0.8)', fill: 'rgba(253, 220, 140, 0.92)' },
  { shadowBlur: 6, shadowColor: 'rgba(216, 138, 66, 0.7)', fill: 'rgba(228, 152, 76, 0.92)' },
]

interface Sprite {
  canvas: HTMLCanvasElement
  cssSize: number
}

const spriteCache = new Map<number, Sprite>()

function getSprite(seasonIdx: number): Sprite {
  const cached = spriteCache.get(seasonIdx)
  if (cached) return cached

  const cssSize = (SPRITE_REF_SIZE + SPRITE_PAD) * 2
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = cssSize * SPRITE_SCALE
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const style = SEASON_STYLES[seasonIdx] ?? SEASON_STYLES[0]
    const s = SPRITE_REF_SIZE
    ctx.scale(SPRITE_SCALE, SPRITE_SCALE)
    ctx.translate(cssSize / 2, cssSize / 2)
    ctx.shadowBlur = style.shadowBlur * SPRITE_SCALE
    ctx.shadowColor = style.shadowColor
    ctx.fillStyle = style.fill
    ctx.beginPath()
    if (seasonIdx === 0) {
      ctx.arc(0, 0, s * 0.65, 0, Math.PI * 2)
    } else if (seasonIdx === 1) {
      ctx.ellipse(0, 0, s * 0.95, s * 0.5, 0, 0, Math.PI * 2)
    } else if (seasonIdx === 2) {
      ctx.arc(0, 0, s * 0.75, 0, Math.PI * 2)
    } else {
      ctx.moveTo(0, -s)
      ctx.quadraticCurveTo(s * 0.85, 0, 0, s)
      ctx.quadraticCurveTo(-s * 0.85, 0, 0, -s)
    }
    ctx.fill()
  }

  const sprite = { canvas, cssSize }
  spriteCache.set(seasonIdx, sprite)
  return sprite
}

export default function SectionEightCanvas({ activeSeason }: SectionEightCanvasProps) {
  const { containerRef, isVisible } = useCanvasVisibility({ rootMargin: '300px 0px' })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const isInitializedRef = useRef(false)
  const activeSeasonRef = useRef(activeSeason)
  activeSeasonRef.current = activeSeason
  const reducedMotion = prefersReducedMotion()

  // Initialize particle pool ONCE on component mount
  useEffect(() => {
    if (isInitializedRef.current) return

    const width = window.innerWidth
    const height = window.innerHeight
    const numParticles = 75
    const particles: Particle[] = []

    for (let i = 0; i < numParticles; i++) {
      const isEdge = i < Math.floor(numParticles * 0.65)
      particles.push({
        x: isEdge
          ? Math.random() > 0.5
            ? Math.random() * (width * 0.28)
            : width * 0.72 + Math.random() * (width * 0.28)
          : Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 0.4 + Math.random() * 1.0,
        size: 4 + Math.random() * 7,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.035,
        alpha: 0.70 + Math.random() * 0.28,
        isEdge,
      })
    }

    // Warm-up particle simulation by 150 frames ONCE so particles exist in mid-air
    for (let step = 0; step < 150; step++) {
      particles.forEach((p) => {
        p.x += p.vx + Math.sin(step * 0.0012 + p.y * 0.008) * 0.4
        p.y += p.vy
        p.rotation += p.rotSpeed
        if (p.y > height + 25) {
          p.y = -25
        }
      })
    }

    particlesRef.current = particles
    isInitializedRef.current = true
  }, [])

  // Visibility-gated render loop: Pauses offscreen, resumes instantaneously on re-entry with zero object recreation
  useEffect(() => {
    if (!isVisible || reducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    let width = 0
    let height = 0
    let dpr = 1

    // Backing store at devicePixelRatio (capped at 2); drawing stays in CSS px
    const resize = () => {
      const parent = canvas.parentElement
      width = parent?.clientWidth || window.innerWidth
      height = parent?.clientHeight || window.innerHeight
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement)
    window.addEventListener('resize', resize)

    const particles = particlesRef.current
    let last: number | null = null

    const render = (now: number) => {
      // Time-based motion: the original per-frame steps were tuned at 60 Hz,
      // so scale them by elapsed 60 Hz frames (clamped after tab switches/stalls)
      const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.05)
      last = now
      const f = dt * 60

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalAlpha = 1
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const targetIdx = activeSeasonRef.current < 0 ? 0 : activeSeasonRef.current
      const sprite = getSprite(targetIdx)
      const half = sprite.cssSize / 2

      // Render living seasonal particles with high visibility & soft glow
      particles.forEach((p) => {
        p.x += (p.vx + Math.sin(now * 0.0012 + p.y * 0.008) * 0.4) * f
        p.y += p.vy * f
        p.rotation += p.rotSpeed * f

        // Wrap around boundaries smoothly
        if (p.y > height + 25) {
          p.y = -25
          p.x = p.isEdge
            ? Math.random() > 0.5
              ? Math.random() * (width * 0.28)
              : width * 0.72 + Math.random() * (width * 0.28)
            : Math.random() * width
        }

        // Rotate + scale the pre-rendered glow sprite in one transform
        const k = (p.size / SPRITE_REF_SIZE) * dpr
        const cos = Math.cos(p.rotation) * k
        const sin = Math.sin(p.rotation) * k
        ctx.setTransform(cos, sin, -sin, cos, p.x * dpr, p.y * dpr)
        ctx.globalAlpha = p.alpha
        ctx.drawImage(sprite.canvas, -half, -half, sprite.cssSize, sprite.cssSize)
      })

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [isVisible, reducedMotion])

  // Reduced motion: no particles at all (the scenes carry the season)
  if (reducedMotion) return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
