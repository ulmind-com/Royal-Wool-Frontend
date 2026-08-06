import { queryOptions } from "@tanstack/react-query";

import { GOOGLE_REVIEWS } from "@/data/google-reviews";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { Product } from "@/lib/api/types";
import { primaryImage } from "@/lib/api/types";

/**
 * Site-wide customer review feed.
 *
 * The backend exposes reviews per product (`/reviews?product_id=`) plus an
 * admin-only firehose. So this layer:
 *   1. tries a public site-wide endpoint (`/reviews/highlights`) — when that
 *      lands in the backend, nothing here changes;
 *   2. otherwise merges per-product reviews for the first N catalogue products.
 * Either way the UI reads one normalised shape and stays fully dynamic.
 */

const MINUTE = 60_000;
const FALLBACK_PRODUCT_COUNT = 10;
/** Google reviews pulled in one go — the section pages through them 6 at a time. */
const GOOGLE_LIMIT = 200;

/** Raw review as the API may shape it — every field defensively optional. */
interface RawReview {
  id?: string;
  _id?: string;
  product_id?: string;
  rating?: number;
  title?: string;
  text?: string;
  comment?: string;
  photos?: string[];
  images?: string[];
  tags?: string[];
  verified?: boolean;
  verified_purchase?: boolean;
  helpful?: number;
  created_at?: string;
  date?: string;
  user_name?: string;
  name?: string;
  customer_name?: string;
  user?: { name?: string } | null;
  product?: { id?: string; title?: string; images?: string[] } | null;
}

export interface ReviewProductRef {
  id: string | null;
  title: string | null;
  image: string | null;
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  text: string;
  photos: string[];
  tags: string[];
  verified: boolean;
  createdAt: string | null;
  author: string;
  product: ReviewProductRef;
}

export interface ReviewFeed {
  reviews: Review[];
  count: number;
  average: number;
  /** Star -> number of reviews, 1..5. */
  breakdown: Record<number, number>;
  /** True when the backend had no reviews and placeholder copy is shown. */
  isDemo: boolean;
}

function normalise(raw: RawReview, product?: Product): Review | null {
  const rating = Number(raw.rating ?? 0);
  if (!Number.isFinite(rating) || rating <= 0) return null;

  const photos = (raw.photos ?? raw.images ?? []).filter(
    (p): p is string => typeof p === "string" && p.length > 0,
  );
  const text = (raw.text ?? raw.comment ?? "").trim();
  const author =
    raw.user_name ?? raw.name ?? raw.customer_name ?? raw.user?.name ?? "Verified buyer";

  return {
    id: String(raw.id ?? raw._id ?? `${raw.product_id ?? "r"}-${author}-${text.slice(0, 12)}`),
    rating: Math.max(1, Math.min(5, Math.round(rating))),
    title: raw.title?.trim() ? raw.title.trim() : null,
    text,
    photos,
    tags: (raw.tags ?? []).filter((t): t is string => typeof t === "string"),
    verified: raw.verified ?? raw.verified_purchase ?? true,
    createdAt: raw.created_at ?? raw.date ?? null,
    author,
    product: {
      id: raw.product?.id ?? raw.product_id ?? product?.id ?? null,
      title: raw.product?.title ?? product?.title ?? null,
      image:
        raw.product?.images?.[0] ?? (product ? primaryImage(product) : null) ?? photos[0] ?? null,
    },
  };
}

function summarise(reviews: Review[], isDemo = false): ReviewFeed {
  const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) breakdown[r.rating] = (breakdown[r.rating] ?? 0) + 1;
  const count = reviews.length;
  const average = count ? reviews.reduce((n, r) => n + r.rating, 0) / count : 0;

  const sorted = [...reviews].sort((a, b) => {
    const at = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bt = b.createdAt ? Date.parse(b.createdAt) : 0;
    if (bt !== at) return bt - at;
    // Photo reviews first when dates tie — they read best in the grid.
    return b.photos.length - a.photos.length;
  });

  return { reviews: sorted, count, average, breakdown, isDemo };
}

/** Swallow "endpoint/auth not available" so one dead read can't kill the feed. */
async function soft<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

/** Raw row from `/google-reviews`. */
interface RawGoogleReview {
  id?: string;
  review_id?: string;
  author?: string;
  rating?: number;
  text?: string;
  photos?: string[];
  created_at?: string;
  owner_reply?: string | null;
}

/** Google Business Profile reviews, synced into the backend. */
async function fetchGoogleReviews(signal: AbortSignal): Promise<Review[]> {
  const res = await soft(
    apiFetch<{ items: RawGoogleReview[]; total: number }>("/google-reviews", {
      query: { limit: GOOGLE_LIMIT },
      signal,
    }),
  );
  const items = res?.items;
  if (!Array.isArray(items)) return [];

  return items
    .filter((r) => (r.text ?? "").trim().length > 0)
    .map((r) => ({
      id: `google-${r.review_id ?? r.id}`,
      rating: Math.round(r.rating ?? 0) || 5,
      title: null,
      text: (r.text ?? "").trim(),
      photos: Array.isArray(r.photos) ? r.photos : [],
      tags: ["Google review"],
      verified: true,
      createdAt: r.created_at ?? null,
      author: r.author ?? "Google user",
      product: { id: null, title: null, image: null },
    }));
}

async function fetchFeed(signal: AbortSignal): Promise<ReviewFeed> {
  // 1. Preferred: a public site-wide feed.
  const highlights = await soft(
    apiFetch<RawReview[]>("/reviews/highlights", { query: { limit: 30 }, signal }),
  );
  if (Array.isArray(highlights) && highlights.length) {
    return summarise(highlights.map((r) => normalise(r)).filter((r): r is Review => !!r));
  }

  // 2. Fallback: merge per-product reviews across the front of the catalogue.
  const products =
    (await soft(
      apiFetch<Product[]>("/products", { query: { limit: FALLBACK_PRODUCT_COUNT }, signal }),
    )) ?? [];

  const batches = await Promise.all(
    products.map(async (product) => {
      const rows = await soft(
        apiFetch<RawReview[]>("/reviews", { query: { product_id: product.id }, signal }),
      );
      if (!Array.isArray(rows)) return [];
      return rows.map((r) => normalise(r, product)).filter((r): r is Review => !!r);
    }),
  );

  const merged = batches.flat();

  // 3. Every Google Business Profile review the backend has synced. These carry
  //    the shop's public reputation, so they show alongside on-site reviews.
  const google = await fetchGoogleReviews(signal);

  const all = [...merged, ...google];
  if (!all.length) return summarise(GOOGLE_REVIEWS);

  return summarise(all);
}

export const reviewFeedQuery = queryOptions({
  queryKey: ["reviews", "feed"],
  queryFn: ({ signal }) => fetchFeed(signal),
  staleTime: 10 * MINUTE,
  retry: false,
});

/** "3 weeks ago" style label; null when the API gave us no date. */
export function relativeDate(iso: string | null): string | null {
  if (!iso) return null;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return `${w} week${w > 1 ? "s" : ""} ago`;
  }
  if (days < 365) {
    const m = Math.floor(days / 30);
    return `${m} month${m > 1 ? "s" : ""} ago`;
  }
  const y = Math.floor(days / 365);
  return `${y} year${y > 1 ? "s" : ""} ago`;
}

/** Reviews published against one product. Empty feed when nothing is live yet. */
export const productReviewsQuery = (productId: string) =>
  queryOptions({
    queryKey: ["reviews", "product", productId],
    queryFn: async ({ signal }): Promise<ReviewFeed> => {
      const rows = await soft(
        apiFetch<RawReview[]>("/reviews", { query: { product_id: productId }, signal }),
      );
      if (!Array.isArray(rows)) return summarise([]);
      return summarise(rows.map((r) => normalise(r)).filter((r): r is Review => !!r));
    },
    staleTime: 5 * MINUTE,
    retry: false,
  });

/* ── Writing reviews ──────────────────────────────────────────────────── */

/** Only a shopper with a delivered order, who hasn't reviewed yet, may post. */
export const canReviewQuery = (productId: string) =>
  queryOptions({
    queryKey: ["reviews", "can-review", productId],
    queryFn: ({ signal }) =>
      apiFetch<{ can: boolean; delivered: boolean; already: boolean }>("/reviews/can-review", {
        query: { product_id: productId },
        signal,
      }),
    staleTime: 60_000,
    retry: false,
  });

export const postReview = (body: {
  product_id: string;
  rating: number;
  title?: string;
  text?: string;
  photos?: string[];
  tags?: string[];
}) => apiFetch<unknown>("/reviews", { method: "POST", json: body });

export const voteReview = (reviewId: string, helpful: boolean) =>
  apiFetch<{ helpful_count?: number }>(`/reviews/${reviewId}/vote`, {
    method: "POST",
    json: { helpful },
  });
