import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import styles from './SectionNine.module.css'

interface ExhibitionPiece {
  id: string
  exhibitNum: string
  tag: string
  title: string
  caption: string
  imageUrl: string
  scale: 'hero' | 'tall' | 'wide' | 'medium'
}

const EXHIBITS: ExhibitionPiece[] = [
  {
    id: 'hero-terrace',
    exhibitNum: '01',
    tag: 'ARCHITECTURE & LANDSCAPE',
    title: 'High-Altitude Cantilevered Terrace',
    caption:
      'Elevated 7,906 ft above sea level, cantilevered private balconies offer uninterrupted cloud inversion vistas.',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop',
    scale: 'hero',
  },
  {
    id: 'residence-interior',
    exhibitNum: '02',
    tag: 'PRIVATE LIVING SUITE',
    title: 'Heated Hearth & Alpine Glass',
    caption:
      'Hand-cut alpine granite hearths framed by 18-foot triple-glazed glass opening onto Nathia Gali pine forest slopes.',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
    scale: 'tall',
  },
  {
    id: 'pool-sanctuary',
    exhibitNum: '03',
    tag: 'WELLNESS & HYDROTHERAPY',
    title: 'Climate-Controlled Infinity Sanctuary',
    caption:
      'Year-round heated indoor-outdoor infinity pool designed with seamless edge overflow into mountain pine wilderness.',
    imageUrl:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop',
    scale: 'wide',
  },
  {
    id: 'lounge-club',
    exhibitNum: '04',
    tag: 'EXECUTIVE HOSPITALITY',
    title: 'Fireside Library & Cognac Bar',
    caption:
      'Exclusive private owner lounge offering curated spirits, executive meeting suites, and 24-hour concierge service.',
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop',
    scale: 'medium',
  },
  {
    id: 'sunset-view',
    exhibitNum: '05',
    tag: 'HIMALAYAN HORIZON',
    title: 'Evening Sunset Over Galyat Range',
    caption:
      'Watch golden dusk colors illuminate the Himalayan snowcaps from the highest luxury vantage point in Nathia Gali.',
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
    scale: 'hero',
  },
]

export default function SectionNine() {
  const sectionRef = useRef<HTMLElement>(null)
  const exhibitsRef = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      exhibitsRef.current.forEach((exhibit, idx) => {
        if (!exhibit) return
        const img = exhibit.querySelector(`.${styles.exhibitImage}`)
        const text = exhibit.querySelector(`.${styles.captionWrap}`)

        // Variable scroll parallax per exhibit scale
        const yDist = idx % 2 === 0 ? 55 : -45

        if (img) {
          gsap.fromTo(
            img,
            { y: -yDist, scale: 1.08 },
            {
              y: yDist,
              scale: 1.0,
              ease: 'none',
              scrollTrigger: {
                trigger: exhibit,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )
        }

        if (text) {
          gsap.fromTo(
            text,
            { opacity: 0, y: 35 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: exhibit,
                start: 'top 78%',
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
    <section ref={sectionRef} id="gallery" className={styles.section}>
      {/* Section Header */}
      <div className={`container ${styles.header}`}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowNum}>09</span>
          <span className={styles.eyebrowDivider}>/</span>
          <span>ARCHITECTURAL EXHIBITION</span>
        </p>
        <h2 className={styles.headerTitle}>Visual moments in Nathia Gali.</h2>
      </div>

      {/* Exhibition Spreads Container */}
      <div className={styles.exhibitionFlow}>
        {EXHIBITS.map((item, idx) => (
          <div
            key={item.id}
            ref={(el) => { exhibitsRef.current[idx] = el }}
            className={`${styles.exhibitSpread} ${
              item.scale === 'hero'
                ? styles.scaleHero
                : item.scale === 'tall'
                  ? styles.scaleTall
                  : item.scale === 'wide'
                    ? styles.scaleWide
                    : styles.scaleMedium
            } ${idx % 2 === 1 ? styles.spreadRight : styles.spreadLeft}`}
          >
            {/* Image Frame */}
            <div className={styles.imageFrame}>
              <div
                className={styles.exhibitImage}
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
              <div className={styles.imageOverlay} aria-hidden="true" />
            </div>

            {/* Editorial Caption Overlay */}
            <div className={styles.captionWrap}>
              <div className={styles.metaRow}>
                <span className={styles.exhibitNum}>{item.exhibitNum}</span>
                <span className={styles.exhibitTag}>{item.tag}</span>
              </div>
              <h3 className={styles.exhibitTitle}>{item.title}</h3>
              <p className={styles.exhibitCaption}>{item.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

