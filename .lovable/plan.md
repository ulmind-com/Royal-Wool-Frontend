# Mobile bottom nav: keep black icons and labels, keep the clear glass

Revert only the colour change from the last pass. The icon and label colours go back to the previous dark/ink look; the clear liquid-glass material stays exactly as it is now.

## What changes

Only `src/components/layout/mobile-bottom-nav.tsx`.

1. **Icons** — back to dark ink outline icons (active item tinted with the brand primary, as before), with the light halo shadow instead of the dark one.
2. **Labels** — back to ink text (primary colour when active).
3. **Search icon** — same revert: ink outline, primary tint when active.
4. **Profile avatar / initial** — back to the previous ink border and primary active fill.
5. **Untouched:** the near-transparent capsule fill, blur, thick refracting rim, specular sheen, active glass tile, and all motion stay as they are now.

## Notes

- The active tile currently uses a light smoked (dark-tinted) fill; it will be lightened slightly so dark icons stay readable on top of it while the glass still reads as clear.
- No layout, routing, or cart/auth logic changes.
