import Lenis from 'lenis'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from './scrollTrigger'
import { prefersReducedMotion } from './reducedMotion'

export function initLenis(): { lenis: Lenis; destroy: () => void } {
  registerScrollTrigger()

  const reduced = prefersReducedMotion()

  const lenis = new Lenis({
    duration: reduced ? 0.1 : 1.15,
    lerp: reduced ? 1 : 0.1,
    smoothWheel: !reduced,
    wheelMultiplier: 1,
    touchMultiplier: 1,
  })

  // Prevent recursive / re-entrant ScrollTrigger updates during layout refresh
  let isUpdating = false
  lenis.on('scroll', () => {
    const isRefreshing = (ScrollTrigger as unknown as { isRefreshing?: boolean }).isRefreshing
    if (isUpdating || isRefreshing) return
    isUpdating = true
    ScrollTrigger.update()
    isUpdating = false
  })

  const onTick = (time: number) => {
    lenis.raf(time * 1000)
  }

  gsap.ticker.add(onTick)
  gsap.ticker.lagSmoothing(0)

  const handleAnchorClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null
    const anchor = target?.closest('a[href^="#"]') as HTMLAnchorElement | null
    if (!anchor) return
    const href = anchor.getAttribute('href')
    if (href && href.length > 1) {
      const el = document.querySelector(href)
      if (el) {
        e.preventDefault()
        lenis.scrollTo(el as HTMLElement, { duration: 1.2 })
      }
    }
  }
  document.addEventListener('click', handleAnchorClick)

  if (import.meta.env.DEV) {
    ;(window as unknown as Record<string, unknown>).__debugLenis = lenis
    ;(window as unknown as Record<string, unknown>).__debugGsap = gsap
    ;(window as unknown as Record<string, unknown>).__debugScrollTrigger = ScrollTrigger
  }

  const destroy = () => {
    document.removeEventListener('click', handleAnchorClick)
    gsap.ticker.remove(onTick)
    lenis.destroy()
  }

  return { lenis, destroy }
}
