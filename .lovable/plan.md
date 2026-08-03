# Make the blog fully admin-driven

Everything on the blog — cover photo, title, date, author, tag, excerpt and the full article text — comes from the backend/admin panel. The current dummy posts stay as a fallback so the page never looks empty while the admin panel is still being built.

## What becomes dynamic

- **Post list** (`/blog`): featured banner + grid are built from the API feed. Tag, date, author name, excerpt and cover image all come from the post record.
- **Post detail** (`/blog/<slug>`): fetched by slug from the API; image, meta line, heading, excerpt, author and the full body text are all admin content. Read time is computed from the actual body.
- **Featured choice**: whichever post the admin marks featured becomes the banner; if none is marked, the newest post is used.
- **Images**: uploaded files may come back as full URLs or as server-relative paths (`/uploads/...`) — both are resolved against the API base so admin uploads show up without code changes.
- **Dates**: accepts ISO timestamps or plain strings from the admin panel and formats them consistently (e.g. "28 Jul 2026").
- **Body text**: accepts rich-text HTML, markdown-ish text, or a block array from the admin editor and renders it as headings, paragraphs and quotes.
- **Load more**: the button becomes real — it pages through the API and hides itself when there are no more posts. With the demo fallback it simply doesn't appear.

## States

- Loading: skeleton banner + card placeholders instead of an empty page.
- Backend asleep / unreachable: demo posts render, so the layout is always presentable.
- Empty admin feed: a short "No stories published yet" message.
- Unknown slug: existing not-found panel with a link back to the journal.

## Endpoints used (with graceful fallbacks)

- List: `GET /blog/posts` (aliases `/posts`, `/blogs`), optional `?page=&limit=`
- Detail: `GET /blog/posts/{slug}` (aliases `/blog/posts/{id}`, `/posts/{slug}`); if the detail endpoint is missing, the post is picked out of the cached list

Field names are matched loosely (`title|heading`, `excerpt|summary|description`, `image|cover|cover_image|thumbnail|images[0]`, `author|author_name|author.name`, `tag|category`, `published_at|created_at|date`, `body|content|html`, `featured|is_featured`) so the panel's exact naming doesn't need to match ours.

## Technical notes

- `src/lib/api/blog.ts`: extend the normaliser (absolute image resolution, richer date parsing, tag/author fallbacks), add `blogPostsPageQuery` with pagination support and `blogPostQuery(slug)` for the detail route, keep `DEMO_POSTS` as the fallback and `placeholder` flag so demo content is distinguishable.
- `src/routes/blog.index.tsx`: use the paged query, wire the Load more button, add loading/empty states.
- `src/routes/blog.$slug.tsx`: loader uses the slug-based fetch with list fallback; `head()` metadata continues to be driven by the fetched post.
- `src/components/blog/blog-card.tsx` / `blog-featured.tsx`: tolerate missing tag/date/author/excerpt without breaking layout.
- No visual redesign — same premium layout, just real data behind it.
