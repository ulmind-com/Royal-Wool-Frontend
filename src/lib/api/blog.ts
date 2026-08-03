import { queryOptions } from "@tanstack/react-query";

import { DEMO_POSTS, type BlogPost } from "@/data/blog";
import { apiFetch } from "@/lib/api/client";

/**
 * Blog feed.
 *
 * The backend has no blog endpoint yet, so this layer tries `/blog/posts`
 * (and `/posts` as an alias), normalises whatever shape comes back, and falls
 * back to the demo set. The UI only ever sees `BlogPost`, so wiring the admin
 * panel later needs no component changes.
 */

const MINUTE = 60_000;

interface RawPost {
  id?: string;
  _id?: string;
  slug?: string;
  title?: string;
  heading?: string;
  excerpt?: string;
  summary?: string;
  description?: string;
  image?: string;
  cover?: string;
  cover_image?: string;
  thumbnail?: string;
  images?: string[];
  author?: string | { name?: string };
  author_name?: string;
  tag?: string;
  category?: string;
  created_at?: string;
  published_at?: string;
  date?: string;
  featured?: boolean;
  is_featured?: boolean;
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

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function normalize(raw: RawPost, index: number): BlogPost | null {
  const title = text(raw.title) ?? text(raw.heading);
  if (!title) return null;
  const image =
    text(raw.image) ??
    text(raw.cover) ??
    text(raw.cover_image) ??
    text(raw.thumbnail) ??
    (Array.isArray(raw.images) ? text(raw.images[0]) : null);
  if (!image) return null;

  const author =
    text(raw.author_name) ??
    (typeof raw.author === "string" ? text(raw.author) : text(raw.author?.name)) ??
    "Royal Wool";

  return {
    id: text(raw.id) ?? text(raw._id) ?? `post-${index}`,
    slug: text(raw.slug) ?? slugify(title),
    title,
    excerpt: text(raw.excerpt) ?? text(raw.summary) ?? text(raw.description) ?? "",
    image,
    author,
    date: formatDate(text(raw.published_at) ?? text(raw.created_at) ?? text(raw.date)),
    tag: text(raw.tag) ?? text(raw.category) ?? "Journal",
    featured: Boolean(raw.featured ?? raw.is_featured),
  };
}

async function loadPosts(signal?: AbortSignal): Promise<BlogPost[]> {
  for (const path of ["/blog/posts", "/posts"]) {
    try {
      const data = await apiFetch<RawPost[] | { items?: RawPost[]; results?: RawPost[] }>(path, {
        signal: signal ?? null,
      });

      const list = Array.isArray(data) ? data : (data?.items ?? data?.results ?? []);
      const rows = list.map(normalize).filter((row): row is BlogPost => row !== null);
      if (rows.length) return rows;
    } catch {
      // endpoint missing / sleeping — try the next alias, then fall back.
    }
  }
  return DEMO_POSTS;
}

export const blogPostsQuery = queryOptions({
  queryKey: ["blog", "posts"],
  queryFn: ({ signal }) => loadPosts(signal),
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
