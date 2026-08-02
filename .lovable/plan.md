## Goal
Align the product detail page with the reference screenshot: make the product title smaller and move the quantity/subtotal/add-to-cart/buy-now action block **below the main product image** instead of inside the right info column.

## Current state
- `src/routes/product.$id.tsx` renders a two-column layout: left = sticky `ProductGallery`, right = title → price → shade grid → size chips → **qty/subtotal/buttons/shipping/WhatsApp** → specs → trust → accordions.
- Title is currently `text-2xl sm:text-3xl lg:text-4xl`.
- Mobile uses a separate sticky bottom action bar.

## Changes

### 1. Smaller product title
In `src/routes/product.$id.tsx`:
- Reduce title from `text-2xl sm:text-3xl lg:text-4xl` to `text-xl sm:text-2xl lg:text-3xl`.
- Keep `font-display`, `font-light`, `tracking-[-0.02em]`, and `max-w-[22ch]` so it stays elegant but not oversized.

### 2. Move action block below the gallery
- Extract the existing Glass-wrapped quantity/subtotal/buttons/shipping/WhatsApp block into a local `ProductActions` component so it can be rendered in two places without duplication.
- Render the full action block **immediately after `<ProductGallery />`** inside the left/sticky column on `lg:` breakpoints.
- Keep the existing mobile sticky bottom bar unchanged for narrow screens so checkout remains one-tap accessible.
- Remove the duplicate action block from the right column (the one currently sitting between size chips and spec tiles).

### 3. Preserve behavior
- Quantity clamped to variant stock.
- Subtotal = `price * qty`.
- Sold-out disabled state.
- WhatsApp link uses `waAskAboutProduct(product.title, shareUrl)`.
- All data still comes from the API; no backend changes.

### 4. Responsive/layout checks
- Left column remains sticky and self-starting; action block sits under the gallery within that sticky container.
- Right column now flows: title → price → shade grid → size chips → stock note → specs → trust → description → accordions.
- Mobile layout collapses to single column with the sticky bottom bar; no horizontal overflow.

## Files touched
- `src/routes/product.$id.tsx` — title sizing, action block extraction/repositioning.

## Out of scope
- No changes to `ProductGallery`, `ShadeGrid`, `SpecTiles`, review/related sections, or backend.
- No new routes or dependencies.