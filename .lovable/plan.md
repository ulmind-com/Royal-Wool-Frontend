Rebuild `/product/$id` as a premium, fully dynamic product page modelled on the reference screenshots (left gallery + thumbnail rail, right shade grid + specs), in Royal Wool's own design language.

## Layout (desktop)

```text
┌──────┬────────────────────┬──────────────────────────┐
│ thumb│    main image      │  brand · title           │
│ rail │   (sticky, zoom)   │  ₹ price  MRP  -%  taxes │
│ 80px │                    │  Shade  CODE - Name      │
│      │                    │  [ 9-col shade grid ]    │
│      │                    │  weight / pack chips     │
│      │                    │  qty stepper             │
│      │                    │  [ Add to cart ][Buy now]│
│      │                    │  spec tiles (2-col)      │
│      │                    │  trust icons (2x2)       │
│      │                    │  accordions + note       │
└──────┴────────────────────┴──────────────────────────┘
```
Mobile: swipeable image carousel with dot/count badge, then the same right-column stack; Add to cart / Buy Now become a sticky bottom bar with price.

## Shade selector built for 63+ variants
- Grid of round swatch tiles rendered from `product.colors` (uses `images[0]` when present, else `hex`), `grid-cols-6 sm:grid-cols-8 lg:grid-cols-9`, gap-2.
- Selected shade: marigold ring + subtle lift. Out-of-stock: dimmed with a diagonal slash.
- Shows first 27 shades with a "Show all N shades" expander so tall grids don't push the CTA below the fold; a small search/filter input appears when the count exceeds ~30.
- Label line above the grid mirrors the reference: `Shade  <code> - <name>`, code derived from the colour name/sku field when the admin supplies one.
- Selecting a shade swaps the gallery to that colour's images, resets size and quantity clamps, and re-reads price/stock from the server-resolved variant matrix (existing `variantPrice` / `variantStock` helpers — no client-side price math).

## Actions
- Quantity stepper clamped to variant stock.
- `Add to cart` (primary madder, full-width) and `Buy Now` (outlined/glass) side by side. Cart wiring isn't in place yet, so both stay presentational with disabled state on sold-out shades; Buy Now is structured to call checkout once the commerce phase lands.
- Keeps the existing "Ask on WhatsApp" as a tertiary text link.

## Spec tiles + trust icons (dynamic)
- New `src/components/commerce/spec-tiles.tsx`: soft-tinted glass rows with icon + label + value for Fibre/Blend, Yarn Weight, Yarn Length, Needle Size, Crochet Hook, Needle Stitch, Crochet Stitch, Ball Weight.
- Values read from admin-managed product fields (`specs` / `attributes` / `meta` object, whichever the backend sends) via a tolerant reader in `src/lib/api/specs.ts`; any spec absent is simply not rendered, so nothing is hardcoded per product.
- New `src/components/commerce/spec-icons.tsx`: hand-drawn-feel inline SVG icons (yarn ball, weight gauge, tape measure, knitting needles, crochet hook, stitch swatch, scale, shield, truck, badge). Inline SVG rather than raster generation keeps them crisp, themeable via `currentColor`, and zero extra network weight.
- Trust block: Secure Checkout / Pan India Delivery / Safe for Babies / Quality Guarantee — 2x2 icon-over-label, borderless, matching the homepage trust band.

## Supporting sections
- Accordions: "Name & Address of Manufacturer" (from settings shop address) and "Wash Care" (from product field, with a sensible default), plus the colour-variance NOTE line.
- Description block with `whitespace-pre-line`.
- Reviews for this product via the existing normalised review layer, first 4 with "See all".
- "You May Also Like" rail: `productsQuery` on the same `category_id`, current product excluded, reusing `ProductCard`.
- Breadcrumb, real `head()` meta from the loaded product, and JSON-LD `Product` schema with price/availability/rating.

## Technical notes
- Files: rewrite `src/routes/product.$id.tsx`; add `src/components/commerce/shade-grid.tsx`, `spec-tiles.tsx`, `spec-icons.tsx`, `product-gallery.tsx`, `src/lib/api/specs.ts`.
- No backend/business-logic changes: every value comes from the existing REST payload, so admin-panel edits flow straight through.
- Existing uploaded yarn assets (`src/assets/yarn/*`) are used only as gallery fallbacks when a product/colour has no image.
- Skeleton and error states preserved; mobile verified at 360–430px for zero horizontal overflow.
