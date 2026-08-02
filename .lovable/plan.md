# Assurance band under the spec sheet (PDP)

Add a 2×2 "trust" band below the spec sheet on `/product/$id` — icon on top, bold title, short supporting line — in the same hand-drawn ink style as the spec icons, not a copy of the reference screenshot.

## Content (dummy now, dynamic later)
Default set, admin-overridable:
- Secure Checkout — "Safe, fast & encrypted"
- Pan India Delivery — "Fast, reliable shipping across India"
- Safe for Babies — "OEKO-TEX® Standard 100 Class 1 certified"
- Quality Guarantee — "High quality yarns since 1954"

## Files
1. `src/assets/assurance/*.png` — 4 generated transparent ink illustrations (shield-lock, delivery van with motion lines, baby-safe seal, hand holding a quality rosette), registered as CDN asset pointers.
2. `src/lib/api/assurance.ts` — reader + fallback layer mirroring `specs.ts`: reads `product.assurances` / `settings.assurances` (id, title, note) tolerantly, falls back to the four defaults behind an `ASSURANCE_PLACEHOLDERS` flag. Unknown ids simply don't render.
3. `src/components/commerce/assurance-band.tsx` — 2-col (1-col on small phones) grid, centered icon medallion, `font-display` title, muted note, hairline top divider, subtle marigold hover lift; all semantic tokens.
4. `src/routes/product.$id.tsx` — render `<AssuranceBand />` directly under `<SpecTiles />` in the right column.

## Technical notes
- Frontend/presentation only; no backend changes. Values come from the existing product/settings payload when present, so your admin panel can drive them later by adding an `assurances` array.
- Icons are project assets via `lovable-assets`, imported as `.asset.json` pointers like the spec art.
