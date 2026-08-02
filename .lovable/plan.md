## Goal
Right now only "Yarn Weight" shows on the PDP because the backend supplies just that one field. Fill the rest with sensible demo values while keeping everything fully dynamic — real admin data always wins.

## Approach
1. In `src/lib/api/specs.ts`:
   - Add a `SPEC_FALLBACKS` map with per-spec placeholder values (Fibre / Blend: "100% Acrylic", Yarn Length: "~200 m per ball", Needle Size: "4.0 mm", Crochet Hook Size: "4.0 mm", Needle Stitch: "22 sts / 10 cm", Crochet Stitch: "18 sts / 10 cm", Ball Weight: "100 g").
   - Values are picked per product deterministically (hash of product id) from a small pool per spec, so different products show different-looking specs instead of all identical.
   - `productSpecs(product)` keeps reading real admin data first; only missing rows get a fallback, flagged `placeholder: true` on `SpecRow`.
   - Same treatment for `washCare()` — a default care line if the admin hasn't written one.

2. In `src/components/commerce/spec-tiles.tsx`: render placeholder rows identically (no visual change requested), so the grid looks complete.

3. Keep it switchable: a single exported `SPEC_PLACEHOLDERS = true` flag in `specs.ts` — flip to `false` once the backend is filled in, and every fallback disappears with no other edits.

## Technical notes
No API/schema changes, no backend work. All edits are in `src/lib/api/specs.ts` (plus a type field consumed by `spec-tiles.tsx`).
