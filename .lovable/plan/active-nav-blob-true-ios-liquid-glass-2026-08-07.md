# Active Nav Blob — True iOS Liquid Glass

The shape that slides between Home and Shop in the mobile bottom nav is currently a near-solid white droplet, so it looks like a painted blob rather than a piece of glass sitting on glass. Make it behave like the iOS/iPhone tab-bar highlight.

## What changes

Only the active indicator inside `src/components/layout/mobile-bottom-nav.tsx`:

- Drop the fill from near-opaque white to a light translucent lens, so the pill and the page content behind it stay visible through the blob.
- Add its own blur + high saturation so colour behind it stays vivid, like iOS glass-on-glass.
- Thin bright hairline rim, brighter on the top edge and fading toward the bottom, with a soft inner top highlight — that top-lit edge is what reads as thickness.
- Replace the heavy white outer glow with a small, tight ambient shadow so the blob lifts off the bar without haloing.
- Keep the liquid motion but make it settle more like iOS: slightly softer spring and a shorter stretch-and-settle, so the travel between Home and Shop feels like a drop of liquid moving, not a bouncing box.
- Nudge active icon/label contrast just enough to stay legible now that the blob is see-through.

## Out of scope

No changes to nav items, order, labels, routes, cart badge, sizing, the outer pill material, the separate search circle, or anything above the nav.

## Technical notes

Single file: `src/components/layout/mobile-bottom-nav.tsx` — edit `LIQUID_GLASS_BLOB` and the indicator's `transition`.

- Fill: `linear-gradient(180deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.34) 100%)`.
- `backdropFilter: "blur(18px) saturate(200%)"`, written once only (no hand-written `-webkit-` twin — the production CSS build drops the standard property when both are present).
- Border `1px solid rgba(255,255,255,0.6)`; shadow `inset 0 1px 0 rgba(255,255,255,0.85), 0 4px 12px -6px rgba(15,12,20,0.18)`.
- Spring `stiffness 320 / damping 30 / mass 0.85`; scale keyframes tightened to roughly `scaleX [1.08, 0.99, 1]`, `scaleY [0.94, 1.01, 1]` over ~0.38s.
- Verify with a Playwright pass at 375px width: capture the nav on `/` and after tapping Shop, with colourful yarn imagery behind the blob, confirming content shows through it.
