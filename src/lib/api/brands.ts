/**
 * Brand + yarn-weight derivation for the Shop page.
 *
 * The REST API has no brand or weight parameter yet, so both facets are derived
 * from the product feed itself: `brand` when the backend sets it, otherwise a
 * token match on title/description. When the backend gains real fields these
 * helpers are the single place to change.
 */

import { SEEDED_BRANDS, brandDisplay, normalizeBrand, type BrandMeta } from "@/data/brands";
import { YARN_WEIGHTS, type YarnWeight } from "@/data/yarn-weights";
import type { Product } from "@/lib/api/types";

export type BrandGroup = {
  key: string;
  meta: BrandMeta;
  products: Product[];
};

function productText(p: Product): string {
  return `${p.title} ${p.brand ?? ""} ${p.description ?? ""}`.toLowerCase();
}

/** True when a product belongs to a brand, by field or by name/alias token. */
export function matchesBrand(p: Product, meta: BrandMeta): boolean {
  const key = normalizeBrand(meta.name);
  if (p.brand && normalizeBrand(p.brand) === key) return true;
  const text = productText(p);
  const tokens = [key, ...meta.aliases];
  return tokens.some((t) => t.length > 2 && text.includes(t));
}

/**
 * Brands to show on the shop: every brand present in the feed, plus the seeded
 * ones so the section is never empty while the catalogue is migrated.
 */
export function brandGroups(products: Product[]): BrandGroup[] {
  const names = new Map<string, string>();
  for (const b of SEEDED_BRANDS) names.set(normalizeBrand(b.name), b.name);
  for (const p of products) {
    if (!p.brand?.trim()) continue;
    const key = normalizeBrand(p.brand);
    if (!names.has(key)) names.set(key, p.brand.trim());
  }

  return [...names.entries()].map(([key, name]) => {
    const meta = brandDisplay(name);
    return { key, meta, products: products.filter((p) => matchesBrand(p, meta)) };
  });
}

/** Resolved yarn weight for a product, or null when nothing matches. */
export function weightOf(p: Product): YarnWeight | null {
  const text = productText(p);
  return (
    YARN_WEIGHTS.find((w) => text.includes(w.name.toLowerCase())) ??
    YARN_WEIGHTS.find((w) => text.includes(w.query.toLowerCase())) ??
    null
  );
}

export function availableWeights(products: Product[]): YarnWeight[] {
  const ids = new Set(products.map((p) => weightOf(p)?.id).filter(Boolean) as string[]);
  return YARN_WEIGHTS.filter((w) => ids.has(w.id));
}

export function availableCategoryIds(products: Product[]): Set<string> {
  return new Set(products.map((p) => p.category_id).filter(Boolean) as string[]);
}

export function sortProducts(products: Product[], sort: string): Product[] {
  const out = [...products];
  if (sort === "price_asc") out.sort((a, b) => priceOf(a) - priceOf(b));
  else if (sort === "price_desc") out.sort((a, b) => priceOf(b) - priceOf(a));
  else if (sort === "name") out.sort((a, b) => a.title.localeCompare(b.title));
  return out;
}

function priceOf(p: Product): number {
  return p.price_from ?? p.final_price ?? p.price;
}
