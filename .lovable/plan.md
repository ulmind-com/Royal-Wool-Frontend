# About page — ultra-premium redesign

## Goal
Replace the plain `PageShell` + `Prose` About page with a designed, hero-grade page: an About hero (image left, copy right), an icon-led values band, and supporting story sections. All in the existing light "day house" design system (fleece/ink/marigold/madder tokens, `font-display`, `font-data`, Glass primitives).

## Sections (top to bottom)

1. **About hero** — split layout
   - Left: framed wool image (rounded 22/32px, hairline border, soft shadow — same treatment as the home hero card), subtle Ken-Burns-free entrance (fade + rise).
   - Right: eyebrow (`Since day one · West Bengal`), single `<h1>`, intro paragraph, two small stat chips (e.g. "Small-batch dyed", "Pan-India shipping") and a CTA to `/collections`.
   - Stacks image-first on mobile; two columns from `lg`.

2. **Values band** — icon + label + one line, no cards
   - 4 items: Small-batch dyeing, Colour consistency, Baby-safe dyes, Wound for stitch definition.
   - Same visual language as the product assurance band (centred ink icon above `font-display` title, muted line under), hairline dividers, borderless.

3. **Story** — two-up editorial rows
   - "What we make" / "Who we make it for" with a second wool image alternating side (zigzag), reusing the existing About copy so nothing factual changes.

4. **Closing strip** — one line + CTA to `/collections` and `/contact`.

## Assets to generate
- 2 wool photos (hero + story row), warm daylight, cream/fleece background, matching the current brand look:
  - `src/assets/about/about-hero.jpg`
  - `src/assets/about/about-story.jpg`
- 4 hand-drawn ink line-art icons matching the existing spec/assurance icon style (transparent PNG):
  - `dye-vat`, `colour-lot`, `baby-safe`, `winder`
- All uploaded via `lovable-assets` and referenced by `.asset.json` pointers, like every other image in the project.

## Code changes
- New `src/components/about/about-hero.tsx` — split hero.
- New `src/components/about/about-values.tsx` — icon band (mirrors `assurance-band.tsx` styling, its own local data array so it stays easy to swap to admin data later).
- New `src/components/about/about-story.tsx` — alternating image/text rows.
- New `src/data/about.ts` — copy + icon mapping in one place.
- Rewrite `src/routes/about.tsx` to compose these; keep exactly one `<h1>`, keep and lightly tighten the existing `head()` metadata (title/description/og already present).
- No API or business-logic changes; presentation only. Framer Motion entrances respect `useReducedMotion()` as elsewhere.

## Verification
- Build passes; About page rendered in preview at desktop and mobile widths to confirm the split hero, icon band and story rows look right and images load from CDN.
