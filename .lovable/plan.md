# Mobile bottom nav: true clear liquid glass (reference match)

Match the uploaded mockup exactly: a single clear glass capsule with almost no white fill, a thick bright glass rim that visibly refracts the background, solid white icons with white labels, and a soft smoked-glass active tile.

## What changes

Only `src/components/layout/mobile-bottom-nav.tsx` (styling layers, no logic/route changes).

1. **Capsule material — clear, not frosted-white**
   - Drop the white gradient fill to ~4-6% opacity so the page content behind is clearly readable through it.
   - Blur stays moderate (18-20px) with a slight saturation and brightness lift, so it looks like glass, not milk.

2. **Thick refracting rim (the signature of the reference)**
   - Two stacked rings instead of one 1px border: an outer bright hairline (~white 70%) and an inner ring with its own blur and a bright top-left / bottom-right arc, giving the "glass wall thickness" seen at the capsule ends.
   - Corner radius stays a full pill.

3. **Icons and labels**
   - Solid filled white icons (not outlines) with a subtle dark ambient shadow so they stay legible over both light yarn photos and dark areas.
   - Labels in white, small, semibold, tight tracking — same rhythm as the mockup.

4. **Active tile**
   - Replace the raised bright blob with a smoked-glass rounded-square tile (dark tint ~14%, inner top highlight, no glow) that sits inside the capsule like the reference "Home" tile.
   - Keep the existing spring/liquid settle motion so tab switches still feel fluid.

5. **Search button**
   - Same clear-glass recipe applied to the circular search button so both pieces read as one material.

## Notes

- Legibility over light backgrounds is the main risk with near-clear glass; handled with white icons + soft dark drop shadow rather than by re-adding a white slab.
- No changes to nav items, routing, cart badge, or auth avatar behaviour.
