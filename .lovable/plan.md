## Goal

Remove the current "Shop by fibre" tiles from the home page and build a new, premium **Shop by Category** section: image tile on top, category name below, click opens that category's own page. Fully driven by the admin panel — it renders however many categories exist (4 shown now), no hardcoded list.

## What gets built

**New component `src/components/commerce/category-showcase.tsx`**
- Reads top-level categories from `GET /categories/tree` (existing `categoryTreeQuery`), sorted by the admin `order` field, `parent_id === null` only.
- Each tile: square/portrait image area using `category.image` (admin-uploaded, honours `image_scale`), name centered underneath in the display font, plus a small item-count/"Explore" line.
- Premium treatment: soft fleece surface with hairline border, dye-glow radial behind the yarn ball, gentle scale + lift on hover, marigold underline sweep on the name, staggered fade-up on scroll-in (Framer Motion, respects reduced motion).
- Grid: 2 cols mobile, 4 cols desktop, auto-flowing so 3, 5, 6+ categories still look balanced.
- Loading skeletons, error state and empty state via existing `data-state` components.
- Each tile is a `<Link to="/collections/$slug" params={{ slug }}>` — the existing category page already lists that category's products with subcategory chips, so clicking works for every category with no extra routes.

**Fallback visuals** — if a category has no image yet in the admin panel, the tile shows a tinted yarn-ball placeholder. The four uploaded yarn photos get registered as CDN assets and used as ordered fallbacks so the section looks finished today; the moment the admin sets a category image, that image wins.

**Home page (`src/routes/index.tsx`)**
- Delete the `<CategoryTiles />` usage and the old "02 · Shop by fibre" section; drop `src/components/commerce/category-tiles.tsx`.
- Insert `<CategoryShowcase />` in its place, heading "Shop by Category" with a short supporting line and a "View all collections" link.

## Technical notes

- No backend changes: uses `categoryTreeQuery` (`/categories/tree`) which already returns `id, name, slug, image, order, image_scale, children`.
- Styling stays on semantic tokens (`foreground`, `muted-foreground`, `border`, `marigold`, `--dye-flow`) — no hardcoded colors.
- Images lazy-loaded with `alt` = category name; section uses `<h2>` + `<ul>/<li>` semantics.
