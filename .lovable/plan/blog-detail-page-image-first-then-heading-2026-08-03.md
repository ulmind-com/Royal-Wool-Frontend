# Blog detail page: image first, then heading

Reorder the post page so the hero image sits at the top, above the title block.

## New order on `/blog/<slug>`

1. Back link ("← All stories")
2. Hero image — full-width, rounded card treatment, straight under the back link
3. Meta line: tag · date · read time
4. `<h1>` title
5. Excerpt as lead paragraph
6. Author row (initials avatar + name)
7. Full article body (long-form paragraphs, subheadings, pull-quote)
8. WhatsApp share + "More from the journal"

## Motion

Image animates in first (fade/rise), then the title block with a small stagger delay, keeping the reduced-motion behaviour unchanged.

## Technical notes

Single-file change in `src/routes/blog.$slug.tsx`: move the `motion.figure` hero above `motion.header`, swap their animation delays, and adjust top/bottom spacing so the image reads as the page opener. No data, SEO, or component changes.
