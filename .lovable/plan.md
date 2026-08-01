## Goal

Add the next home section as a **fanned arc card carousel** (like the 21st.dev carousel-07 reference): cards spread in a shallow fan, the centre card upright and full-colour, side cards rotated, scaled down and dimmed — and they glide **right → left** one at a time, automatically.

## Where it goes

Replaces the placeholder `story` stub in `src/routes/index.tsx` (right after Best sellers' neighbours in the current order, before the Lookbook stub). Existing sections stay untouched.

## The section

New component `src/components/commerce/yarn-fan-carousel.tsx`:

- **Cards**: portrait 3:4 rounded cards, each showing one of the 9 uploaded yarn photos already in `src/assets/yarn/` (Cotton Delight pink/rust/coral, Cotton Candy sky/lilac/onyx, Hobby India lemon/mint/red).
- **Fan geometry**: 5 visible slots (`-2 -1 0 +1 +2`). Offsets per slot: rotate ≈ `∓9°/∓4.5°/0`, translateY lift for the centre, scale `0.86 / 0.93 / 1`, brightness/blur falls off toward the edges so the centre reads sharp. Centre card gets the strongest shadow and sits on top via z-index.
- **Card content**: a floating white-glass pill label at the top (range name, uppercase tracked mono, like `ADVENTURE` in the reference), and at the bottom a display-serif title + one-line italic caption over a soft bottom gradient scrim. Both fade/slide in only on the active card.
- **Motion**: `framer-motion` layout/transform springs; index advances every ~4s, each step slides the stack one position leftwards. Pauses on hover, focus, drag, and when the tab is hidden. Reduced motion → static fan, no autoplay.
- **Interaction**: drag/swipe horizontally, arrow keys, prev/next glass arrows and dot indicators; clicking the centre card opens that product/collection.

## Data (dynamic-ready)

Same pattern as New Arrivals: fetch newest products from the API, map to card items (`image`, `label`, `title`, `caption`, `href`); when the backend has no wool products yet, fall back to a local list built from the uploaded yarn asset pointers. One flag flips to API images once the admin panel is seeded.

## Styling rules

Tokens only — `--marigold`, `--ink`, `--background`, `--foreground`, `--border`; `<Glass>` for the pills and arrows so it matches the rest of the site. No hardcoded colours. Section header follows the existing eyebrow/`font-display` heading pattern (`05 · Lookbook`-style numbering kept consistent).

## Verification

Playwright: screenshot the fan at rest and after one auto-advance, confirm centre card swap, drag works, click routes to a product page, mobile width (785px) shows 3 slots without overflow, console clean.
