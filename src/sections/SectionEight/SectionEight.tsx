import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import styles from './SectionEight.module.css'

export default function SectionEight() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      gsap.fromTo(
        textRef.current,
        { opacity: 0, y: 50 },
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
    <section ref={sectionRef} id="story" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div ref={textRef} className={styles.contentBox}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowNum}>08</span>
            <span className={styles.eyebrowDivider}>/</span>
            <span>HERITAGE & VISION</span>
          </p>

          <h2 className={styles.headline}>
            Crafted for generations to come.
          </h2>

          <p className={styles.paragraph}>
            Serene Heights is developed by DM Consortium, combining decades of structural engineering excellence with an unyielding commitment to preserving the natural pristine wilderness of Nathia Gali.
          </p>

          <div className={styles.authorBadge}>
            <span className={styles.authorTitle}>DM CONSORTIUM</span>
            <span className={styles.authorSub}>Master Developer & Operator</span>
          </div>
        </div>
      </div>
    </section>
  )
}
