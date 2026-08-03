## Goal
Match the reference screenshot exactly. Remove everything I added beyond it.

## Changes to `/blog`

1. Delete the page header block entirely — no "Journal · Royal Wool" eyebrow, no "From the dye house" h1, no intro paragraph. The featured banner sits directly under the nav, with the same page side padding as the reference.
2. Featured banner (`blog-featured.tsx`):
   - Label is just `Featured` (small, light) — no tag/date line.
   - Title, then excerpt paragraph. No avatar, no author name, no "Read story" link.
   - Right-side circular arrow (→) vertically near the title, as in the reference.
3. `Recent blog posts` becomes the page's single `<h1>` (plain left-aligned heading, no rule, no story count) so the page keeps one H1 for SEO.
4. Cards (`blog-card.tsx`) match the reference order: image, title, excerpt, then one meta line `avatar  Author • Date`. Remove the tag/date line above the title, the arrow icon, and the divider above the meta row.
5. Button below the grid: dark pill labelled `Loading more...`, centred — replacing my outlined "Load more stories".
6. Keep 9 posts in a 3x3 grid so no button-state ambiguity: show all 9 at once, button present as in the reference.

## Unchanged
Data layer (`src/data/blog.ts`, `src/lib/api/blog.ts`) stays dynamic with the same fallback. Route metadata stays. No other page touched.
