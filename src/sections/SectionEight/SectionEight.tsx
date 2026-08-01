import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import styles from './SectionEight.module.css'

interface StoryChapter {
  id: string
  chapterNum: string
  tag: string
  title: string
  description: string
  blueprintNote: string
  imageUrl: string
  layout: 'left' | 'right'
}

const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'vision',
    chapterNum: '01',
    tag: 'THE VISION',
    title: 'Conceived at 7,906 feet.',
    description:
      'Serene Heights was born from a singular architectural vision: to create a high-elevation luxury sanctuary where natural mountain stillness and master-crafted hospitality exist in perfect unity.',
    blueprintNote: 'SITE ELEVATION · 7,906 FT · NATHIA GALI',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop',
    layout: 'left',
  },
  {
    id: 'mountains',
    chapterNum: '02',
    tag: 'THE MOUNTAINS',
    title: 'Carved into pine ridgelines.',
    description:
      'Built upon pristine Himalayan topography, the structure steps fluidly along the natural cliff gradient, preserving surrounding virgin pine forests and unobstructed horizon vistas.',
    blueprintNote: 'TOPOGRAPHY MATRIX · CONTOUR SLOPE 34°',
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
    layout: 'right',
  },
  {
    id: 'architecture',
    chapterNum: '03',
    tag: 'THE ARCHITECTURE',
    title: 'Cantilevered glass & stone.',
    description:
      'Expansive triple-glazed panoramic walls cantilever outward over mist-filled valleys, inviting morning sunlight and evening sunsets directly into every residential suite.',
    blueprintNote: 'TRIPLE GLAZING · CANTILEVER SPEC A4',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
    layout: 'left',
  },
  {
    id: 'craftsmanship',
    chapterNum: '04',
    tag: 'THE CRAFTSMANSHIP',
    title: 'Alpine granite & cedar.',
    description:
      'Every stone facade, heated hearth, and timber detail is crafted using local alpine granite and treated mountain cedar, engineered to endure decades of mountain winter snows.',
    blueprintNote: 'THERMAL INTEGRITY · ALPINE STONE CORE',
    imageUrl:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop',
    layout: 'right',
  },
  {
    id: 'future',
    chapterNum: '05',
    tag: 'THE FUTURE',
    title: 'An enduring legacy.',
    description:
      'Executed by DM Consortium, Serene Heights represents an unyielding commitment to timeless real estate value, elevated living, and architectural excellence for generations to come.',
    blueprintNote: 'DM CONSORTIUM · MASTER DEVELOPER',
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop',
    layout: 'left',
  },
]

export default function SectionEight() {
  const sectionRef = useRef<HTMLElement>(null)
  const chaptersRef = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      chaptersRef.current.forEach((chapter) => {
        if (!chapter) return
        const img = chapter.querySelector(`.${styles.chapterImage}`)
        const text = chapter.querySelector(`.${styles.textWrap}`)

        // Subtle image parallax and scale
        if (img) {
          gsap.fromTo(
            img,
            { y: -45, scale: 1.08 },
            {
              y: 45,
              scale: 1.0,
              ease: 'none',
              scrollTrigger: {
                trigger: chapter,
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
                trigger: chapter,
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
    <section ref={sectionRef} id="story" className={styles.section}>
      {/* Section Header */}
      <div className={`container ${styles.header}`}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowNum}>08</span>
          <span className={styles.eyebrowDivider}>/</span>
          <span>THE STORY OF SERENE HEIGHTS</span>
        </p>
        <h2 className={styles.headerTitle}>Architectural narrative & vision.</h2>
      </div>

      {/* Chapters Container */}
      <div className={styles.chaptersList}>
        {STORY_CHAPTERS.map((ch, idx) => (
          <div
            key={ch.id}
            ref={(el) => { chaptersRef.current[idx] = el }}
            className={`${styles.chapterSpread} ${ch.layout === 'right' ? styles.layoutRight : styles.layoutLeft}`}
          >
            {/* Image Frame */}
            <div className={styles.imageColumn}>
              <div className={styles.imageFrame}>
                <div
                  className={styles.chapterImage}
                  style={{ backgroundImage: `url(${ch.imageUrl})` }}
                />
                <div className={styles.imageOverlay} aria-hidden="true" />
              </div>
            </div>

            {/* Content Column */}
            <div className={styles.contentColumn}>
              <div className={styles.textWrap}>
                <div className={styles.chapterMeta}>
                  <span className={styles.chapterNum}>{ch.chapterNum}</span>
                  <span className={styles.tagBadge}>{ch.tag}</span>
                </div>
                <h3 className={styles.chapterTitle}>{ch.title}</h3>
                <p className={styles.chapterDescription}>{ch.description}</p>
                <div className={styles.blueprintFooter}>
                  <span className={styles.blueprintText}>{ch.blueprintNote}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

