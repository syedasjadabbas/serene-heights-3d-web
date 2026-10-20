import Lenis from 'lenis'
import { gsap } from 'gsap'
import { registerScrollTrigger, ScrollTrigger } from './scrollTrigger'
import { prefersReducedMotion } from './reducedMotion'

// The live Lenis instance (null when disabled via ?noLenis or before init).
// Every in-page scroll goes through scrollToTarget() so there is only ever
// one smooth-scroll system moving the page.
let activeLenis: Lenis | null = null

export function scrollToTarget(target: HTMLElement | number, options: { offset?: number; duration?: number } = {}) {
  const { offset = 0, duration = 1.2 } = options
  if (activeLenis) {
    activeLenis.scrollTo(target, { offset, duration, immediate: prefersReducedMotion() })
    return
  }
  const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

export function scrollToId(id: string, options?: { offset?: number; duration?: number }) {
  const el = document.getElementById(id)
  if (el) scrollToTarget(el, options)
}

export function stopScroll() {
  activeLenis?.stop()
}

export function startScroll() {
  activeLenis?.start()
}

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
  gsap.ticker.lagSmoothing(500, 33)

  const handleAnchorClick = (e: MouseEvent) => {
    // Components that handle their own anchor clicks call preventDefault()
    // and scroll via scrollToTarget() — don't start a second scroll here.
    if (e.defaultPrevented) return
    const target = e.target as HTMLElement | null
    const anchor = target?.closest('a[href^="#"]') as HTMLAnchorElement | null
    if (!anchor) return
    const href = anchor.getAttribute('href')
    if (href && href.length > 1) {
      const el = document.querySelector(href)
      if (el) {
        e.preventDefault()
        scrollToTarget(el as HTMLElement)
      }
    }
  }
  document.addEventListener('click', handleAnchorClick)
  activeLenis = lenis

  if (import.meta.env.DEV) {
    ;(window as unknown as Record<string, unknown>).__debugLenis = lenis
    ;(window as unknown as Record<string, unknown>).__debugGsap = gsap
    ;(window as unknown as Record<string, unknown>).__debugScrollTrigger = ScrollTrigger
  }

  const destroy = () => {
    document.removeEventListener('click', handleAnchorClick)
    gsap.ticker.remove(onTick)
    if (activeLenis === lenis) activeLenis = null
    lenis.destroy()
  }

  return { lenis, destroy }
}
