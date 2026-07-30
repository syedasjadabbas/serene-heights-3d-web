import { useEffect } from 'react'
import Navigation from './components/navigation/Navigation'
import Hero from './sections/Hero/Hero'
import { initLenis } from './motion/lenis'

function App() {
  useEffect(() => {
    const { destroy } = initLenis()
    return destroy
  }, [])

  return (
    <>
      <Navigation />
      <main>
        <Hero />
        {/* Neutral continuation space to exercise the Hero's pinned exit animation. Section 03 is not built yet. */}
        <div className="next-spacer" aria-hidden="true" />
      </main>
    </>
  )
}

export default App
