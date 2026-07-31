## Goal

Replace the placeholder hero canvas on the home page with a premium, compact auto-playing image slider. Each slide has its own headline, sub-copy and button on the left, animating in from right→left as the slide arrives. Content comes from the backend so the admin panel can control everything later.

## Layout

- Not full-screen, not tall: hero band is `min(78vh, 640px)` on desktop, ~460px on mobile. Rounded 32px card inset inside the existing `max-w-[1600px]` container, so it reads as a premium framed panel rather than a stretched banner.
- Image fills the card (`object-cover`, right-weighted focal point so the yarn baskets stay visible), with a left-to-right fleece scrim gradient so the text side stays readable on all three photos.
- Text block sits left, vertically centred, max-width ~34rem: eyebrow (kicker) → display headline → one-line sub-copy → primary button + optional secondary link.
- Below/over the bottom edge: slim progress bar + numbered dots for the 3 slides.

## Motion (respects `prefers-reduced-motion`)

- Auto-advance every 6s, pauses on hover/focus and when the tab is hidden; arrows + dots for manual control; swipe on touch.
- Image cross-fades with a slow 8s Ken-Burns scale so it never feels static.
- Text: each element (eyebrow, headline, sub-copy, button) slides in from the right and settles left, staggered ~80ms, `cubic-bezier(.16,1,.3,1)`. Exiting slide's text slides out left. Implemented with Framer Motion `AnimatePresence` keyed on slide id.
- Reduced motion: instant cross-fade, no Ken-Burns, no slide-in, autoplay off.

## Dynamic content (admin-controllable)

- New component `src/components/commerce/hero-slider.tsx` reads the existing `/site-media` query and picks the `hero` section (falls back to `hero_slider`, then `shop_gallery`).
- Each slide maps: `url` → image, `title` → headline, `subtitle` → sub-copy, `order` → sequence, `active` → visibility.
- `MediaItem` in `src/lib/api/types.ts` gets four optional fields so the admin can drive the rest without another frontend change: `eyebrow?`, `cta_label?`, `cta_href?`, `align?`. Optional so nothing breaks until you add them server-side.
- Until the `hero` section exists in the backend, a local fallback in `src/data/hero-slides.ts` supplies the three uploaded Royal Wool photos with real copy/CTAs — same shape as the API, so the moment `hero` returns rows the fallback stops being used.
- The three uploaded images are registered as CDN assets (asset-pointer JSON in `src/assets`), not committed binaries.

## Files

- `src/components/commerce/hero-slider.tsx` — new slider (autoplay, dots, progress, animated text layer).
- `src/data/hero-slides.ts` — new fallback slides using the 3 uploads.
- `src/lib/api/types.ts` — optional `eyebrow` / `cta_label` / `cta_href` / `align` on `MediaItem`.
- `src/routes/index.tsx` — swap the Phase-5 hero grid for `<HeroSlider />`; keep the existing headline copy as slide 1's default.

## Backend note (for later, your side)

Add a `hero` section to site-media with rows carrying `title`, `subtitle`, `eyebrow`, `cta_label`, `cta_href`, `order`, `active`. Frontend needs no further change once those land.
