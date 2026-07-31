/**
 * Shapes returned by the Royal Wool REST API.
 *
 * Only the fields the storefront actually reads are typed. Everything is
 * treated as optional where the backend can legitimately omit or null it —
 * defensive by design, because the catalogue is still being migrated from the
 * demo dataset to real yarn.
 */

export interface Settings {
  currency: string;
  currency_code: string;
  tax_rate: number;
  cancel_window_hours: number;
  return_window_days: number;
  cod: { enabled: boolean; disabled_from: string | null; disabled_until: string | null };
  shop: {
    name: string;
    address: string;
    phone: string;
    email: string;
    state?: string;
    lat?: number;
    lng?: number;
  };
  delivery: {
    free_radius_km: number;
    per_km_rate: number;
    base_fee: number;
    free_above: number;
    max_service_km: number;
    slabs?: unknown[];
  };
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image: string | null;
  order?: number;
  image_scale?: number;
  children?: CategoryNode[];
}

export interface ProductSize {
  size: string;
  price: number | null;
  mrp: number | null;
  discount_pct: number | null;
  discount_on: string | null;
  stock: number;
}

export interface ProductColor {
  name: string;
  hex: string | null;
  images: string[];
  price: number | null;
  mrp: number | null;
  discount_pct: number | null;
  discount_on: string | null;
  stock: number;
  sizes: ProductSize[];
}

export interface Product {
  id: string;
  title: string;
  brand?: string | null;
  category_id?: string | null;
  description?: string | null;
  mrp?: number | null;
  price: number;
  sizes?: string[];
  colors?: ProductColor[];
  images?: string[];
  rating?: number;
  review_count?: number;
  is_active?: boolean;
  returnable?: boolean;
  return_days?: number;
  low_stock_threshold?: number;
  /** Server-computed display fields — always prefer these over raw price. */
  final_price?: number;
  struck_price?: number | null;
  off_pct?: number;
  price_from?: number;
  price_to?: number;
  price_varies?: boolean;
  total_stock?: number;
  in_stock?: boolean;
  low_stock?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: "flat" | "percent" | string;
  value: number;
  min_order?: number;
  max_discount?: number;
  active?: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
  description?: string | null;
  first_order_only?: boolean;
}

export interface MediaItem {
  id: string;
  section: string;
  url: string;
  poster: string | null;
  title: string;
  subtitle: string;
  order: number;
  active: boolean;
}

export type SiteMedia = Record<string, MediaItem[]>;

/* ────────────────────────── derived helpers ──────────────────────────
 * Pricing and stock are NEVER recomputed in components. The backend already
 * resolves the variant matrix into final_price / price_from / in_stock, so
 * these helpers are the single place that reads those fields.
 */

/** Lowest price a shopper can actually pay for this product. */
export function displayPrice(p: Product): number {
  return p.price_from ?? p.final_price ?? p.price;
}

/** Strikethrough value, only when it is genuinely higher than the price. */
export function struckPrice(p: Product): number | null {
  const struck = p.struck_price ?? p.mrp ?? null;
  if (struck == null) return null;
  return struck > displayPrice(p) ? struck : null;
}

export function discountPct(p: Product): number {
  if (p.off_pct && p.off_pct > 0) return Math.round(p.off_pct);
  const struck = struckPrice(p);
  if (!struck) return 0;
  return Math.round(((struck - displayPrice(p)) / struck) * 100);
}

export function isInStock(p: Product): boolean {
  if (typeof p.in_stock === "boolean") return p.in_stock;
  return (p.total_stock ?? 0) > 0;
}

export function primaryImage(p: Product): string | null {
  if (p.images?.length) return p.images[0]!;
  const fromColor = p.colors?.find((c) => c.images?.length);
  return fromColor?.images[0] ?? null;
}

/** Resolved price for one colour+size selection, falling back up the matrix. */
export function variantPrice(p: Product, color?: ProductColor, size?: ProductSize): number {
  return size?.price ?? color?.price ?? p.final_price ?? p.price;
}

export function variantStock(color?: ProductColor, size?: ProductSize): number {
  if (size) return size.stock;
  if (color) return color.stock || color.sizes.reduce((n, s) => n + s.stock, 0);
  return 0;
}

/** Flattens a category tree into a lookup-friendly list. */
export function flattenCategories(tree: CategoryNode[]): CategoryNode[] {
  const out: CategoryNode[] = [];
  const walk = (nodes: CategoryNode[]) => {
    for (const n of nodes) {
      out.push(n);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(tree);
  return out;
}

export function findCategoryBySlug(tree: CategoryNode[], slug: string): CategoryNode | undefined {
  return flattenCategories(tree).find((c) => c.slug === slug);
}
