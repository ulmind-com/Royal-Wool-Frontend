# Blog detail pages

Each blog post gets its own page at `/blog/<slug>`, opened from a "See more" link on the cards and the featured banner.

## New route: `/blog/$slug`

Layout, top to bottom:

1. Back link ("← All stories") and a small meta line: tag · date · read time.
2. Large `<h1>` title, then the excerpt as a lead paragraph, then author row (initials avatar + name).
3. Full-width hero image of the post, rounded, same card/border treatment as the featured banner.
4. Article body: long-form paragraphs with section subheadings, a pull-quote, and a closing note — premium editorial typography (display headings, generous line-height, comfortable measure).
5. Footer of the article: share on WhatsApp button, then a "More from the journal" strip with 3 other posts using the existing card component.

Motion: soft fade/rise on the hero and body blocks, respecting reduced-motion like the rest of the site.

## Blog list changes

- Each card gets a "See more →" link at the bottom, and the whole card links to its detail page.
- The featured banner's arrow becomes a real link to its post.

## Data

- Extend the post shape with an optional long-form `body` (array of blocks: heading, paragraph, quote). Demo posts get real written content per post so every page reads like a finished article; the API normaliser maps admin `content`/`body`/`html` fields into the same shape, so nothing changes in components once the backend sends it.
- Unknown slug → not-found state on the route with a link back to `/blog`.

## SEO

Per-post `head()`: title, description from excerpt, `og:title`, `og:description`, `og:image` (absolute CDN image URL), `og:type: article`, `twitter:card`, canonical URL, plus Article JSON-LD.

## Technical notes

- New file `src/routes/blog.$slug.tsx` with `createFileRoute("/blog/$slug")`; existing `src/routes/blog.tsx` stays the list page (no layout conversion needed since routes are flat-file).
- New `src/components/blog/blog-article.tsx` renders the body blocks; `src/data/blog.ts` and `src/lib/api/blog.ts` gain the body field plus a `postBySlugQuery` helper reusing the cached feed.
