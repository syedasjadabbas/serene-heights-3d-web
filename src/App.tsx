import { useEffect } from 'react'
import Navigation from './components/navigation/Navigation'
import Hero from './sections/Hero/Hero'
import SectionTwo from './sections/SectionTwo/SectionTwo'
import { initLenis } from './motion/lenis'

function App() {
  useEffect(() => {
    // TEMP DEBUG: ?noLenis=1 skips Lenis entirely so native browser scroll
    // can be A/B tested against Lenis-smoothed scroll for the Hero zoom.
    // Remove this branch once Lenis is cleared or fixed.
    if (new URLSearchParams(window.location.search).has('noLenis')) return
    const { destroy } = initLenis()
    return destroy
  }, [])

  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <SectionTwo />
      </main>
    </>
  )
}

export default App
