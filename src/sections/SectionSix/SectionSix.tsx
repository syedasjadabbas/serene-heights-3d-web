/**
 * Section: Interiors
 * Assets: src/assets/interiors/
 */
import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerScrollTrigger } from '../../motion/scrollTrigger'
const SectionSixCanvas = lazy(() => import('./SectionSixCanvas'))
import resortExteriorDayImg from '../../assets/gallery/resort-exterior-day.webp'
import conciergeDeskImg from '../../assets/gallery/concierge-desk.webp'
import apartmentLivingRoomImg from '../../assets/gallery/apartment-living-room.webp'
import infinityPoolImg from '../../assets/gallery/infinity-pool.webp'
import resortTowerNightImg from '../../assets/gallery/resort-tower-night.webp'
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
    title: 'An Ascent Into the Galyat Range',
    subtitle:
      'A scenic two-hour drive from Islamabad climbs to 7,906 feet, just off Kala Bagh Air Base Road in Nathia Gali.',
    spec: 'ARRIVAL SPEC · HELIPAD ACCESS',
    imageUrl:
      resortExteriorDayImg,
    sizeClass: 'cardLarge',
  },
  {
    id: 'lobby',
    num: '02',
    tag: 'GRAND LOBBY',
    title: 'Three Towers, One Grand Arrival',
    subtitle:
      'A 24/7 front desk and concierge welcome owners across three towers set on 30+ kanals of the Nathia Gali hillside.',
    spec: 'LOBBY SPEC · 24/7 CONCIERGE',
    imageUrl:
      conciergeDeskImg,
    sizeClass: 'cardMedium',
  },
  {
    id: 'residences',
    num: '03',
    tag: 'LUXURY RESIDENCES',
    title: '150+ Fully Furnished Suites',
    subtitle:
      'Fully furnished 1, 2, and 3-bedroom hotel apartments, finished with double-glazed UPVC windows.',
    spec: 'RESIDENCE SPEC · FULLY FURNISHED',
    imageUrl:
      apartmentLivingRoomImg,
    sizeClass: 'cardLarge',
  },
  {
    id: 'wellness',
    num: '04',
    tag: 'WELLNESS & SPA',
    title: 'Heated Infinity Pool',
    subtitle:
      'A heated infinity pool in year-round operation, joined by sauna, jacuzzi, massage and spa.',
    spec: 'WELLNESS SPEC · YEAR-ROUND',
    imageUrl:
      infinityPoolImg,
    sizeClass: 'cardLarge',
  },
  {
    id: 'investment',
    num: '05',
    tag: 'INVESTMENT OPPORTUNITY',
    title: '13–15% Smart Property Unit ROI',
    subtitle:
      'Smart Property Units from PKR 2,250,000, with rentals, maintenance and returns managed by DM Consortium.',
    spec: 'INVESTMENT SPEC · SMART PROPERTY UNIT',
    imageUrl:
      resortTowerNightImg,
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
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const cards = cardsRef.current.filter((c): c is HTMLDivElement => c !== null)

    const ScrollTrigger = registerScrollTrigger()
    const mm = gsap.matchMedia(section)

    // Pin + horizontal scrub only on desktop with motion allowed. At ≤900px the
    // CSS hands the row to native swipe scrolling, and under reduced motion the
    // viewport becomes natively scrollable instead (see SectionSix.module.css).
    mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
      // Cached once per ScrollTrigger refresh so the per-frame path never
      // touches layout (offsetLeft/offsetWidth) or the DOM tree (querySelector).
      const images = cards.map((card) => card.querySelector<HTMLImageElement>(`.${styles.cardImage}`))
      const lastFocus: number[] = cards.map(() => -1)
      const lastParallax: number[] = cards.map(() => NaN)

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

      // Progress-Driven Exhibition Focus Algorithm — Centered Geometry Math.
      // The track tween is linear (ease: 'none') and scrubbed 1:1, so the
      // trigger's progress equals the track's normalised x position.
      const updateCardFocus = (scrollProgress: number) => {
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

          // Only write card styles when its focus value actually changed —
          // most cards sit on the 0 / 1 plateau for most of the scrub.
          if (fp !== lastFocus[idx]) {
            lastFocus[idx] = fp
            const scale = 0.96 + 0.04 * fp
            const borderGold = 0.25 + 0.60 * fp
            const borderTop = 0.14 + 0.28 * fp
            const shadowDepth = 0.45 + 0.40 * fp

            gsap.set(card, {
              scale,
              opacity: 1,
              borderLeftColor: `rgba(243, 212, 152, ${borderGold})`,
              borderTopColor: `rgba(243, 212, 152, ${borderTop})`,
              boxShadow: `inset 0 1px 0 rgba(243, 212, 152, ${0.14 + 0.18 * fp}), 0 ${18 + 18 * fp}px ${40 + 40 * fp}px -15px rgba(0, 0, 0, ${shadowDepth})`,
              zIndex: Math.round(1 + fp * 10),
            })
          }

          // Symmetrical image parallax pan (-18px to +18px)
          const relProgress = (scrollProgress - targetProgress) * 4
          const parallaxX = Math.max(-18, Math.min(18, relProgress * 18))

          const img = images[idx]
          if (img && parallaxX !== lastParallax[idx]) {
            lastParallax[idx] = parallaxX
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
            onUpdate: (self) => updateCardFocus(self.progress),
            onRefresh: (self) => updateCardFocus(self.progress),
          },
        }
      )

      updateCardFocus(0)

      // Lazy images clipped by the overflow:hidden viewport only start loading
      // once they slide into view mid-scrub. Promote them to eager as the
      // section approaches so cards 3–5 are decoded before they arrive.
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        once: true,
        onEnter: () => {
          images.forEach((img) => {
            if (img) img.loading = 'eager'
          })
        },
      })

      // Per-frame gsap.set() calls run outside the matchMedia context, so they
      // aren't auto-reverted — clear them when leaving the desktop/motion query.
      return () => {
        gsap.set(cards, { clearProps: 'transform,opacity,borderLeftColor,borderTopColor,boxShadow,zIndex' })
        gsap.set(images.filter((img): img is HTMLImageElement => img !== null), { clearProps: 'transform,opacity' })
      }
    })

    return () => mm.revert()
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
    <section ref={sectionRef} id="smart-unit" data-alias="smart-unit" className={styles.section}>
      {/* 3D Exhibition Canvas Stage */}
      <Suspense fallback={null}>
        <SectionSixCanvas />
      </Suspense>

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
        <h2 className={styles.headerHeadline}>The Art of <span className={styles.headerAccent}>Mountain Living.</span></h2>
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

              {/* High-res Image (card size is fixed in CSS, so lazy loading is layout-safe) */}
              <div className={styles.imageFrame}>
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className={styles.cardImage}
                  loading="lazy"
                  decoding="async"
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

