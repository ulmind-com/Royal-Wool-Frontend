# Mobile Bottom Nav — Thicker Liquid Glass

The bottom nav currently looks too thin and washed out. Keep the existing structure (5-item pill + separate round search button) and only upgrade the glass treatment and sizing so it feels solid and premium like the reference, on every phone width.

## What changes

- **Thicker, more solid glass**: raise the white opacity of the pill and search button so they read as a near-solid frosted capsule (like the reference), with stronger blur/saturation, a crisper white rim, and a deeper soft drop shadow underneath.
- **More height / presence**: increase the capsule height a step (roughly 62px on small phones, 68px on larger phones) and give it slightly more inner padding so icons breathe.
- **Active bubble**: make the sliding round indicator a soft grey-white bubble with a gentle inset depth, closer to the reference's pressed-pill look, and widen it slightly so it hugs the icon.
- **Icons**: slightly larger and heavier stroke so they stay legible against the brighter glass. Cart badge stays red-ish/marigold accent with a white ring.
- **Responsive on any phone**: the pill stays a 5-column grid that shrinks with the screen (min-w-0, flex-1), search button stays fixed-size and never squashes, gaps and side padding scale down below 360px, and safe-area padding is kept for notched devices. Verified from 320px up to 450px+.

## Out of scope

No change to nav items, routes, cart toggle behaviour, or anything above the nav.

## Technical notes

Single file: `src/components/layout/mobile-bottom-nav.tsx`. Edit the `LIQUID_GLASS_CONTAINER` and `LIQUID_GLASS_INDICATOR` style objects plus the height/size/gap utility classes. Keep `backdropFilter` written once (no hand-written `-webkit-` twin) so the production build keeps the standard property. Verify with a Playwright pass at 320 / 375 / 430 px widths.
