## Goal
Make the product page look like the reference storefront layout, and make the qty / Subtotal / Add to cart / Buy Now block exactly as wide as the product image — not wider.

## Current state
- `src/routes/product.$id.tsx` places `ProductActions` as a sibling *below* the whole gallery grid, so it spans the thumbnail rail + image and looks wider than the image.
- `ProductGallery` uses a `md:grid-cols-[76px_1fr]` layout with a bordered, gradient-filled image frame capped at 380px.

## Changes

### 1. Constrain the action block to the image column
In `src/routes/product.$id.tsx`:
- Wrap the gallery + actions in one grid that shares the gallery's `[76px_minmax(0,1fr)]` columns, and place `ProductActions` in the second column only (on `md+`), so its left edge aligns with the image and its width matches the image exactly.
- Simplest implementation: add an optional `footer` slot to `ProductGallery` rendered inside the image column `<div>`, and pass `ProductActions` into it. Keeps mobile behaviour untouched (mobile still uses the sticky bottom bar).
- Cap it further with `max-w-[380px]` so it can never exceed the image frame width.

### 2. Reference-style polish (visual only)
- Gallery main frame: drop the dye gradient fill and heavy `rounded-3xl` border for a clean light surface with a subtle hairline and `object-contain` so the skein sits on a plain backdrop like the reference.
- Thumbnail rail: square-ish thumbs with thin border, active thumb gets a marigold ring — closer to the reference rail.
- Right column: keep title → price row with the "Incl. of all taxes" pill → hairline divider → `Shade CODE - Name` label → shade grid → weight/pack, matching the reference reading order (already close; add the divider and tighten spacing).

### 3. Keep the action block compact
- Quantity stepper stays `h-9`, buttons `min-h-10`, `Add to cart` / `Buy Now` remain a 2-up grid inside the constrained width so nothing looks oversized.
- All behaviour unchanged: stock clamping, sold-out disabling, subtotal math, WhatsApp link.

### 4. Verify
- Screenshot at the current 811×722 viewport and a wider desktop width to confirm the action block width equals the image width and stays visible without scrolling.

## Files touched
- `src/components/commerce/product-gallery.tsx`
- `src/routes/product.$id.tsx`

## Out of scope
- Cart/checkout wiring, backend/API changes, mobile sticky bar, reviews and related products.
