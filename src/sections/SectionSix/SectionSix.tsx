/**
 * Section: Interiors
 * Assets: src/assets/interiors/
 */
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
import { prefersReducedMotion } from '../../motion/reducedMotion'
import SectionSixCanvas from './SectionSixCanvas'
import styles from './SectionSix.module.css'

interface ExhibitionCard {
  id: string
  num: string
  tag: string
  title: string
  subtitle: string
  spec: string
  imageUrl: string
  sizeClass: 'cardLarge' | 'cardMedium' | 'cardSmall'
}

const EXHIBITION_CARDS: ExhibitionCard[] = [
  {
    id: 'arrival',
    num: '01',
    tag: 'ARRIVAL EXPERIENCE',
    title: 'A Descent Into the Galyat Range',
    subtitle:
      'Private helicopter transfers connect Islamabad to Nathia Gali in 25 minutes, arriving 7,906 feet above sea level.',
    spec: 'ARRIVAL SPEC · PRIVATE HELIPAD',
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop',
    sizeClass: 'cardLarge',
  },
  {
    id: 'lobby',
    num: '02',
    tag: 'GRAND LOBBY',
    title: 'Three Towers, One Grand Arrival',
    subtitle:
      'A marble and gold reception hall welcomes owners into Towers A, B, and C — the first impression of an alpine sanctuary.',
    spec: 'LOBBY SPEC · TOWERS A · B · C',
    imageUrl:
      'https://images.unsplash.com/photo-1758193783649-13371d7fb8dd?q=80&w=1600&auto=format&fit=crop',
    sizeClass: 'cardMedium',
  },
  {
    id: 'residences',
    num: '03',
    tag: 'LUXURY RESIDENCES',
    title: '150+ Fully Furnished Suites',
    subtitle:
      'Hand-carved alpine oak, marble hearths, and thermal glass across 1, 2, and 3-bedroom residences.',
    spec: 'RESIDENCE SPEC · FULLY FURNISHED',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
    sizeClass: 'cardLarge',
  },
  {
    id: 'wellness',
    num: '04',
    tag: 'WELLNESS & SPA',
    title: 'Heated Indoor Infinity Pool',
    subtitle:
      'A climate-controlled sanctuary offering uninterrupted wellness — heated year-round against the alpine winter.',
    spec: 'WELLNESS SPEC · 34°C HEATED',
    imageUrl:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1600&auto=format&fit=crop',
    sizeClass: 'cardLarge',
  },
  {
    id: 'investment',
    num: '05',
    tag: 'INVESTMENT OPPORTUNITY',
    title: '13–15% Projected Annual ROI',
    subtitle:
      'Freehold ownership, zero maintenance fees, and turnkey rental management by DM Consortium.',
    spec: 'INVESTMENT SPEC · FREEHOLD TITLE',
    imageUrl:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1600&auto=format&fit=crop',
    sizeClass: 'cardMedium',
  },
]

export default function SectionSix() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const rectCacheRef = useRef<Map<HTMLDivElement, DOMRect>>(new Map())
  const rafIdRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return

    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null)

    let ctx: ReturnType<typeof gsap.context> | null = null

    try {
      ctx = gsap.context(() => {
        registerScrollTrigger()

        const getStartX = () => {
          const card1 = cards[0]
          if (!card1) return 0
          const c1Center = card1.offsetLeft + card1.offsetWidth / 2
          return window.innerWidth / 2 - c1Center
        }

        const getEndX = () => {
          const cardLast = cards[cards.length - 1]
          if (!cardLast) return 0
          const cLastCenter = cardLast.offsetLeft + cardLast.offsetWidth / 2
          return window.innerWidth / 2 - cLastCenter
        }

        const getScrollDistance = () => Math.abs(getStartX() - getEndX())

        // Progress-Driven Exhibition Focus Algorithm — Centered Geometry Math
        const updateCardFocus = () => {
          const startX = getStartX()
          const endX = getEndX()
          const totalDist = Math.abs(startX - endX)
          const trackX = (gsap.getProperty(track, 'x') as number) || startX
          const scrollProgress = totalDist > 0 ? Math.min(1, Math.max(0, (startX - trackX) / totalDist)) : 0
          const numCards = cards.length

          cards.forEach((card, idx) => {
            // Symmetrical progress target for card idx across 0.0 to 1.0
            const targetProgress = numCards > 1 ? idx / (numCards - 1) : 0
            const progressDist = Math.abs(scrollProgress - targetProgress)

            // Symmetrical focus plateau curve
            let fp = 0
            if (progressDist < 0.06) {
              fp = 1.0
            } else {
              const normDist = (progressDist - 0.06) / 0.22
              fp = Math.max(0, Math.pow(1 - Math.min(1, normDist), 1.5))
            }

            const scale = 0.96 + 0.04 * fp
            const borderGold = 0.25 + 0.60 * fp
            const borderTop = 0.14 + 0.28 * fp
            const shadowDepth = 0.45 + 0.40 * fp

            // Symmetrical image parallax pan (-18px to +18px)
            const relProgress = (scrollProgress - targetProgress) * 4
            const parallaxX = Math.max(-18, Math.min(18, relProgress * 18))

            const img = card.querySelector(`.${styles.cardImage}`) as HTMLElement | null

            gsap.set(card, {
              scale,
              opacity: 1,
              borderLeftColor: `rgba(243, 212, 152, ${borderGold})`,
              borderTopColor: `rgba(243, 212, 152, ${borderTop})`,
              boxShadow: `inset 0 1px 0 rgba(243, 212, 152, ${0.14 + 0.18 * fp}), 0 ${18 + 18 * fp}px ${40 + 40 * fp}px -15px rgba(0, 0, 0, ${shadowDepth})`,
              zIndex: Math.round(1 + fp * 10),
            })

            if (img) {
              gsap.set(img, {
                x: parallaxX,
                opacity: 1,
              })
            }
          })
        }

        // Horizontal Gallery Scrub: Translates trackX from getStartX() to getEndX()
        // so Card 1 starts 100% centered, and Card 5 ends 100% centered with equal margins.
        gsap.fromTo(
          track,
          { x: () => getStartX() },
          {
            x: () => getEndX(),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              scrub: true,
              start: 'top top',
              end: () => `+=${getScrollDistance()}`,
              invalidateOnRefresh: true,
              onUpdate: () => {
                updateCardFocus()
              },
              onRefresh: updateCardFocus,
            },
          }
        )

        updateCardFocus()
      }, section)
    } catch (err) {
      // silent
    }

    return () => {
      if (ctx) ctx.revert()
    }
  }, [])

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    rectCacheRef.current.set(card, card.getBoundingClientRect())
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    let rect = rectCacheRef.current.get(card)
    if (!rect) {
      rect = card.getBoundingClientRect()
      rectCacheRef.current.set(card, rect)
    }

    const clientX = e.clientX
    const clientY = e.clientY

    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)

    rafIdRef.current = requestAnimationFrame(() => {
      const px = (clientX - rect.left) / rect.width
      const py = (clientY - rect.top) / rect.height
      const rotateX = (0.5 - py) * 14
      const rotateY = (px - 0.5) * 16
      const shadowX = (0.5 - px) * 18
      const shadowY = (py - 0.5) * 18 + 28
      const parallaxX = (px - 0.5) * 8
      const parallaxY = (py - 0.5) * 8

      card.style.setProperty('--rotate-x', `${rotateX}deg`)
      card.style.setProperty('--rotate-y', `${rotateY}deg`)
      card.style.setProperty('--translate-z', '18px')
      card.style.setProperty('--light-x', `${px * 100}%`)
      card.style.setProperty('--light-y', `${py * 100}%`)
      card.style.setProperty('--light-opacity', '1')
      card.style.setProperty('--shadow-x', `${shadowX}px`)
      card.style.setProperty('--shadow-y', `${shadowY}px`)
      card.style.setProperty('--parallax-x', `${parallaxX}px`)
      card.style.setProperty('--parallax-y', `${parallaxY}px`)
      card.classList.add(styles.cardHovered)
    })
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    rectCacheRef.current.delete(card)
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)

    card.style.setProperty('--rotate-x', '0deg')
    card.style.setProperty('--rotate-y', '0deg')
    card.style.setProperty('--translate-z', '0px')
    card.style.setProperty('--shadow-x', '0px')
    card.style.setProperty('--shadow-y', '30px')
    card.style.setProperty('--parallax-x', '0px')
    card.style.setProperty('--parallax-y', '0px')
    card.classList.remove(styles.cardHovered)
  }

  return (
    <section ref={sectionRef} id="floor-plans" data-alias="smart-unit" className={styles.section}>
      {/* 3D Exhibition Canvas Stage */}
      <SectionSixCanvas />

      {/* Background Architectural Grid & Ambient Backdrop */}
      <div className={styles.blueprintBgGrid} aria-hidden="true" />
      <div className={styles.ambientGradient} aria-hidden="true" />

      {/* Section Header */}
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowNum}>06</span>
          <span className={styles.eyebrowDivider}>/</span>
          <span>ARCHITECTURAL EXHIBITION GALLERY</span>
        </p>
        <h2 className={styles.headerHeadline}>The Art of Mountain Living.</h2>
      </div>

      {/* Horizontal Gallery Viewport */}
      <div className={styles.galleryViewport}>
        <div ref={trackRef} className={styles.galleryTrack}>
          {EXHIBITION_CARDS.map((card, idx) => (
            <div
              key={card.id}
              ref={(el) => { cardsRef.current[idx] = el }}
              className={`${styles.card} ${styles[card.sizeClass]}`}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.cardLight} aria-hidden="true" />
              <span className={styles.cardWatermark}>{card.spec}</span>

              {/* High-res Image (eager load for width measurement) */}
              <div className={styles.imageFrame}>
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className={styles.cardImage}
                />
                <div className={styles.imageOverlay} aria-hidden="true" />
              </div>

              {/* Inner Text Content */}
              <div className={styles.cardContent}>
                <div>
                  <div className={styles.cardMetaRow}>
                    <span className={styles.cardNum}>{card.num}</span>
                    <span className={styles.cardTag}>{card.tag}</span>
                  </div>

                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardSubtitle}>{card.subtitle}</p>
                </div>

                <span className={styles.cardSpecBadge}>{card.spec}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

