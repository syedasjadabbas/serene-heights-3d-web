import { useEffect } from 'react'
import Navigation from './components/navigation/Navigation'
import MasterVisualStage from './components/stage/MasterVisualStage'
import Hero from './sections/Hero/Hero'
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

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual'
      }
      window.scrollTo(0, 0)
    }

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
      <MasterVisualStage />
      <Navigation />
      <main>
        <Hero />
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
