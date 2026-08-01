import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import styles from './SectionSix.module.css'

interface TourScene {
  id: string
  num: string
  tag: string
  title: string
  subtitle: string
  spec: string
  imageUrl: string
  side: 'left' | 'right'
}

const TOUR_SCENES: TourScene[] = [
  {
    id: 'pool',
    num: '01',
    tag: 'WELLNESS SANCTUARY',
    title: 'Heated Infinity Pool',
    subtitle:
      'Climate-controlled indoor and outdoor swimming overlooking Nathia Gali pine valleys 365 days a year.',
    spec: 'YEAR-ROUND HEATED',
    imageUrl:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop',
    side: 'left',
  },
  {
    id: 'spa',
    num: '02',
    tag: 'RESTORATIVE RECOVERY',
    title: 'Thermal Luxury Spa',
    subtitle:
      'Cedar saunas, herbal steam rooms, cold plunge pools, and private alpine massage suites.',
    spec: '5-STAR WELLNESS',
    imageUrl:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1600&auto=format&fit=crop',
    side: 'right',
  },
  {
    id: 'dining',
    num: '03',
    tag: 'CULINARY EXCELLENCE',
    title: 'Sky Fine Dining',
    subtitle:
      'Gourmet culinary experiences and executive wine lounges framed by 360-degree mountain glass vistas.',
    spec: 'GOURMET CUISINE',
    imageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop',
    side: 'left',
  },
  {
    id: 'clubhouse',
    num: '04',
    tag: 'EXECUTIVE CLUB',
    title: 'Fireside Clubhouse & Lounge',
    subtitle:
      'Private owner library, fireside cognac lounge, executive meeting suites, and direct helipad access.',
    spec: 'PRIVATE HELIPAD ACCESS',
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop',
    side: 'right',
  },
  {
    id: 'trails',
    num: '05',
    tag: 'ALPINE ADVENTURE',
    title: 'Private Forest & Ski Trails',
    subtitle:
      'Immediate access to Galyat winter ski trails, pine forest hiking paths, and private mountain viewpoints.',
    spec: 'DIRECT TRAILHEAD',
    imageUrl:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1600&auto=format&fit=crop',
    side: 'left',
  },
]

export default function SectionSix() {
  const sectionRef = useRef<HTMLElement>(null)
  const scenesRef = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      scenesRef.current.forEach((scene) => {
        if (!scene) return
        const img = scene.querySelector(`.${styles.sceneImage}`)
        const content = scene.querySelector(`.${styles.sceneContent}`)

        // Subtle image scale and parallax
        if (img) {
          gsap.fromTo(
            img,
            { y: -40, scale: 1.08 },
            {
              y: 40,
              scale: 1.0,
              ease: 'none',
              scrollTrigger: {
                trigger: scene,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )
        }

        // Scene content reveal animation
        if (content) {
          gsap.fromTo(
            content,
            { opacity: 0, y: 45 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: scene,
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
    <section ref={sectionRef} id="amenities" className={styles.section}>
      {/* Section Header */}
      <div className={`container ${styles.header}`}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowNum}>06</span>
          <span className={styles.eyebrowDivider}>/</span>
          <span>ARCHITECTURAL AMENITIES TOUR</span>
        </p>
        <h2 className={styles.headline}>Curated for year-round luxury.</h2>
      </div>

      {/* Vertical Scenes List */}
      <div className={styles.scenesList}>
        {TOUR_SCENES.map((scene, idx) => (
          <div
            key={scene.id}
            ref={(el) => { scenesRef.current[idx] = el }}
            className={`${styles.sceneRow} ${scene.side === 'right' ? styles.rowRight : styles.rowLeft}`}
          >
            {/* Image Frame */}
            <div className={styles.imageColumn}>
              <div className={styles.imageFrame}>
                <div
                  className={styles.sceneImage}
                  style={{ backgroundImage: `url(${scene.imageUrl})` }}
                />
                <div className={styles.imageOverlay} aria-hidden="true" />
              </div>
            </div>

            {/* Editorial Content Column */}
            <div className={styles.contentColumn}>
              <div className={styles.sceneContent}>
                <div className={styles.sceneMeta}>
                  <span className={styles.sceneNum}>{scene.num}</span>
                  <span className={styles.sceneTag}>{scene.tag}</span>
                </div>
                <h3 className={styles.sceneTitle}>{scene.title}</h3>
                <p className={styles.sceneSubtitle}>{scene.subtitle}</p>
                <div className={styles.sceneFooter}>
                  <span className={styles.sceneSpec}>{scene.spec}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

