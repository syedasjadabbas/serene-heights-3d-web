import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

export function registerScrollTrigger(): typeof ScrollTrigger {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger)
    ScrollTrigger.defaults({
      markers: false,
    })
    registered = true
  }
  return ScrollTrigger
}

export { ScrollTrigger }
