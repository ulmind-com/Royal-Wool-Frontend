## Goal

Make the Shop page (`/collections`) easier to scan: a smaller, centered page heading, and all filters moved into a left sidebar so products can be narrowed without scrolling past big blocks.

## 1. Heading — smaller and centered

In `src/routes/collections.index.tsx`:
- Center the header block (eyebrow "Shop", title, subtitle) on desktop and mobile.
- Drop the title from `text-4xl / sm:text-6xl` down to roughly `text-3xl / sm:text-4xl` with tighter tracking, so it reads as a page title, not a hero.
- Keep the dynamic title behaviour (brand name when a brand is selected, otherwise "Every yarn we wind") and the one-line subtitle underneath.

## 2. Two-column shop layout with a left filter rail

Restructure the page body into a grid: `lg:grid-cols-[260px_minmax(0,1fr)]`.

Left column (sticky, `lg:sticky lg:top-20`, own scroll if tall):
- Brand selector — the existing `BrandRail` cards restacked into a compact vertical list that fits a 260px rail (image + name + count, one per row).
- Category filter — vertical list of chips/rows instead of a horizontal scroll strip.
- Yarn weight filter — vertical list with the number badge kept.
- "Clear all filters" link at the top of the rail when any filter is active.

Right column:
- Result count + sort select on one row.
- The product grid (`3` columns at `lg`, `4` at `xl`) since the sidebar now takes width.

Mobile (`< lg`):
- Sidebar becomes a collapsible "Filters" panel opened by a full-width button showing the active filter count, so the product grid stays near the top. Filter content is the same component, just rendered inside the panel.

## 3. Behaviour kept as-is

- Filters stay URL-driven (`?brand=&category=&weight=&sort=`), still fully dynamic from the API: brands from the product feed, categories from `/categories/tree`, weights derived from product text — no hardcoding, so admin-panel additions appear automatically.

## Technical notes

- `src/routes/collections.index.tsx` — layout restructure, heading styles, mobile filter toggle state.
- `src/components/commerce/brand-rail.tsx` — add a compact vertical variant for the sidebar.
- `src/components/commerce/shop-filters.tsx` — switch rows to a vertical stacked layout suitable for a narrow rail.
- No data/API or filtering-logic changes; `src/lib/api/brands.ts` untouched.
