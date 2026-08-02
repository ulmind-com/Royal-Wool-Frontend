## Customer Reviews section (Home, below the brand banner)

A fully dynamic, review-driven section — unique design, not a copy of the reference screenshot.

### Data (verified against the live backend)
The API today exposes:
- `GET /reviews?product_id=…` → per-product reviews (rating, title, text, `photos[]`, tags)
- `GET /reviews/summary?product_id=…` → `{ count, average, breakdown{1..5} }`
- `POST /upload/review-image` → customer photo uploads
- `GET /reviews/admin/all` → all reviews, but admin-token only

There is **no public site-wide review feed**, and `/reviews/summary` currently returns `count: 0` for the products I checked, so the homepage feed will be built against a single query layer that:
1. First tries `GET /reviews/highlights?limit=24` (the site-wide endpoint you'd add later in the backend — no frontend change needed once it exists).
2. If that 404s, falls back to fetching reviews for the first ~8 catalogue products in parallel and merging them, tagging each review with its product (title, image, price) so cards can show *which product* the review is for.
3. If there are still zero reviews, the whole section hides itself (no empty shelf) — nothing hardcoded, nothing fake.

Aggregate rating + total count + the 5→1 star breakdown come from the merged summaries.

### Design (premium, distinct)
- Header row: large display heading, a big aggregate score with a marigold star row, review count, and a "Verified buyers" pill. To the right, a slim horizontal rating-breakdown bar chart (5★ … 1★) that animates its widths in on scroll.
- Filter chips: `All · With photos · 5★ · 4★ · 3★ and below` — client-side filtering, no reload.
- **Masonry / CSS-columns layout** so each card's height is set purely by its own comment length — short "Really good" cards stay compact, long reviews grow tall, no stretched blank space and no clipped text.
- Card anatomy: liquid-glass panel, star row on top, reviewer name + verified check, optional bold review title, then the comment (no truncation), any uploaded photos as small rounded thumbnails, product chip at the bottom (thumbnail + product name, links to the PDP), and relative date ("3 weeks ago").
- Photo reviews get a slightly larger visual weight; clicking a thumbnail opens a lightweight lightbox with arrow/esc navigation.
- Motion: staggered fade-and-rise on enter, subtle lift + border glow on hover, all respecting `prefers-reduced-motion`.

### Show 6, then See more
- Renders 6 reviews initially; a centered "See more reviews" pill reveals the next 6 per click with the new cards animating in, and shows the remaining count ("See 12 more"). Collapses back to 6 with "Show less" once fully expanded.

### Technical notes
- New `reviewHighlightsQuery` in `src/lib/api/queries.ts` + `Review` type in `src/lib/api/types.ts` (rating, name, title, text, photos, tags, created_at, product ref).
- New components: `src/components/commerce/customer-reviews.tsx` (section + header + chips + masonry), `review-card.tsx`, `rating-stars.tsx`, `review-lightbox.tsx`.
- Loading state: skeleton cards in the same masonry rhythm; error state uses the existing `DataError`.
- Wired into `src/routes/index.tsx` after `<BrandBanner />`; only presentation/data-read code, no backend changes.
