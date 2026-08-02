# Enable the card-swap stacking on mobile — "Three ranges, one dye house"

## Why it doesn't show now

`src/components/commerce/yarn-stack-cards.tsx` computes `flat = reduced || touch`. On any touch device the sticky/scroll-driven stack is replaced with a plain vertical list, so phones never see the swap effect.

## Changes (presentation only, one file)

1. **Stop disabling the effect on touch.** Keep the flat fallback only for `prefers-reduced-motion`. Touch phones get the same sticky stacking as desktop.
2. **Mobile-tuned sticky geometry** so cards fit a phone screen:
   - sticky container height `h-[88svh]` on mobile → `h-svh` at `sm:`, with a small top offset (`top-14`) so the sticky card clears the fixed header instead of hiding under it.
   - card `minHeight` lowered on mobile (`clamp(400px, 66svh, 520px)` range) so the whole card, including CTA, is visible while it sticks.
   - tighter mobile padding (`px-4`) and reduced inner copy padding so the image + copy + specs + buttons all fit without the card scrolling internally.
3. **Mobile card composition:** image band becomes a shorter fixed-height top strip (about 150–170px) with the copy column below it, so the stacked card reads as one screen on a phone rather than being cut off.
4. **Keep the same swap motion** (opacity + scale fade-back per card driven by `useScroll`), just verified against a phone-height viewport so each card fully hands over to the next.

## Verification

Playwright at 360, 390 and 430px: scroll through the section capturing screenshots at each hand-over point, confirm each card sticks, fades and scales as the next climbs over it, no clipped CTA, and no horizontal overflow. Also confirm reduced-motion still gets the flat list.
