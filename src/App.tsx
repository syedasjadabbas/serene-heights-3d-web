import { useEffect } from 'react'
import Navigation from './components/navigation/Navigation'
// import MasterVisualStage from './components/stage/MasterVisualStage' // backup
// import Hero from './sections/Hero/Hero' // backup
import HeroV2 from './sections/Hero/HeroV2'
import Deconstruction from './sections/Deconstruction/Deconstruction'
import SectionTwo from './sections/SectionTwo/SectionTwo'
import SectionThree from './sections/SectionThree/SectionThree'
import SectionFour from './sections/SectionFour/SectionFour'
import SectionFive from './sections/SectionFive/SectionFive'
import SectionSix from './sections/SectionSix/SectionSix'
import SectionSeven from './sections/SectionSeven/SectionSeven'
import SectionEight from './sections/SectionEight/SectionEight'
import SectionNine from './sections/SectionNine/SectionNine'
import SectionTen from './sections/SectionTen/SectionTen'
import { initLenis } from './motion/lenis'
import { ScrollTrigger } from './motion/scrollTrigger'

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }
      window.scrollTo(0, 0)
    }

    if (new URLSearchParams(window.location.search).has('noLenis')) return
    const { lenis, destroy } = initLenis()

    const timer = setTimeout(() => {
      window.scrollTo(0, 0)
    }, 50)

    // ── Resize + zoom coordination ──────────────────────────────────
    // Browser zoom fires a window resize event (window.innerWidth/Height
    // change in CSS pixels). We must stop Lenis, let ScrollTrigger fully
    // recompute all pin spacers (invalidateOnRefresh handles the math),
    // then allow Lenis to resume. Without this, pinSpacing from Sections
    // 6/7/8 can be stale after zoom, causing layout shifts and wrong
    // scroll distances at 80/90/110% browser zoom.
    let resizeTimer: ReturnType<typeof setTimeout>

    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        // Pause Lenis so it doesn't fight ScrollTrigger during recalculation
        lenis.stop()
        // Force a full ScrollTrigger refresh — recalculates all trigger
        // start/end positions, pin spacer heights, and scroll distances
        ScrollTrigger.refresh(true)
        // Resume Lenis after a frame to let the DOM settle
        requestAnimationFrame(() => {
          lenis.start()
        })
      }, 150)
    }

    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      clearTimeout(timer)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', handleResize)
      destroy()
    }
  }, [])


  return (
    <>
      {/* <MasterVisualStage /> */}
      <Navigation />
      <main>
        <HeroV2 />
        <Deconstruction />
        <SectionTwo />
        <SectionThree />
        <SectionFour />
        <SectionFive />
        <SectionSix />
        <SectionSeven />
        <SectionEight />
        <SectionNine />
        <SectionTen />
      </main>
    </>
  )
}

export default App
