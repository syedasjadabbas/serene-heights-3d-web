import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import styles from './ResortLoader.module.css'

interface ResortLoaderProps {
  /** The <Canvas> has been created (its first frame is ready to show). */
  canvasReady: boolean
}

export default function ResortLoader({ canvasReady }: ResortLoaderProps) {
  const { active, progress } = useProgress()
  const [shouldRender, setShouldRender] = useState(true)
  const [fadingOut, setFadingOut] = useState(false)

  useEffect(() => {
    // Done once the canvas exists and no asset is mid-download. Checking
    // progress >= 100 alone never fires when the scene has nothing to fetch.
    if (canvasReady && !active) {
      setFadingOut(true)
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 850)
      return () => clearTimeout(timer)
    } else {
      setShouldRender(true)
      setFadingOut(false)
    }
  }, [active, canvasReady])

  if (!shouldRender) return null

  const displayPercent = Math.min(100, Math.round(progress))

  return (
    <div
      className={`${styles.loaderOverlay} ${fadingOut ? styles.loaderHidden : ''}`}
      aria-hidden="true"
    >
      <div className={styles.loaderContent}>
        <span className={styles.loaderBadge}>INITIALIZING 3D ENVIRONMENT</span>
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} style={{ width: `${displayPercent}%` }} />
        </div>
        <span className={styles.loaderText}>{displayPercent}% LOADED</span>
      </div>
    </div>
  )
}
