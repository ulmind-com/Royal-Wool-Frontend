## Goal

Rebuild the Shop page (`/collections`) as a premium, liquid-glass storefront with two brand sections — Heartbeats Premium Yarns and Ganga Acrowools Knitting Yarn — that stay fully dynamic, so any brand added later from the admin panel appears automatically. Clicking a brand filters the catalogue to that brand's categories and yarn weights and shows its products.

## What the user sees

1. **Shop hero** — slim heading + short line, no long banner.
2. **Brand rail** — one glass card per brand (compact, not tall): brand name, product count, a yarn image, and a subtle dye-flow sheen on hover. Selecting a card enters brand mode; a "All brands" chip clears it.
3. **Filter bar** — category chips and yarn-weight chips (1 Super Fine … 7 Jumbo). In brand mode only the categories and weights that actually exist for that brand are shown; the rest are hidden, not greyed.
4. **Product grid** — existing `ProductGrid` cards, 2-up on mobile, 4-up desktop, with count + sort and an empty state per filter combination.
5. Uploaded yarn photos already in the project (`src/assets/yarn/*`) are used as brand-card and fallback product imagery, never as fixed product data.

The reference screenshots are treated as reference only; layout stays our own (horizontal chip filters instead of a left sidebar, glass cards, marigold accents).

## Dynamic behaviour

- Brands are derived from the live product feed's `brand` field, so admin-added brands show up with no code change.
- The two named brands are seeded only as display metadata (label + blurb + fallback image) so they render nicely before the backend is renamed; if the API returns other brands they render with the same treatment.
- Categories come from `/categories/tree`; yarn weights come from the existing weight list, matched against product titles/descriptions until the backend exposes a weight field.
- URL search params keep `brand`, `category`, `weight`, and `sort` so filtered views are shareable and back/forward works.

## Technical notes

- Rewrite `src/routes/collections.index.tsx`: `validateSearch` with `zodValidator` + `fallback` for `brand`/`category`/`weight`/`sort`; read with `Route.useSearch()`, write with `useNavigate`.
- New `src/components/commerce/brand-rail.tsx` (glass brand cards) and `src/components/commerce/shop-filters.tsx` (category + weight chip rows).
- New `src/data/brands.ts` holding display metadata keyed by normalized brand name, plus a `brandDisplay()` fallback for unknown brands.
- New helpers in `src/lib/api/brands.ts`: group products by brand, derive available categories/weights for a brand, and match yarn weight from text.
- Data flow stays `useQuery(productsQuery({ limit: 96 }))` + `categoryTreeQuery`; brand/weight filtering is client-side over that result (the API has no brand param yet), category filtering uses `category_id` when a category is picked.
- Reuse `GridSkeleton`, `DataError`, `EmptyState`; no new dependencies.
- Update the route `head()` so titles/descriptions reflect the selected brand.
