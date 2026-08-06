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
    if (names.has(key)) continue;
    // Fold admin variants ("Ganga Yarn") into the seeded brand they belong to.
    const seeded = SEEDED_BRANDS.find((b) =>
      [normalizeBrand(b.name), ...b.aliases].some((t) => t.length > 2 && key.includes(t)),
    );
    if (seeded) continue;
    names.set(key, p.brand.trim());
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

/**
 * Colour facet for the Shop rail. Nothing here is a fixed list — the buckets
 * and their swatches come straight from what the admin saved on each product
 * (`colors[].color_family`, falling back to the variant name, then to the
 * product's primary colour). Add a shade in the admin and it shows up here.
 */
export interface ColorFacet {
  /** Lowercased key used in the URL. */
  id: string;
  /** Label exactly as the admin wrote it. */
  name: string;
  /** Representative swatch; null when the admin never set a hex. */
  hex: string | null;
  count: number;
}

/** Distinct colour buckets a single product belongs to. */
function familiesOf(p: Product): { name: string; hex: string | null }[] {
  const out: { name: string; hex: string | null }[] = [];
  const seen = new Set<string>();
  const push = (name?: string | null, hex?: string | null) => {
    const label = (name ?? "").trim();
    if (!label) return;
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ name: label, hex: hex?.trim() || null });
  };

  for (const c of p.colors ?? []) push(c.color_family || c.name, c.hex);
  // Products without colour variants still carry a primary shade.
  if (!out.length) push(p.primary_color_family || p.primary_color_name, p.primary_color_hex);
  return out;
}

export function colorFacets(products: Product[]): ColorFacet[] {
  const map = new Map<string, ColorFacet>();
  for (const p of products) {
    for (const fam of familiesOf(p)) {
      const id = fam.name.toLowerCase();
      const hit = map.get(id);
      if (hit) {
        hit.count += 1;
        hit.hex ??= fam.hex;
      } else {
        map.set(id, { id, name: fam.name, hex: fam.hex, count: 1 });
      }
    }
  }
  // Busiest shades first so the rail leads with what the store actually stocks.
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function matchesColor(p: Product, colorId: string): boolean {
  return familiesOf(p).some((f) => f.name.toLowerCase() === colorId);
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
