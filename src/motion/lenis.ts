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

  lenis.on('scroll', ScrollTrigger.update)

  const onTick = (time: number) => {
    lenis.raf(time * 1000)
  }

  gsap.ticker.add(onTick)
  gsap.ticker.lagSmoothing(0)

  const destroy = () => {
    gsap.ticker.remove(onTick)
    lenis.destroy()
  }

  return { lenis, destroy }
}
