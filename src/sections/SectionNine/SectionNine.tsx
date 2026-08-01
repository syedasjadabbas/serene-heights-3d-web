import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import styles from './SectionNine.module.css'

interface GalleryItem {
  title: string
  tag: string
  gradient: string
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    title: 'Pine Forest Panorama',
    tag: 'EXTERIOR VIEW',
    gradient: 'linear-gradient(135deg, #1c3227 0%, #0d1a15 100%)',
  },
  {
    title: 'Penthouse Living Room',
    tag: 'LUXURY INTERIOR',
    gradient: 'linear-gradient(135deg, #2b3a32 0%, #101d18 100%)',
  },
  {
    title: 'Infinity Pool at Sunset',
    tag: 'RESORT AMENITY',
    gradient: 'linear-gradient(135deg, #3d3023 0%, #151a17 100%)',
  },
]

export default function SectionNine() {
  const sectionRef = useRef<HTMLElement>(null)
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      itemsRef.current.forEach((item, idx) => {
        if (!item) return
        gsap.fromTo(
          item,
          { y: idx % 2 === 0 ? 60 : -40, scale: 0.95 },
          {
            y: idx % 2 === 0 ? -30 : 30,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="gallery" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowNum}>09</span>
            <span className={styles.eyebrowDivider}>/</span>
            <span>GALLERY EXHIBITION</span>
          </p>
          <h2 className={styles.headline}>Visual moments in Nathia Gali.</h2>
        </div>

        <div className={styles.galleryGrid}>
          {GALLERY_ITEMS.map((item, idx) => (
            <div
              key={item.title}
              ref={(el) => { itemsRef.current[idx] = el }}
              className={styles.galleryCard}
              style={{ background: item.gradient }}
            >
              <div className={styles.cardOverlay} />
              <div className={styles.cardContent}>
                <span className={styles.cardTag}>{item.tag}</span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
