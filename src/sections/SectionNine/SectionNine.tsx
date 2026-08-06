/**
 * Section: Investment
 * Assets: src/assets/investment/
 */
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
}

const EXHIBITS: ExhibitionPiece[] = [
  {
    id: 'hero-terrace',
    exhibitNum: 'EXHIBIT 01',
    tag: 'ARCHITECTURE & LANDSCAPE · FEATURED HERO',
    title: 'High-Altitude Cantilevered Terrace',
    caption:
      'Elevated 7,906 ft above sea level, cantilevered private balconies offer uninterrupted cloud inversion vistas.',
    imageUrl:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'residence-interior',
    exhibitNum: 'EXHIBIT 02',
    tag: 'PRIVATE LIVING SUITE',
    title: 'Heated Hearth & Alpine Glass',
    caption:
      'Hand-cut alpine granite hearths framed by 18-foot triple-glazed glass opening onto Nathia Gali pine forest slopes.',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'pool-sanctuary',
    exhibitNum: 'EXHIBIT 03',
    tag: 'WELLNESS & HYDROTHERAPY',
    title: 'Climate-Controlled Infinity Sanctuary',
    caption:
      'Year-round heated indoor-outdoor infinity pool designed with seamless edge overflow into mountain pine wilderness.',
    imageUrl:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'lounge-club',
    exhibitNum: 'EXHIBIT 04',
    tag: 'EXECUTIVE HOSPITALITY',
    title: 'Fireside Library & Cognac Bar',
    caption:
      'Exclusive private owner lounge offering curated spirits, executive meeting suites, and 24-hour concierge service.',
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'sunset-view',
    exhibitNum: 'EXHIBIT 05',
    tag: 'HIMALAYAN HORIZON',
    title: 'Evening Sunset Over Galyat Range',
    caption:
      'Watch golden dusk colors illuminate the Himalayan snowcaps from the highest luxury vantage point in Nathia Gali.',
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
  },
]

export default function SectionNine() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const heroPieceRef = useRef<HTMLDivElement>(null)
  const heroImageRef = useRef<HTMLDivElement>(null)
  const heroCaptionRef = useRef<HTMLDivElement>(null)
  const exhibitCardsRef = useRef<(HTMLDivElement | null)[]>([])
  const closingStatementRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      registerScrollTrigger()

      // 1. Header Entrance
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 45 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      }

      // 2. Dominant Hero Piece Parallax & Floating Plate Motion
      if (heroPieceRef.current && heroImageRef.current && heroCaptionRef.current) {
        gsap.fromTo(
          heroImageRef.current,
          { y: -60, scale: 1.1 },
          {
            y: 60,
            scale: 1.0,
            ease: 'none',
            scrollTrigger: {
              trigger: heroPieceRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )

        gsap.fromTo(
          heroCaptionRef.current,
          { opacity: 0, y: 50, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1.0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: heroPieceRef.current,
              start: 'top 65%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      }

      // 3. Staggered Multi-Plane Gallery Reveals
      exhibitCardsRef.current.forEach((card, idx) => {
        if (!card) return
        const img = card.querySelector(`.${styles.exhibitImage}`)
        const text = card.querySelector(`.${styles.captionWrap}`)

        const yOffset = (idx % 2 === 0 ? 40 : -40)

        if (img) {
          gsap.fromTo(
            img,
            { y: -yOffset, scale: 1.08 },
            {
              y: yOffset,
              scale: 1.0,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
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
            { opacity: 0, y: 35, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1.0,
              duration: 1.0,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 78%',
                toggleActions: 'play none none reverse',
              },
            },
          )
        }
      })

      // 4. Closing Exhibition Statement Fade
      if (closingStatementRef.current) {
        gsap.fromTo(
          closingStatementRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: closingStatementRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const ex01 = EXHIBITS[0]
  const ex02 = EXHIBITS[1]
  const ex03 = EXHIBITS[2]
  const ex04 = EXHIBITS[3]
  const ex05 = EXHIBITS[4]

  return (
    <section ref={sectionRef} id="curated-exhibits" className={styles.section}>
      {/* Background Blueprint Mesh & Ambient Radial Lighting */}
      <div className={styles.blueprintBgGrid} aria-hidden="true" />
      <div className={styles.exhibitionAmbientMesh} aria-hidden="true" />

      {/* 1. Exhibition Entrance Header */}
      <div ref={headerRef} className={`container ${styles.header}`}>
        <div className={styles.headerBadge}>
          <span className={styles.eyebrowNum}>09</span>
          <span className={styles.eyebrowDivider}>/</span>
          <span>CURATED ARCHITECTURAL GALLERY</span>
        </div>
        <h2 className={styles.headerTitle}>Visual moments in Nathia Gali.</h2>
        <p className={styles.headerSubcopy}>
          A private exhibition of high-altitude architecture, interior sanctuaries, and Himalayan horizon vistas.
        </p>
      </div>

      {/* 2. Dominant Hero Piece (Exhibit 01) */}
      <div className={`container ${styles.heroPieceWrap}`}>
        <div ref={heroPieceRef} className={styles.heroPieceContainer}>
          <div className={styles.heroImageFrame}>
            <div
              ref={heroImageRef}
              className={styles.heroExhibitImage}
              style={{ backgroundImage: `url(${ex01.imageUrl})` }}
            />
            <div className={styles.heroImageOverlay} aria-hidden="true" />
            <span className={styles.heroWatermark}>{ex01.exhibitNum} · DOMINANT FEATURE</span>
          </div>

          <div ref={heroCaptionRef} className={styles.heroCaptionPlate}>
            <div className={styles.metaRow}>
              <span className={styles.exhibitNum}>{ex01.exhibitNum}</span>
              <span className={styles.exhibitTag}>{ex01.tag}</span>
            </div>
            <h3 className={styles.heroExhibitTitle}>{ex01.title}</h3>
            <p className={styles.heroExhibitCaption}>{ex01.caption}</p>
          </div>
        </div>
      </div>

      {/* 3. Staggered Asymmetric Dual-Spread (Exhibits 02 & 03) */}
      <div className={styles.dualSpreadContainer}>
        {/* Exhibit 02 - Tall Portrait Composition */}
        <div
          ref={(el) => { exhibitCardsRef.current[0] = el }}
          className={`${styles.exhibitCard} ${styles.cardTall}`}
        >
          <div className={styles.imageFrame}>
            <div
              className={styles.exhibitImage}
              style={{ backgroundImage: `url(${ex02.imageUrl})` }}
            />
            <div className={styles.imageOverlay} aria-hidden="true" />
          </div>

          <div className={styles.captionWrap}>
            <div className={styles.metaRow}>
              <span className={styles.exhibitNum}>{ex02.exhibitNum}</span>
              <span className={styles.exhibitTag}>{ex02.tag}</span>
            </div>
            <h3 className={styles.exhibitTitle}>{ex02.title}</h3>
            <p className={styles.exhibitCaption}>{ex02.caption}</p>
          </div>
        </div>

        {/* Exhibit 03 - Wide Landscape Offset Composition */}
        <div
          ref={(el) => { exhibitCardsRef.current[1] = el }}
          className={`${styles.exhibitCard} ${styles.cardWide}`}
        >
          <div className={styles.imageFrame}>
            <div
              className={styles.exhibitImage}
              style={{ backgroundImage: `url(${ex03.imageUrl})` }}
            />
            <div className={styles.imageOverlay} aria-hidden="true" />
          </div>

          <div className={styles.captionWrap}>
            <div className={styles.metaRow}>
              <span className={styles.exhibitNum}>{ex03.exhibitNum}</span>
              <span className={styles.exhibitTag}>{ex03.tag}</span>
            </div>
            <h3 className={styles.exhibitTitle}>{ex03.title}</h3>
            <p className={styles.exhibitCaption}>{ex03.caption}</p>
          </div>
        </div>
      </div>

      {/* 4. Second Asymmetric Gallery Spread (Exhibits 04 & 05) */}
      <div className={styles.climaxSpreadContainer}>
        {/* Exhibit 04 - Medium Executive Hospitality Panel */}
        <div
          ref={(el) => { exhibitCardsRef.current[2] = el }}
          className={`${styles.exhibitCard} ${styles.cardMedium}`}
        >
          <div className={styles.imageFrame}>
            <div
              className={styles.exhibitImage}
              style={{ backgroundImage: `url(${ex04.imageUrl})` }}
            />
            <div className={styles.imageOverlay} aria-hidden="true" />
          </div>

          <div className={styles.captionWrap}>
            <div className={styles.metaRow}>
              <span className={styles.exhibitNum}>{ex04.exhibitNum}</span>
              <span className={styles.exhibitTag}>{ex04.tag}</span>
            </div>
            <h3 className={styles.exhibitTitle}>{ex04.title}</h3>
            <p className={styles.exhibitCaption}>{ex04.caption}</p>
          </div>
        </div>

        {/* Exhibit 05 - Panoramic Climax Horizon Piece */}
        <div
          ref={(el) => { exhibitCardsRef.current[3] = el }}
          className={`${styles.exhibitCard} ${styles.cardPanorama}`}
        >
          <div className={styles.imageFrame}>
            <div
              className={styles.exhibitImage}
              style={{ backgroundImage: `url(${ex05.imageUrl})` }}
            />
            <div className={styles.imageOverlay} aria-hidden="true" />
          </div>

          <div className={styles.captionWrap}>
            <div className={styles.metaRow}>
              <span className={styles.exhibitNum}>{ex05.exhibitNum}</span>
              <span className={styles.exhibitTag}>{ex05.tag}</span>
            </div>
            <h3 className={styles.exhibitTitle}>{ex05.title}</h3>
            <p className={styles.exhibitCaption}>{ex05.caption}</p>
          </div>
        </div>
      </div>

      {/* 5. Closing Exhibition Statement - Seamless Transition into Section 10 */}
      <div ref={closingStatementRef} className={`container ${styles.closingExhibitionBlock}`}>
        <div className={styles.closingRule} aria-hidden="true" />
        <p className={styles.closingTag}>EXHIBITION CONCLUSION</p>
        <h3 className={styles.closingTitle}>
          Every detail master-crafted. Every vista preserved.
        </h3>
      </div>
    </section>
  )
}


