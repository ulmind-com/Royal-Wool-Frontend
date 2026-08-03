## Goal
Rebuild `/blog` to match the reference screenshot layout, in Royal Wool's day-house style (no dark hero, no Untitled UI colours).

## Layout (top to bottom)
1. **Featured post banner** — full-width rounded image card, ~420px tall, with a dark gradient veil, "Featured" eyebrow, large 2-line headline, 3-line excerpt, and a circular arrow button at the right. Clickable as a whole.
2. **"Recent blog posts"** — heading, then a 3-column grid (2-col tablet, 1-col mobile) of 9 cards: 16:10 rounded image, title, 2-line summary, author avatar + name + date.
3. **Load more** — pill button centered under the grid; loads the next batch (currently a no-op past the dummy set, disabled once all posts are shown).

## Data (dynamic-ready)
- New `src/data/blog.ts` with 10 dummy yarn/craft posts (1 featured + 9 grid): slug, title, excerpt, image, author name + avatar, date, tag.
- New `src/lib/api/blog.ts` with a tolerant normalizer + `blogPostsQuery` hitting `/blog/posts`; when the endpoint is missing or empty it falls back to the dummy set. Same pattern as `src/lib/api/reviews.ts`, so the admin panel can take over later with no component changes.

## Images
Generate 10 editorial photos (skeins, dye pots, hands crocheting, colour swatches) and register them as CDN assets under `src/assets/blog/`.

## Files
- new: `src/components/blog/blog-featured.tsx`, `src/components/blog/blog-card.tsx`, `src/components/blog/blog-grid.tsx`
- new: `src/data/blog.ts`, `src/lib/api/blog.ts`, `src/assets/blog/*.asset.json`
- edit: `src/routes/blog.tsx` (drop the PageShell placeholder, compose the new sections, keep/extend head metadata)

## Not changing
Post detail pages (`/blog/$slug`) are out of scope unless you want them — cards will link to `/blog` for now. Every other route stays untouched.
