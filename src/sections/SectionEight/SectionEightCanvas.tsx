import { useEffect, useRef } from 'react'
import { useCanvasVisibility } from '../../hooks/useCanvasVisibility'

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

export default function SectionEightCanvas({ activeSeason }: SectionEightCanvasProps) {
  const { containerRef, isVisible } = useCanvasVisibility({ rootMargin: '300px 0px' })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const isInitializedRef = useRef(false)
  const activeSeasonRef = useRef(activeSeason)
  activeSeasonRef.current = activeSeason

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
    if (!isVisible) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth)
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight)

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight
    }
    window.addEventListener('resize', handleResize)

    const particles = particlesRef.current

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height)
      const targetIdx = activeSeasonRef.current < 0 ? 0 : activeSeasonRef.current

      // Render living seasonal particles with high visibility & soft glow
      particles.forEach((p) => {
        p.x += p.vx + Math.sin(now * 0.0012 + p.y * 0.008) * 0.4
        p.y += p.vy
        p.rotation += p.rotSpeed

        // Wrap around boundaries smoothly
        if (p.y > height + 25) {
          p.y = -25
          p.x = p.isEdge
            ? Math.random() > 0.5
              ? Math.random() * (width * 0.28)
              : width * 0.72 + Math.random() * (width * 0.28)
            : Math.random() * width
        }

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = p.alpha

        if (targetIdx === 0) {
          // WINTER: Gentle falling snowflakes with icy cold white halo
          ctx.shadowBlur = 10
          ctx.shadowColor = 'rgba(220, 238, 245, 0.95)'
          ctx.fillStyle = 'rgba(240, 248, 255, 0.95)'
          ctx.beginPath()
          ctx.arc(0, 0, p.size * 0.65, 0, Math.PI * 2)
          ctx.fill()
        } else if (targetIdx === 1) {
          // SPRING: Floating alpine flower petals with soft pink glow
          ctx.shadowBlur = 8
          ctx.shadowColor = 'rgba(232, 168, 184, 0.75)'
          ctx.fillStyle = 'rgba(238, 184, 196, 0.90)'
          ctx.beginPath()
          ctx.ellipse(0, 0, p.size * 0.95, p.size * 0.5, 0, 0, Math.PI * 2)
          ctx.fill()
        } else if (targetIdx === 2) {
          // SUMMER: Volumetric golden dust shimmering in sunlight
          ctx.shadowBlur = 12
          ctx.shadowColor = 'rgba(243, 212, 152, 0.95)'
          ctx.fillStyle = 'rgba(253, 220, 140, 0.92)'
          ctx.beginPath()
          ctx.arc(0, 0, p.size * 0.75, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // AUTUMN: Falling rotating amber leaves with warm copper glow
          ctx.shadowBlur = 8
          ctx.shadowColor = 'rgba(216, 138, 66, 0.85)'
          ctx.fillStyle = 'rgba(228, 152, 76, 0.92)'
          ctx.beginPath()
          ctx.moveTo(0, -p.size)
          ctx.quadraticCurveTo(p.size * 0.85, 0, 0, p.size)
          ctx.quadraticCurveTo(-p.size * 0.85, 0, 0, -p.size)
          ctx.fill()
        }

        ctx.restore()
      })

      animId = requestAnimationFrame(render)
    }

    // Synchronous initial frame render
    render(performance.now())

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animId)
    }
  }, [isVisible])

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
