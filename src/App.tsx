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
  // Web fonts swap in after first layout and change text heights, which
  // shifts every pin below them — re-measure once they've all loaded.
  useEffect(() => {
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh()
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    // (scroll restoration + scroll-to-top already run in main.tsx)
    if (new URLSearchParams(window.location.search).has('noLenis')) return
    const { destroy } = initLenis()

    const timer = setTimeout(() => {
      window.scrollTo(0, 0)
    }, 50)

    return () => {
      clearTimeout(timer)
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
