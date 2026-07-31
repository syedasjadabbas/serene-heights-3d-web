# Serene Heights — Project Rules

## What this project is

We are cloning the **PRYPCO** website experience and replacing its content
with **Serene Heights** (a mountain resort in Nathiagali, Pakistan) content.

PRYPCO is the source of truth for the *experience*. Serene Heights is the
source of truth for the *information*.

## Reference material

> **STATUS (2026-07-31):** `reference/prypco-reference.mp4` was replaced
> (2026-07-31) with a recording confirmed via frame extraction to be genuinely
> prypco.com ("PRYPCO" nav, "Own your dream home, or invest in a fraction of
> Dubai" statement, Blocks/Mortgage/Mint cards, "Our ecosystem" horizontal
> cards, tokenization/mortgage-partner sections). An earlier version of this
> file was NOT PRYPCO — it showed a different site, "FIND Real Estate" — and
> the Hero's scroll-driven camera push + outline-wordmark choreography was
> tuned against that wrong file (see `Hero.tsx` comments).
>
> **The Hero is locked regardless of that mix-up.** It was already analyzed
> and implemented from the earlier PRYPCO Hero reference and is out of scope
> now — do not reconsider, modify, or ask for another Hero recording.
>
> The current recording intentionally starts mid-scroll, right after the
> Hero — this is expected and is the correct starting point for analyzing
> Section 2 onward, not a gap to fill.

- `reference/prypco-reference.mp4` — recorded walkthrough of the PRYPCO site.
  This is the **source of truth** for page structure, section order, section
  layouts, visual composition, spacing, typography hierarchy, image
  placement, section heights, backgrounds, cards, grids, buttons, navigation
  behavior, scroll behavior, sticky/pinned sections, transitions, animation
  choreography, motion timing, interaction patterns, responsive behavior,
  and overall visual rhythm.
- `reference/current-serene.mp4` — recording of this project's own state at
  some point, for before/after comparison. Not a design reference.
- Content source: https://www.sereneheightsnathiagali.com/ — use for factual
  project information, statistics, apartment/residence information,
  amenities, location information, investment information, project story,
  and contact information. Rewrite copy to fit PRYPCO's content slots and
  hierarchy — do not copy long paragraphs verbatim, do not invent factual
  claims.

## Strict mapping principle

Do NOT invent a new real-estate website design. Do NOT design sections based
on assumptions about what "Serene Heights needs." Do NOT reuse the old
pre-rewrite Serene Heights website's layout or styling.

For every section:

1. Inspect the corresponding PRYPCO section in the reference video.
2. Break down its layout and behavior (structure, motion, interaction).
3. Identify the closest relevant Serene Heights content for that slot.
4. Reproduce the PRYPCO structure with that content — preserve PRYPCO's
   styling and behavior, don't change the structure just because the
   content differs.

Example: if PRYPCO has a large editorial statement section, don't replace it
with a generic stats grid — put Serene Heights messaging inside the same
editorial structure. If PRYPCO has a horizontal property-experience
interaction, map Serene Heights residences into that same interaction. If
PRYPCO has an image-led sticky section, keep the image-led sticky behavior
and adapt the content. Reproduce PRYPCO's transition between two sections
before changing content presentation.

A person familiar with PRYPCO should immediately recognize its design
language and interaction model on this site — all project-specific content
and branding should read as Serene Heights.

## Hero section — LOCKED

The Hero follows the PRYPCO Hero reference: one photograph, scroll-driven
camera push via a single ScrollTrigger `onUpdate` → `gsap.set()` transform
(see `src/sections/Hero/Hero.tsx` for the implementation notes on why
`gsap.set()` is used directly instead of a timeline or `quickSetter`).

Do NOT bring back into the Hero:
- multi-image slideshow
- `HeroPhotography` sequence
- the "V2" deconstruction sequence
- the R3F placeholder
- masks

`HeroPhotography.tsx`, `heroPhotos.ts`, and `deconstructionFrames.ts` ("V2")
are kept in the repo but unused — they may only be reintroduced later if a
*different, later* PRYPCO section has an interaction they naturally fit.

## Building future sections

Before implementing each major section (Section 2 onward), inspect the
matching part of `reference/prypco-reference.mp4` first and report the
structure/behavior breakdown before writing code — don't design from
assumptions.
