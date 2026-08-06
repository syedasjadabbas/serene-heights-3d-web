# Serene Heights 3D Web - Asset Directory & Mapping

This directory contains production visual assets organized by section for zero-code replacement maintainability. Drop new production renders with matching filenames into the respective folder to update website imagery automatically without code changes.

## Shared & Global Assets

- **Folder**: `common`
- **Components**: `Logo.tsx`, `Navigation.tsx`, `HeroV2.tsx`, `Hero.tsx`
- **Current Files**:
  - `logo.svg`
  - `logo.png`

- **Folder**: `models`
- **Components**: `HeroModel.tsx`, `ResortModel.tsx`
- **Current Files**: None (Production 3D GLB models placed in `public/models/`)

## Section Asset Mapping

### Hero
- **Folder**: `hero`
- **Components**: `HeroV2.tsx`, `Deconstruction.tsx`, `Hero.tsx`
- **Current Files**:
  - `hero-main.webp` (Primary establishing render)
  - `hero-main.png` (PNG fallback establishing render)
  - `hero-background.png` (Depth layer 1 - Background mountain/sky)
  - `hero-bottom.png` (Depth layer 2 - Landscape base)
  - `hero-building.png` (Depth layer 3 - Architectural structure)
  - `hero-foreground.png` (Foreground depth pass)
  - `hero-approach.png` (Narrative sequence pass 02)
  - `hero-arrival.png` (Narrative sequence pass 03)
  - `hero-ascend.png` (Narrative sequence pass 04)
  - `hero-rooftop.png` (Narrative sequence pass 05)
  - `hero-scene-07.png` (Narrative sequence pass 07)
  - `hero-scene-08.png` (Narrative sequence pass 08)

### Section 2
- **Folder**: `overview`
- **Component**: `SectionTwo.tsx`
- **Current Files**: None (Prepared for production drops, e.g. `overview-main.webp`)

### Section 3
- **Folder**: `masterplan`
- **Component**: `SectionThree.tsx`
- **Current Files**: None (Prepared for production drops, e.g. `masterplan-main.webp`)

### Section 4
- **Folder**: `residences`
- **Component**: `SectionFour.tsx`
- **Current Files**: None (Prepared for production drops, e.g. `residences-01.webp`)

### Section 5
- **Folder**: `amenities`
- **Component**: `SectionFive.tsx`
- **Current Files**: None (Prepared for production drops, e.g. `amenities-01.webp`)

### Section 6
- **Folder**: `interiors`
- **Component**: `SectionSix.tsx`
- **Current Files**: None (Prepared for production drops, e.g. `interiors-01.webp`)

### Section 7
- **Folder**: `gallery`
- **Component**: `SectionSeven.tsx`
- **Current Files**: None (Prepared for production drops, e.g. `gallery-01.webp`)

### Section 8
- **Folder**: `location`
- **Component**: `SectionEight.tsx`
- **Current Files**: None (Prepared for production drops, e.g. `location-map.webp`)

### Section 9
- **Folder**: `investment`
- **Component**: `SectionNine.tsx`
- **Current Files**: None (Prepared for production drops, e.g. `investment-hero.webp`)

### Footer
- **Folder**: `footer`
- **Component**: `SectionTen.tsx`
- **Current Files**: None (Prepared for production drops, e.g. `footer-hero.webp`)
