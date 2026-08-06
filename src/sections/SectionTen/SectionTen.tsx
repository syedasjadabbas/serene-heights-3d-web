/**
 * Section: Footer
 * Assets: src/assets/footer/
 */
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import Button from '../../components/ui/Button'
import styles from './SectionTen.module.css'

export default function SectionTen() {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      // Slow background parallax
      if (bgRef.current) {
        gsap.fromTo(
          bgRef.current,
          { y: -40, scale: 1.08 },
          {
            y: 40,
            scale: 1.0,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: true,
            },
          },
        )
      }

      // Headline and CTA reveal
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      }

      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <footer ref={sectionRef} id="contact" className={styles.section}>
      {/* Mountain Background Frame */}
      <div className={styles.bgWrap}>
        <div
          ref={bgRef}
          className={styles.bgImage}
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop)`,
          }}
        />
        <div className={styles.bgOverlay} aria-hidden="true" />
      </div>

      {/* Full Viewport Content Frame */}
      <div className={`container ${styles.inner}`}>
        {/* Main Cinematic Scene */}
        <div className={styles.heroScene}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowNum}>10</span>
            <span className={styles.eyebrowDivider}>/</span>
            <span>THE FINAL CHAPTER</span>
          </p>

          <h2 ref={headlineRef} className={styles.headline}>
            Your sanctuary above the clouds awaits.
          </h2>

          <p className={styles.subcopy}>
            Conceived at 7,906 ft in Nathia Gali. Master-crafted by DM Consortium for those who seek timeless alpine living.
          </p>

          <div ref={ctaRef} className={styles.ctaGroup}>
            <Button href="#enquire" variant="ghost">
              SCHEDULE PRIVATE SHOWCASE
            </Button>
            <Button href="#download-brochure" variant="ghost">
              REQUEST ARCHITECTURAL PLANS
            </Button>
          </div>
        </div>

        {/* Minimal Footer Navigation Bar */}
        <div className={styles.minimalFooter}>
          <div className={styles.brandMeta}>
            <span className={styles.brandName}>SERENE HEIGHTS</span>
            <span className={styles.brandLocation}>NATHIA GALI · PAKISTAN</span>
          </div>

          <div className={styles.navLinks}>
            <a href="#hero" className={styles.navLink}>OVERVIEW</a>
            <a href="#lifestyle" className={styles.navLink}>LIFESTYLE</a>
            <a href="#amenities" className={styles.navLink}>AMENITIES</a>
            <a href="#investment" className={styles.navLink}>INVESTMENT</a>
            <a href="#story" className={styles.navLink}>STORY</a>
            <a href="#gallery" className={styles.navLink}>EXHIBITION</a>
          </div>

          <div className={styles.creditLine}>
            <span className={styles.creditText}>DEVELOPED BY DM CONSORTIUM</span>
            <span className={styles.copyright}>© 2026 ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

