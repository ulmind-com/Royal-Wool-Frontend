## Goal
Resize the product detail page so the main image is smaller (but not tiny) and the quantity/subtotal/Add to cart/Buy Now block is visible immediately below the gallery without scrolling.

## Current state
- `src/routes/product.$id.tsx` renders the gallery + `ProductActions` in a sticky left column.
- `ProductGallery` uses a full-width `aspect-square` desktop frame, so the image consumes most of the viewport height and pushes the action block below the fold.
- The action block itself has generous padding and large buttons, adding to the vertical footprint.

## Changes

### 1. Cap the desktop gallery height
In `src/components/commerce/product-gallery.tsx`:
- Add a `max-h-[420px]` (or equivalent) cap to the desktop main image frame so the image stops growing on tall viewports.
- Keep the frame centered and maintain `aspect-square` fallback for smaller widths.
- Sync the vertical thumbnail rail `max-h` to the same cap so the rail does not extend past the image.
- Leave mobile swipe carousel unchanged.

### 2. Compact the action block
In `src/routes/product.$id.tsx`:
- Reduce `ProductActions` internal spacing: smaller quantity stepper (h-9/w-9), tighter gaps, shorter buttons (`min-h-10`), and `p-3 sm:p-4` on the Glass card.
- Keep all behavior: quantity clamping to stock, sold-out disabled state, subtotal math, WhatsApp link.

### 3. Bring the whole left column higher
In `src/routes/product.$id.tsx`:
- Lower the sticky offset from `lg:top-20` to `lg:top-14`.
- Tighten the gap between the gallery and the action block to `mt-4`.
- This keeps gallery + actions within a typical laptop/tablet viewport.

### 4. Verify visually
- Check the preview at the current viewport (~944 × 722) to confirm:
  - The product image is clearly visible but no longer dominates the screen.
  - The full action block (qty, Subtotal, Add to cart, Buy Now, Ships Pan India, Ask on WhatsApp) sits directly under the image without scrolling.
  - No horizontal overflow or broken sticky behavior.

## Files touched
- `src/components/commerce/product-gallery.tsx` — cap desktop frame/rail height.
- `src/routes/product.$id.tsx` — compact action block and sticky offset.

## Out of scope
- No backend/API changes.
- No mobile sticky bottom bar changes.
- No shade grid, spec tiles, reviews, or related-products changes.