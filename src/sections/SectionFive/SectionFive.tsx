import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import styles from './SectionFive.module.css'

interface EditorialSpread {
  id: string
  number: string
  tag: string
  title: string
  description: string
  imageUrl: string
  layout: 'left' | 'right' | 'center'
}

const SPREADS: EditorialSpread[] = [
  {
    id: 'mornings',
    number: '01',
    tag: 'MOUNTAIN MORNINGS',
    title: 'Awaken above 7,906 ft.',
    description:
      'Crisp alpine air, morning pine forest mist, and dramatic cloud inversions rolling over the Galyat mountain peaks.',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop',
    layout: 'left',
  },
  {
    id: 'residences',
    number: '02',
    tag: 'PRIVATE LIVING',
    title: 'Sanctuary of silence.',
    description:
      'Framed panoramic mountain vistas, heated stone hearths, and cantilevered private balconies carved into the cliffside.',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
    layout: 'right',
  },
  {
    id: 'hospitality',
    number: '03',
    tag: 'LUXURY HOSPITALITY',
    title: 'Bespoke hotel service.',
    description:
      'Turnkey suite operations, private chef dining, and dedicated 24-hour executive concierge managed by DM Consortium.',
    imageUrl:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop',
    layout: 'left',
  },
  {
    id: 'wellness',
    number: '04',
    tag: 'NATURE & WELLNESS',
    title: 'Restorative mountain living.',
    description:
      'Year-round heated indoor infinity pools, hydrotherapy spas, and private trails winding through virgin pine forests.',
    imageUrl:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop',
    layout: 'right',
  },
  {
    id: 'vistas',
    number: '05',
    tag: 'SUNSET HORIZON',
    title: 'Endless golden dusk.',
    description:
      'Watch evening sunsets illuminate the Himalayan horizon from the highest luxury resort elevation in Nathia Gali.',
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
    layout: 'center',
  },
]

export default function SectionFive() {
  const sectionRef = useRef<HTMLElement>(null)
  const spreadsRef = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      spreadsRef.current.forEach((spread) => {
        if (!spread) return
        const img = spread.querySelector(`.${styles.spreadImage}`)
        const text = spread.querySelector(`.${styles.textBlock}`)

        // Parallax and subtle zoom on image
        if (img) {
          gsap.fromTo(
            img,
            { y: -50, scale: 1.08 },
            {
              y: 50,
              scale: 1.0,
              ease: 'none',
              scrollTrigger: {
                trigger: spread,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )
        }

        // Text reveal animation
        if (text) {
          gsap.fromTo(
            text,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.95,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: spread,
                start: 'top 75%',
                toggleActions: 'play none none reverse',
              },
            },
          )
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="lifestyle" className={styles.section}>
      {/* Section Header */}
      <div className={`container ${styles.header}`}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowNum}>05</span>
          <span className={styles.eyebrowDivider}>/</span>
          <span>ALPINE LIFESTYLE EDITORIAL</span>
        </p>
        <h2 className={styles.headerHeadline}>Living above the clouds.</h2>
      </div>

      {/* Spreads Container */}
      <div className={styles.spreadsList}>
        {SPREADS.map((item, idx) => (
          <div
            key={item.id}
            ref={(el) => { spreadsRef.current[idx] = el }}
            className={`${styles.spreadItem} ${
              item.layout === 'right'
                ? styles.layoutRight
                : item.layout === 'center'
                  ? styles.layoutCenter
                  : styles.layoutLeft
            }`}
          >
            {/* Full-width image frame */}
            <div className={styles.imageFrame}>
              <div
                className={styles.spreadImage}
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
              <div className={styles.imageOverlay} aria-hidden="true" />
            </div>

            {/* Editorial Text Block */}
            <div className={`container ${styles.textContainer}`}>
              <div className={styles.textBlock}>
                <div className={styles.metaRow}>
                  <span className={styles.spreadNum}>{item.number}</span>
                  <span className={styles.spreadTag}>{item.tag}</span>
                </div>
                <h3 className={styles.spreadTitle}>{item.title}</h3>
                <p className={styles.spreadDescription}>{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

