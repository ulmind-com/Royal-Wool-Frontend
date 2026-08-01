## Goal

"Shop by Yarn Weight" tiles become data-driven from the backend (admin-controlled), each tile opens that group's own product listing page, and the tiles get shorter/more compact.

## What changes

### 1. Dynamic source (admin controlled)
The section currently reads a hardcoded array (`src/data/yarn-weights.ts`). New behaviour:

- Fetch `/categories/tree` (existing `categoryTreeQuery`, already cached).
- Look for a parent node whose name/slug matches "yarn weight" / "weight" (case-insensitive); use its children as the tiles. If no such parent exists, fall back to a top-level group match, then to the built-in 1–7 list so the page never looks broken.
- Each tile pulls name, image, product/child count, and order straight from the API — so once you add or rename weight categories in the admin panel, the section updates with no code change.
- Tile order follows the API order (or `sort_order` if present); numbering badge is derived from position, so 5 or 9 categories work as well as 7.
- Spec line ("Hook 5 mm" etc.) comes from the category's description/blurb when the admin has set one, otherwise from the local weight table by matching name.
- Loading = compact skeleton tiles; error = existing `DataError`; empty = section hides itself rather than showing an empty rail.

### 2. Real category pages on click
- API-backed tiles link to `/collections/$slug` (the existing category listing route), so clicking opens exactly that category's products.
- Only the fallback tiles keep the `/search?q=...` link, since they have no real slug yet.

### 3. Shorter cards
- Reduce padding (`p-5` → `p-4`), remove the fixed `min-h-[2.75rem]` note block, shrink the strand graphic (`h-12` → `h-8`), tighten gaps, and cap the note to one line with ellipsis.
- Net result: noticeably lower tiles with the same width, still aligned in a row, liquid-glass look and hover bloom unchanged.

## Technical notes

- New `src/components/commerce/yarn-weight-rail.tsx` internals: `useQuery(categoryTreeQuery)` + a `toWeightTiles(tree)` mapper; keeps `YARN_WEIGHTS` only as fallback/spec lookup.
- No backend or business-logic changes; purely storefront wiring against endpoints that already exist.
- Verified with Playwright afterwards (tile heights, click through to a category page, no console errors).
