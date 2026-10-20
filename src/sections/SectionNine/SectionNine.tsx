/**
 * Section: SectionNine (Curated Architectural Gallery)
 * Assets: src/assets/investment/
 */
import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import resortExteriorDayImg from '../../assets/gallery/resort-exterior-day.webp'
import apartmentBedroomImg from '../../assets/gallery/apartment-bedroom.webp'
import infinityPoolImg from '../../assets/gallery/infinity-pool.webp'
import apartmentLoungeImg from '../../assets/gallery/apartment-lounge.webp'
import mountainRangeImg from '../../assets/gallery/mountain-range.webp'
import styles from './SectionNine.module.css'

interface ExhibitionPiece {
  id: string
  exhibitNum: string
  tag: string
  title: string
  caption: string
  imageUrl: string
  /** Accessible description of the (CSS background) photograph. */
  imageLabel: string
}

const EXHIBITS: ExhibitionPiece[] = [
  {
    id: 'hero-terrace',
    exhibitNum: 'EXHIBIT 01',
    tag: 'ARCHITECTURE & LANDSCAPE · FEATURED HERO',
    title: 'A Mountain Retreat at 7,906 Feet',
    caption:
      'Set 7,906 ft above sea level on Kala Bagh Air Base Road, with rooftop dining above the Nathia Gali pine forest.',
    imageUrl:
      resortExteriorDayImg,
    imageLabel: 'Serene Heights resort towers rising above the pine forest, with the approach road in the foreground',
  },
  {
    id: 'residence-interior',
    exhibitNum: 'EXHIBIT 02',
    tag: 'PRIVATE LIVING SUITE',
    title: 'Furnished Suites & Alpine Light',
    caption:
      'Fully furnished 1, 2 and 3 bedroom hotel apartments with double-glazed UPVC windows facing Nathia Gali pine slopes.',
    imageUrl:
      apartmentBedroomImg,
    imageLabel: 'Furnished bedroom with soft lighting and tall windows onto the hillside',
  },
  {
    id: 'pool-sanctuary',
    exhibitNum: 'EXHIBIT 03',
    tag: 'WELLNESS & HYDROTHERAPY',
    title: 'Heated Infinity Pool Sanctuary',
    caption:
      'A heated infinity pool in year-round operation, paired with sauna, jacuzzi, massage and spa for every season.',
    imageUrl:
      infinityPoolImg,
    imageLabel: 'Infinity pool edge looking out over forested mountain slopes',
  },
  {
    id: 'lounge-club',
    exhibitNum: 'EXHIBIT 04',
    tag: 'EXECUTIVE HOSPITALITY',
    title: 'Business & Executive Center',
    caption:
      'A business & executive center, conference room and banquet hall, supported by a 24/7 front desk and concierge.',
    imageUrl:
      apartmentLoungeImg,
    imageLabel: 'Furnished lounge with a chandelier and glass doors opening onto a balcony',
  },
  {
    id: 'sunset-view',
    exhibitNum: 'EXHIBIT 05',
    tag: 'ALPINE HORIZON',
    title: 'Snow Peaks & Evergreen Valleys',
    caption:
      'Snow-capped ridges and evergreen valleys by day, and a refractor telescope for clear mountain nights.',
    imageUrl:
      mountainRangeImg,
    imageLabel: 'Snow-capped mountain range above evergreen forest under a bright sky',
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

  const rectCacheRef = useRef<Map<HTMLDivElement, DOMRect>>(new Map())
  // One pending tilt frame per card, so moving between cards never cancels
  // another card's update (and every pending frame is cancelled on unmount).
  const rafIdsRef = useRef<Map<HTMLDivElement, number>>(new Map())

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

      // 2. Hero Piece Parallax & 3D Spatial Entrance
      if (heroPieceRef.current && heroImageRef.current && heroCaptionRef.current) {
        gsap.fromTo(
          heroPieceRef.current,
          { opacity: 0, rotateX: 18, z: -80 },
          {
            opacity: 1,
            rotateX: 0,
            z: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: heroPieceRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          },
        )

        gsap.fromTo(
          heroImageRef.current,
          { y: -50, scale: 1.1 },
          {
            y: 50,
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
      }

      // 3. Staggered 3D Multi-Plane Gallery Reveals
      exhibitCardsRef.current.forEach((card, idx) => {
        if (!card) return
        const img = card.querySelector(`.${styles.exhibitImage}`)
        const text = card.querySelector(`.${styles.captionWrap}`)

        const yOffset = idx % 2 === 0 ? 35 : -35
        const initialRotateY = idx % 2 === 0 ? -18 : 18

        gsap.fromTo(
          card,
          { opacity: 0, rotateY: initialRotateY, z: -60 },
          {
            opacity: 1,
            rotateY: 0,
            z: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          },
        )

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
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
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

  // Cancel every pending tilt frame on unmount
  useEffect(() => {
    const rafIds = rafIdsRef.current
    return () => {
      rafIds.forEach((id) => cancelAnimationFrame(id))
      rafIds.clear()
    }
  }, [])

  // Mouse 3D Tilt Handlers — bound to the inner tilt layer, never to the
  // element GSAP animates, so the scroll entrance and the tilt compose.
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    rectCacheRef.current.set(card, card.getBoundingClientRect())
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return
    const card = e.currentTarget
    let rect = rectCacheRef.current.get(card)
    if (!rect) {
      rect = card.getBoundingClientRect()
      rectCacheRef.current.set(card, rect)
    }

    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const tiltX = (0.5 - py) * 16
    const tiltY = (px - 0.5) * 18

    const rafIds = rafIdsRef.current
    const pending = rafIds.get(card)
    if (pending !== undefined) cancelAnimationFrame(pending)

    rafIds.set(card, requestAnimationFrame(() => {
      rafIds.delete(card)
      card.style.setProperty('--tilt-x', `${tiltX}deg`)
      card.style.setProperty('--tilt-y', `${tiltY}deg`)
      card.style.setProperty('--light-x', `${px * 100}%`)
      card.style.setProperty('--light-y', `${py * 100}%`)
      card.classList.add(styles.cardHovered)
    }))
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    rectCacheRef.current.delete(card)
    const pending = rafIdsRef.current.get(card)
    if (pending !== undefined) cancelAnimationFrame(pending)
    rafIdsRef.current.delete(card)

    card.style.setProperty('--tilt-x', '0deg')
    card.style.setProperty('--tilt-y', '0deg')
    card.classList.remove(styles.cardHovered)
  }

  const ex01 = EXHIBITS[0]
  const ex02 = EXHIBITS[1]
  const ex03 = EXHIBITS[2]
  const ex04 = EXHIBITS[3]
  const ex05 = EXHIBITS[4]

  return (
    <section ref={sectionRef} id="exhibition" data-alias="curated-exhibits" className={styles.section}>
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
          A private exhibition of high-altitude architecture, interior sanctuaries, and Galyat horizon vistas.
        </p>
      </div>

      {/* 2. Dominant Hero Piece (Exhibit 01) */}
      <div className={`container ${styles.heroPieceWrap}`}>
        <div ref={heroPieceRef} className={styles.tiltShell}>
          <div
            className={styles.heroPieceContainer}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.cardLight} aria-hidden="true" />
            <div className={styles.heroImageFrame}>
              <div
                ref={heroImageRef}
                className={styles.heroExhibitImage}
                style={{ backgroundImage: `url(${ex01.imageUrl})` }}
                role="img"
                aria-label={ex01.imageLabel}
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
      </div>

      {/* 3. Staggered Asymmetric Dual-Spread (Exhibits 02 & 03) */}
      <div className={styles.dualSpreadContainer}>
        {/* Exhibit 02 - Tall Portrait Composition */}
        <div ref={(el) => { exhibitCardsRef.current[0] = el }} className={styles.tiltShell}>
          <div
            className={`${styles.exhibitCard} ${styles.cardTall}`}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.cardLight} aria-hidden="true" />
            <div className={styles.imageFrame}>
              <div
                className={styles.exhibitImage}
                style={{ backgroundImage: `url(${ex02.imageUrl})` }}
                role="img"
                aria-label={ex02.imageLabel}
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
        </div>

        {/* Exhibit 03 - Wide Landscape Offset Composition */}
        <div ref={(el) => { exhibitCardsRef.current[1] = el }} className={styles.tiltShell}>
          <div
            className={`${styles.exhibitCard} ${styles.cardWide}`}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.cardLight} aria-hidden="true" />
            <div className={styles.imageFrame}>
              <div
                className={styles.exhibitImage}
                style={{ backgroundImage: `url(${ex03.imageUrl})` }}
                role="img"
                aria-label={ex03.imageLabel}
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
      </div>

      {/* 4. Second Asymmetric Gallery Spread (Exhibits 04 & 05) */}
      <div className={styles.climaxSpreadContainer}>
        {/* Exhibit 04 - Medium Executive Hospitality Panel */}
        <div ref={(el) => { exhibitCardsRef.current[2] = el }} className={styles.tiltShell}>
          <div
            className={`${styles.exhibitCard} ${styles.cardMedium}`}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.cardLight} aria-hidden="true" />
            <div className={styles.imageFrame}>
              <div
                className={styles.exhibitImage}
                style={{ backgroundImage: `url(${ex04.imageUrl})` }}
                role="img"
                aria-label={ex04.imageLabel}
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
        </div>

        {/* Exhibit 05 - Panoramic Climax Horizon Piece */}
        <div ref={(el) => { exhibitCardsRef.current[3] = el }} className={styles.tiltShell}>
          <div
            className={`${styles.exhibitCard} ${styles.cardPanorama}`}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.cardLight} aria-hidden="true" />
            <div className={styles.imageFrame}>
              <div
                className={styles.exhibitImage}
                style={{ backgroundImage: `url(${ex05.imageUrl})` }}
                role="img"
                aria-label={ex05.imageLabel}
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
      </div>

      {/* 5. Closing Exhibition Statement */}
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
