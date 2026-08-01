import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import Button from '../../components/ui/Button'
import styles from './SectionTen.module.css'

export default function SectionTen() {
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <footer ref={sectionRef} id="contact" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.topScene}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowNum}>10</span>
            <span className={styles.eyebrowDivider}>/</span>
            <span>YOUR DESTINATION</span>
          </p>

          <h2 ref={headlineRef} className={styles.headline}>
            Your sanctuary awaits.
          </h2>

          <p className={styles.subcopy}>
            Schedule a private consultation or request detailed floor plan documentation for Serene Heights, Nathia Gali.
          </p>

          <div className={styles.ctaGroup}>
            <Button href="#enquire" variant="ghost">
              SCHEDULE PRIVATE CONSULTATION
            </Button>
            <Button href="#download-brochure" variant="ghost">
              DOWNLOAD BROCHURE
            </Button>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.brandInfo}>
            <span className={styles.brandTitle}>SERENE HEIGHTS</span>
            <span className={styles.brandSub}>NATHIA GALI · PAKISTAN</span>
          </div>

          <div className={styles.metaLinks}>
            <a href="#privacy" className={styles.link}>PRIVACY POLICY</a>
            <a href="#terms" className={styles.link}>TERMS OF OWNERSHIP</a>
            <span className={styles.copyright}>© 2026 SERENE HEIGHTS. DM CONSORTIUM.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
