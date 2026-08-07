/**
 * Section: Residences
 * Assets: src/assets/residences/
 */
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import Button from '../../components/ui/Button'
import ResortViewer from './ResortViewer'
import styles from './SectionFour.module.css'

export default function SectionFour() {
  const sectionRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subcopyRef = useRef<HTMLParagraphElement>(null)
  const ctaWrapRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      // Text Overlay Entrance
      gsap.fromTo(
        [eyebrowRef.current, headlineRef.current, subcopyRef.current, ctaWrapRef.current],
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        },
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="amenities" data-alias="architecture-3d" className={styles.section}>
      {/* 3D Scene Canvas Container */}
      <div className={styles.canvasContainer}>
        <ResortViewer />
      </div>

      {/* Dark Gradient Vignette Overlay for Readability */}
      <div className={styles.vignetteOverlay} aria-hidden="true" />

      {/* Minimal Editorial Overlay Content */}
      <div className={`container ${styles.contentWrap}`}>
        <div ref={overlayRef} className={styles.overlayInner}>
          <p ref={eyebrowRef} className={styles.eyebrow}>
            <span className={styles.eyebrowNum}>04</span>
            <span className={styles.eyebrowDivider}>/</span>
            <span>ARCHITECTURAL SANCTUARY</span>
          </p>

          <h2 ref={headlineRef} className={styles.headline}>
            Step inside the <span className={styles.headlineAccent}>sanctuary.</span>
          </h2>

          <p ref={subcopyRef} className={styles.subcopy}>
            An interactive architectural masterpiece set 7,906 ft high in the pine forests of Nathia Gali.
          </p>

          <div ref={ctaWrapRef} className={styles.ctaWrap}>
            <Button href="#floor-plans" variant="ghost">
              EXPLORE FLOOR PLANS
            </Button>
            <Button href="#enquire" variant="ghost">
              SCHEDULE PRIVATE VIEWING
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
