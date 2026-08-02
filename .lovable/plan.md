# Mobile responsive polish — Royal Wool

Goal: make the whole storefront feel like a native app on any phone. Presentation-only changes — no data, API, routing or business-logic edits.

## Approach

Audit each section at 360px, 390px and 430px widths with Playwright screenshots, then fix only what breaks. Rules applied everywhere:

- Text/widget rows use `grid-cols-[minmax(0,1fr)_auto]` on mobile, promoted to `flex` at `sm:`; `min-w-0` + `truncate` on text, `shrink-0` on icons.
- Tap targets minimum 44px; horizontal rails get edge-bleed scroll with snap and hidden scrollbars.
- No horizontal page overflow anywhere; per-section padding standardised (`px-4` mobile → `sm:px-6` → `lg:px-10`).
- Heavy motion (WebGL gallery, scroll-driven stack, marquee) gets lighter mobile settings so scrolling stays smooth.

## Section-by-section

1. **Header / ticker** — compact mobile bar, larger touch icons, drawer nav full-height with safe-area padding.
2. **Hero slider** — shorter mobile height, headline/CTA scale down, controls moved clear of text, CTA full-width on small screens.
3. **Trust band** — 2-column mobile grid with tighter vertical rhythm and no clipping.
4. **Category showcase** — single/two-column tiles on mobile with readable label sizes.
5. **New Arrivals (CircularGallery)** — mobile-tuned bend/item width and font scale; reduced pixel ratio for performance.
6. **Yarn weight rail, yarn stack cards, fan carousel** — mobile geometry: reduced card width/rotation, disabled 3D tilt on touch, stack section switches to a simpler stacked flow so it never overflows.
7. **Featured yarn marquee** — smaller cutouts, slower speed, momentum drag on touch.
8. **Brand banner** — keeps full-bleed, verified no text crop on narrow screens.
9. **Reviews** — single column masonry, horizontally scrollable filter chips, photo thumbs sized for thumbs, lightbox full-screen with swipe-friendly controls.
10. **Footer + WhatsApp FAB** — stacked footer columns, FAB moved above safe area so it never covers content.
11. **Inner routes** (product, cart, checkout, account, collections, search) — same audit pass: forms full-width, sticky mobile action bars where a primary CTA exists, tables reflowed to cards.

## Technical notes

- Add `viewport-fit=cover` handling and safe-area (`env(safe-area-inset-*)`) utilities in `src/styles.css` for notch/home-bar devices.
- Add a small `no-scrollbar` / snap utility via `@utility` in `src/styles.css` rather than inline hacks.
- Reuse existing `useIsMobile` hook for behaviour that can't be done in CSS (motion intensity, drag vs hover).
- Verification: Playwright screenshots at 360/390/430 px for home and each inner route, plus an overflow check (`scrollWidth > clientWidth`) on every route.
