## Problem

The slide progress dots sit at `bottom-6 left-6/sm:left-10/lg:left-16` — exactly under the "Shop all yarns" button. The copy column's `pb-12` isn't enough, so the dashes collide with the CTA and look cramped/squashed.

## Fix (frontend only, `src/components/commerce/hero-slider.tsx`)

1. **Move the dots next to the arrows** — group the progress dots and the prev/next arrows into a single bottom-right control cluster (`absolute bottom-5 right-5 sm:bottom-6 sm:right-6`, dots then arrows with a divider gap). This removes the overlap with the CTA entirely and reads as one deliberate control unit.
2. **Give the copy column room back** — reduce the now-unneeded bottom offset (`pb-12` → `pb-8`) so the headline block sits vertically centred instead of pushed up.
3. **Polish the dots** — slightly taller track (`h-1.5`), rounded, with the active one filling as a timer; keep the same aria labels and `aria-current` behaviour.
4. **Mobile** — on small screens the cluster stays bottom-right; dots shrink (active 40px / inactive 16px) so the row never wraps at 390px width.

No data, motion timing, or admin-driven content changes.

## Verification

Playwright screenshots of `/` at 1280px and 390px widths confirming no overlap between the CTA and the dots, and that the arrows + dots row fits inside the frame.