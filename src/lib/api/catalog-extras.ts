import { queryOptions } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/api/client";
import type { Product } from "@/lib/api/types";

/**
 * Endpoints the admin panel drives but the storefront had never read:
 * banners, bundles, admin-ordered home sections, trending searches,
 * recommendations, waitlist and the catalogue meta lists.
 */

const MINUTE = 60_000;

const retry = (failureCount: number, error: unknown) => {
  if (error instanceof ApiError && !error.isOffline) return false;
  return failureCount < 1;
};

/* ── Promotional banners ──────────────────────────────────────────────── */

export interface Banner {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  code?: string;
  order?: number;
}

export const bannersQuery = queryOptions({
  queryKey: ["banners"],
  queryFn: ({ signal }) => apiFetch<Banner[]>("/banners", { signal }),
  staleTime: 10 * MINUTE,
  retry,
});

/* ── Bundle offers (combos) ───────────────────────────────────────────── */

export interface Combo {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  qty: number;
  price: number;
  product_ids?: string[];
  start_date?: string | null;
  end_date?: string | null;
}

export const combosQuery = queryOptions({
  queryKey: ["combos"],
  queryFn: ({ signal }) => apiFetch<Combo[]>("/combos", { signal }),
  staleTime: 10 * MINUTE,
  retry,
});

/** A combo is live when it is active and inside its date window. */
export function comboIsLive(c: Combo): boolean {
  if (!c.active) return false;
  const now = Date.now();
  if (c.start_date && new Date(c.start_date).getTime() > now) return false;
  if (c.end_date && new Date(c.end_date).getTime() < now) return false;
  return true;
}

/* ── Admin-ordered home sections ──────────────────────────────────────── */

export interface HomeSection {
  id: string;
  title: string;
  type: "recommendation" | "manual" | "category" | string;
  layout: "rail" | "grid" | string;
  products: Product[];
}

export const homeSectionsQuery = queryOptions({
  queryKey: ["home-sections", "resolved"],
  queryFn: ({ signal }) => apiFetch<HomeSection[]>("/home-sections/resolved", { signal }),
  staleTime: 5 * MINUTE,
  retry,
});

/* ── Recommendations ──────────────────────────────────────────────────── */

export const similarProductsQuery = (productId: string, limit = 12) =>
  queryOptions({
    queryKey: ["recommendations", "similar", productId, limit],
    queryFn: ({ signal }) =>
      apiFetch<Product[]>(`/recommendations/similar/${productId}`, { query: { limit }, signal }),
    staleTime: 5 * MINUTE,
    retry,
  });

export const cartRecommendationsQuery = (productIds: string[], limit = 10) =>
  queryOptions({
    queryKey: ["recommendations", "cart", productIds.join(","), limit],
    queryFn: ({ signal }) =>
      apiFetch<Product[]>("/recommendations/cart", {
        query: { product_ids: productIds.join(","), limit },
        signal,
      }),
    staleTime: 2 * MINUTE,
    retry,
  });

/* ── Trending searches ────────────────────────────────────────────────── */

export const trendingSearchQuery = queryOptions({
  queryKey: ["search", "trending"],
  queryFn: ({ signal }) => apiFetch<{ terms: string[] }>("/search/trending", { signal }),
  staleTime: 15 * MINUTE,
  retry,
});

/* ── Restock waitlist ─────────────────────────────────────────────────── */

export const joinWaitlist = (productId: string, colorName?: string | null) =>
  apiFetch<{ success: boolean; message?: string }>("/waitlist", {
    method: "POST",
    json: { product_id: productId, color_name: colorName ?? null },
  });

/* ── Catalogue meta ───────────────────────────────────────────────────── */

export interface Certification {
  id: string;
  name: string;
  logo?: string;
  description?: string;
}

export const certificationsQuery = queryOptions({
  queryKey: ["certifications"],
  queryFn: ({ signal }) => apiFetch<Certification[]>("/certifications", { signal }),
  staleTime: 30 * MINUTE,
  retry,
});

export interface ProductLine {
  id: string;
  name: string;
  slug?: string;
  description?: string;
}

export const productLinesQuery = queryOptions({
  queryKey: ["product-lines"],
  queryFn: ({ signal }) => apiFetch<ProductLine[]>("/product-lines", { signal }),
  staleTime: 30 * MINUTE,
  retry,
});

export interface Country {
  id: string;
  name: string;
  code?: string;
  flag?: string;
}

export const countriesQuery = queryOptions({
  queryKey: ["countries"],
  queryFn: ({ signal }) => apiFetch<Country[]>("/countries", { signal }),
  staleTime: 30 * MINUTE,
  retry,
});

/* ── Coupons the shopper can actually use ─────────────────────────────── */

export interface CouponOffer {
  code: string;
  type: string;
  value: number;
  min_order: number;
  max_discount: number;
  description: string;
  first_order_only: boolean;
  applicable: boolean;
  discount: number;
  needed_more: number;
}

export const applicableCoupons = (subtotal: number) =>
  apiFetch<{ offers: CouponOffer[]; best_code: string | null; best_discount: number }>(
    "/coupons/applicable",
    { method: "POST", json: { subtotal } },
  );

export const validateCoupon = (code: string, subtotal: number) =>
  apiFetch<{ valid: boolean; discount: number; message?: string; code?: string }>(
    "/coupons/validate",
    { method: "POST", json: { code, subtotal } },
  );
