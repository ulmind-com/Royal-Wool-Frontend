import { queryOptions } from "@tanstack/react-query";

import { DEMO_POSTS, type BlogBlock, type BlogPost } from "@/data/blog";
import { apiFetch } from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/site";

/**
 * Blog feed.
 *
 * Every field on the blog — cover image, title, date, author, tag, excerpt and
 * the long-form body — is read from the admin backend. Endpoint names and field
 * names are matched loosely so the panel's exact naming doesn't have to match
 * ours, and the demo set is used as a fallback while the endpoint is missing or
 * the free-tier backend is still waking up.
 */

const MINUTE = 60_000;

export const BLOG_PAGE_SIZE = 9;

const LIST_PATHS = ["/blog/posts", "/blog", "/posts", "/blogs"] as const;

interface RawPost {
  id?: string;
  _id?: string;
  slug?: string;
  title?: string;
  heading?: string;
  name?: string;
  excerpt?: string;
  summary?: string;
  description?: string;
  short_description?: string;
  image?: string;
  cover?: string;
  cover_image?: string;
  featured_image?: string;
  thumbnail?: string;
  images?: string[];
  author?: string | { name?: string; full_name?: string };
  author_name?: string;
  tag?: string;
  tags?: string[];
  category?: string;
  created_at?: string;
  published_at?: string;
  publishedAt?: string;
  date?: string;
  featured?: boolean;
  is_featured?: boolean;
  link?: string;
  url?: string;
  link_label?: string;
  body?: unknown;
  content?: unknown;
  html?: unknown;
  description_html?: unknown;
}

/** Accepts admin block arrays, markdown-ish text or HTML and returns blocks. */
function parseBody(value: unknown): BlogBlock[] | null {
  if (Array.isArray(value)) {
    const blocks = value
      .map((item): BlogBlock | null => {
        if (typeof item === "string") {
          const t = item.trim();
          return t ? { type: "p", text: t } : null;
        }
        if (item && typeof item === "object") {
          const raw = item as {
            type?: unknown;
            text?: unknown;
            content?: unknown;
            url?: unknown;
            href?: unknown;
          };
          const kind = text(raw.type);
          const href = text(raw.url) ?? text(raw.href);
          const t = text(raw.text) ?? text(raw.content);
          if (kind === "link" && href) return { type: "link", text: t ?? href, url: href };
          if (!t) return null;
          if (kind === "h2" || kind === "heading" || kind === "h3") return { type: "h2", text: t };
          if (kind === "quote" || kind === "blockquote") return { type: "quote", text: t };
          return { type: "p", text: t };
        }
        return null;
      })
      .filter((b): b is BlogBlock => b !== null);
    return blocks.length ? blocks : null;
  }

  const raw = text(value);
  if (!raw) return null;

  const blocks: BlogBlock[] = [];
  for (const chunk of raw.split(/<\/(?:p|h2|h3|blockquote)>|\n{2,}/)) {
    const heading = /<h[23][^>]*>/i.test(chunk);
    const quote = /<blockquote[^>]*>/i.test(chunk);
    const plain = chunk
      .replace(/<[^>]+>/g, " ")
      .replace(/^#{1,4}\s*/, (m) => m && "")
      .replace(/\s+/g, " ")
      .trim();
    if (!plain) continue;
    const isMdHeading = /^#{1,4}\s/.test(chunk.trim());
    const isMdQuote = /^>\s/.test(chunk.trim());
    blocks.push({
      type: heading || isMdHeading ? "h2" : quote || isMdQuote ? "quote" : "p",
      text: plain.replace(/^>\s*/, ""),
    });
  }
  return blocks.length ? blocks : null;
}

function text(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Admin uploads may come back as absolute URLs, protocol-relative URLs or
 * server-relative paths (`/uploads/...`, `media/...`). Resolve all of them
 * against the API host so uploaded photos render without code changes.
 */
export function resolveImage(value: string): string {
  if (/^(?:https?:)?\/\//i.test(value) || value.startsWith("data:")) return value;
  // Self-hosted files shipped in public/ stay on this origin.
  if (value.startsWith("/assets/")) return value;
  try {
    return new URL(value.startsWith("/") ? value : `/${value}`, API_BASE_URL).toString();
  } catch {
    return value;
  }
}

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function normalize(raw: RawPost, index: number): BlogPost | null {
  const title = text(raw.title) ?? text(raw.heading) ?? text(raw.name);
  if (!title) return null;

  const rawImage =
    text(raw.image) ??
    text(raw.cover) ??
    text(raw.cover_image) ??
    text(raw.featured_image) ??
    text(raw.thumbnail) ??
    (Array.isArray(raw.images) ? text(raw.images[0]) : null);

  const author =
    text(raw.author_name) ??
    (typeof raw.author === "string"
      ? text(raw.author)
      : (text(raw.author?.name) ?? text(raw.author?.full_name))) ??
    "Royal Wool";

  const body =
    parseBody(raw.body) ??
    parseBody(raw.content) ??
    parseBody(raw.html) ??
    parseBody(raw.description_html);

  const publishedAt =
    text(raw.published_at) ?? text(raw.publishedAt) ?? text(raw.created_at) ?? text(raw.date);

  return {
    id: text(raw.id) ?? text(raw._id) ?? `post-${index}`,
    slug: text(raw.slug) ?? slugify(title),
    title,
    excerpt:
      text(raw.excerpt) ??
      text(raw.summary) ??
      text(raw.description) ??
      text(raw.short_description) ??
      "",
    image: rawImage ? resolveImage(rawImage) : "",
    author,
    date: formatDate(publishedAt),
    tag:
      text(raw.tag) ??
      text(raw.category) ??
      (Array.isArray(raw.tags) ? text(raw.tags[0]) : null) ??
      "Journal",
    featured: Boolean(raw.featured ?? raw.is_featured),
    ...(text(raw.link) ?? text(raw.url) ? { link: (text(raw.link) ?? text(raw.url))! } : {}),
    ...(text(raw.link_label) ? { linkLabel: text(raw.link_label)! } : {}),
    ...(publishedAt ? { publishedAt } : {}),
    ...(body ? { body } : {}),
  };
}

type ListPayload =
  | RawPost[]
  | {
      items?: RawPost[];
      results?: RawPost[];
      data?: RawPost[];
      posts?: RawPost[];
      blogs?: RawPost[];
      total?: number;
      count?: number;
      has_more?: boolean;
      next?: string | null;
    };

function extractRows(payload: ListPayload): RawPost[] {
  if (Array.isArray(payload)) return payload;
  return (
    payload?.items ?? payload?.results ?? payload?.data ?? payload?.posts ?? payload?.blogs ?? []
  );
}

export interface BlogFeedPage {
  posts: BlogPost[];
  /** True when the API said (or implied) more pages exist. */
  hasMore: boolean;
  /** True while the demo fallback is being shown instead of admin data. */
  isFallback: boolean;
}

/** Newest first when the admin panel sends dates; otherwise API order. */
function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    if (!a.publishedAt || !b.publishedAt) return 0;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

async function loadPage(page: number, signal?: AbortSignal): Promise<BlogFeedPage> {
  for (const path of LIST_PATHS) {
    try {
      const data = await apiFetch<ListPayload>(path, {
        signal: signal ?? null,
        query: { page, limit: BLOG_PAGE_SIZE, per_page: BLOG_PAGE_SIZE },
      });

      const rows = extractRows(data);
      const posts = sortPosts(rows.map(normalize).filter((row): row is BlogPost => row !== null));
      if (!posts.length) continue;

      const total = Array.isArray(data) ? null : (data?.total ?? data?.count ?? null);
      const explicit = Array.isArray(data) ? null : (data?.has_more ?? (data?.next ? true : null));
      const hasMore =
        explicit ?? (total != null ? page * BLOG_PAGE_SIZE < total : rows.length >= BLOG_PAGE_SIZE);

      return { posts, hasMore, isFallback: false };
    } catch {
      // endpoint missing / sleeping — try the next alias, then fall back.
    }
  }

  // Demo fallback: single page, no "load more".
  return page > 1
    ? { posts: [], hasMore: false, isFallback: true }
    : { posts: DEMO_POSTS, hasMore: false, isFallback: true };
}

export const blogFeedQuery = (page = 1) =>
  queryOptions({
    queryKey: ["blog", "posts", page],
    queryFn: ({ signal }) => loadPage(page, signal),
    staleTime: 15 * MINUTE,
    retry: false,
    ...(page === 1
      ? { placeholderData: { posts: DEMO_POSTS, hasMore: false, isFallback: true } }
      : {}),
  });

/** Back-compat: flat list of the first page (used by "More from the journal"). */
export const blogPostsQuery = queryOptions({
  queryKey: ["blog", "posts", "flat"],
  queryFn: async ({ signal }) => (await loadPage(1, signal)).posts,
  staleTime: 15 * MINUTE,
  retry: false,
  placeholderData: DEMO_POSTS,
});

/** Splits a feed into the banner post and the grid, tolerating any ordering. */
export function splitFeed(posts: BlogPost[]): { hero: BlogPost | null; rest: BlogPost[] } {
  if (!posts.length) return { hero: null, rest: [] };
  const heroIndex = Math.max(
    0,
    posts.findIndex((p) => p.featured),
  );
  return {
    hero: posts[heroIndex] ?? null,
    rest: posts.filter((_, i) => i !== heroIndex),
  };
}

/** Direct fetch for route loaders (falls back to the demo feed). */
export async function fetchBlogPosts(signal?: AbortSignal): Promise<BlogPost[]> {
  return (await loadPage(1, signal)).posts;
}

export function findPostBySlug(posts: BlogPost[], slug: string): BlogPost | null {
  return posts.find((p) => p.slug === slug) ?? null;
}

/**
 * Single post by slug. Tries the admin detail endpoints first, then falls back
 * to picking the post out of the feed (which itself falls back to demo data).
 */
export async function fetchBlogPost(slug: string, signal?: AbortSignal): Promise<BlogPost | null> {
  for (const base of LIST_PATHS) {
    try {
      const data = await apiFetch<RawPost | ListPayload>(`${base}/${encodeURIComponent(slug)}`, {
        signal: signal ?? null,
      });
      const candidate = Array.isArray(data) || (data && "items" in data) ? null : (data as RawPost);
      const post = candidate ? normalize(candidate, 0) : null;
      if (post) return post;
    } catch {
      // detail endpoint missing — keep trying, then fall back to the feed.
    }
  }

  const posts = await fetchBlogPosts(signal);
  return findPostBySlug(posts, slug);
}
