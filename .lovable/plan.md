## Problem

On the live home page the hero panel is too tall and its content overruns the frame — the "See what's coming" button is cut off at the bottom edge, and the trust cards (Quality guarantee / Safe for babies / Pan-India delivery / Loved by crafters) get squeezed right up against the hero with no breathing room. The headline also sits on a scrim that's too weak where the yarn image is light, so the copy reads poorly.

## Fix (frontend only, `hero-slider.tsx` + `index.tsx`)

1. **Height + fit** — replace `clamp(420px, 62vh, 600px)` with a shorter, more controlled `clamp(380px, 52vh, 520px)`, and make the copy column scroll-safe: cap the headline at `text-3xl / sm:text-4xl / lg:text-5xl` so eyebrow + headline + subtitle + button always fit inside the frame with padding to spare. Reduce vertical rhythm (`mt-4/mt-5/mt-8` → `mt-3/mt-4/mt-6`).

2. **Readability** — strengthen the left-weighted scrim (opaque fleece to ~52% width, then fade), and add a subtle bottom fade so the dots/arrows and button never sit on busy image detail. Keep the image focal point at `object-[80%_center]` so the yarn stays visible on the right.

3. **Trust bar spacing** — give the trust section real top padding (`pt-10`) instead of butting against the hero, and let the cards breathe: consistent card height, tighter icon-to-title spacing, and `sm:grid-cols-2 lg:grid-cols-4` retained with a slightly larger gap so the two-line copy ("Consistent gauge, batch-matched dye lots") no longer looks cramped.

4. **Mobile** — on small screens the scrim becomes a full-width vertical gradient (top-to-bottom) instead of left-to-right, so the headline is legible over the whole image.

## Verification

Playwright screenshots of `/` at desktop (1280) and mobile (390) widths to confirm the button is fully visible, the headline is legible on all three slides, and the trust cards are not clipped.
