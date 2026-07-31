import { queryOptions } from "@tanstack/react-query";

import { ApiError, apiFetch, type QueryParams } from "@/lib/api/client";
import type { CategoryNode, Coupon, Product, Settings, SiteMedia } from "@/lib/api/types";

/**
 * Query option factories — one place per endpoint so cache keys can't drift.
 *
 * staleTime is generous for store config and navigation (they change rarely and
 * a refetch costs a cold start), shorter for catalogue reads where stock matters.
 */

const MINUTE = 60_000;

/** Don't hammer a sleeping backend: the client already retried internally. */
const retry = (failureCount: number, error: unknown) => {
  if (error instanceof ApiError && !error.isOffline) return false;
  return failureCount < 1;
};

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: ({ signal }) => apiFetch<Settings>("/settings", { signal }),
  staleTime: 30 * MINUTE,
  retry,
});

export const categoryTreeQuery = queryOptions({
  queryKey: ["categories", "tree"],
  queryFn: ({ signal }) => apiFetch<CategoryNode[]>("/categories/tree", { signal }),
  staleTime: 30 * MINUTE,
  retry,
});

export const activeCouponsQuery = queryOptions({
  queryKey: ["coupons", "active"],
  queryFn: ({ signal }) => apiFetch<Coupon[]>("/coupons/active", { signal }),
  staleTime: 10 * MINUTE,
  retry,
});

export const siteMediaQuery = queryOptions({
  queryKey: ["site-media"],
  queryFn: ({ signal }) => apiFetch<SiteMedia>("/site-media", { signal }),
  staleTime: 30 * MINUTE,
  retry,
});

export interface ProductFilters extends QueryParams {
  category_id?: string;
  q?: string;
  sort?: string;
  min_price?: number;
  max_price?: number;
  limit?: number;
  skip?: number;
}

export const productsQuery = (filters: ProductFilters = {}) =>
  queryOptions({
    queryKey: ["products", filters],
    queryFn: ({ signal }) => apiFetch<Product[]>("/products", { query: filters, signal }),
    staleTime: 2 * MINUTE,
    retry,
  });

export const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: ({ signal }) => apiFetch<Product>(`/products/${id}`, { signal }),
    staleTime: 2 * MINUTE,
    retry,
  });
