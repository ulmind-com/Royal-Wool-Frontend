## Goal

Replace the flat "Shop by Yarn Weight" tiles with the chosen **Kinetic Glass** 3D card direction — premium, tactile, animated on hover — while keeping the section compact and fully data-driven.

## What changes

Only `src/components/commerce/yarn-weight-rail.tsx` (tile visuals + motion). Data, links, admin-driven category logic and copy stay exactly as they are.

### The card
- Wrap each tile in a perspective container (`perspective: 1200px`) with a `preserve-3d` inner card.
- Hover/focus: card tilts (`rotateX ~8deg`, `rotateY ~-10deg`) + slight scale, eased with `cubic-bezier(0.23, 1, 0.32, 1)` over ~0.6s.
- Depth layers via `translateZ`: number badge furthest forward, strand mark mid, text block behind — so the tilt reads as real parallax.
- Diagonal light sweep: a translucent white gradient band that slides across the glass on hover.
- Shadow bloom + a soft floating ground shadow ellipse under the card that fades in on hover.
- Inner bevel ring for the glass edge; keeps the existing `<Glass variant="card">` base so the liquid-glass look stays consistent with the rest of the site.

### Details kept on-brand
- Badge becomes a rounded-square marigold chip with inset highlight (numbers stay position-derived: 1…N).
- Weight name in the existing display serif, hook spec in a soft pill using the mono data font, note stays one line with ellipsis.
- Colors use existing tokens only (`--marigold`, `--ink`, `--background`, `--foreground`) — no hardcoded hex.

### Constraints respected
- Cards stay short — the height only grows slightly (roughly +12–16px) to give the 3D room to breathe; still a 7-up row on desktop, snap rail on mobile.
- Reduced motion: no tilt, no sweep, no lift — just a static glass card (existing `useReducedMotion` already wired in).
- Touch devices get a light press/scale response instead of hover tilt.

## Technical notes

- Tilt is CSS-transform based on the group hover state (no per-card pointer listeners), so 7 cards stay cheap; `transform-gpu` + `will-change` on the card only.
- No changes to `categoryTreeQuery`, tile mapping, `TileLink`, or `/collections/$slug` routing.
- Verified afterwards with Playwright: hover state screenshot, tile height check, click-through to a category page, console clean.
