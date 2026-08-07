# Mobile bottom nav: revert to reference-match clear liquid glass

Go back to the version that matched the uploaded reference image: a nearly clear glass capsule with thick refracting rim, solid white icons and labels, and a smoked-glass active tile.

## What changes

Only `src/components/layout/mobile-bottom-nav.tsx` (styling only, no logic/route changes).

1. **Capsule material — clear liquid glass**
   - Background tint drops to ~4-6% white so page content shows through.
   - Blur 18-20px with slight saturation and brightness lift.
   - Outer bright hairline rim + inner refracting ring for glass-wall thickness.
   - Soft ambient shadow underneath, no heavy dark stack.

2. **Icons and labels**
   - Revert to solid filled white icons with a subtle dark ambient shadow for legibility over light yarn photos.
   - Labels become white, small, semibold, tight tracking.

3. **Active tile**
   - Smoked-glass rounded-square tile (dark tint ~14%, inner top highlight, no glow).
   - Keep the existing spring/liquid settle motion.

4. **Search button**
   - Same clear-glass recipe so the circular search button reads as one material with the pill.

## Out of scope

No changes to nav items, order, labels, routes, cart badge, sizing, motion behaviour, or anything above the nav.

## Technical notes

- Use the constants from the previous reference-match pass: `LIQUID_GLASS_CONTAINER`, `RIM_HIGHLIGHT`, `EDGE_REFRACTION`, `SPECULAR_SHEEN`, `LIQUID_GLASS_BLOB`.
- Write `backdrop-filter` once only (no hand-written `-webkit-` twin).
- Verify at 375px on `/` and `/collections` with colourful product imagery behind the nav, confirming content is readable through the glass and icons/labels are white.
