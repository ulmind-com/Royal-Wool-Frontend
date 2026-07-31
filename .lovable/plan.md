# Phase 2 — Live data layer

Goal: everything the shell and catalog pages show comes from the real backend, with the Render cold start (30–50s) handled gracefully instead of looking broken.

Confirmed live from the backend just now: `/settings` (currency ₹, tax 5%, cancel 24h, return 7d, COD disabled, shop address/phone, delivery slabs, free_above 1500), `/categories/tree` (nested, with images), `/products` (colors → sizes, per-variant price/mrp/discount/stock), `/coupons/active` (FLAT100), `/site-media` (sectioned image lists). Catalog rows are still the clothing demo data — that's expected and stays as placeholder content.

## 1. API client

`src/lib/api/client.ts`
- Single `apiFetch<T>(path, init)` on `API_BASE_URL`, JSON in/out, `AbortSignal` pass-through.
- Attaches `Authorization: Bearer <rw_token>` when a token exists (read lazily, browser-only) so Phase 3 auth needs no client change.
- Typed `ApiError` carrying status + server `detail`, so UI can distinguish 404 (not found → `notFound()`) from 5xx/offline.
- Retry policy tuned for the free tier: up to 3 attempts with backoff on network errors / 502 / 503 / 504, long timeout (60s). GET only — never retries writes.

`src/lib/api/types.ts` — hand-written interfaces for Settings, Category, Product, ProductColor, ProductSize, Coupon, SiteMedia, plus normalizers (`variantPrice`, `inStock`, `productMinPrice`, `discountPct`) so no component recomputes pricing.

`src/lib/api/queries.ts` — `queryOptions` factories: `settingsQuery`, `categoryTreeQuery`, `productsQuery(filters)`, `productQuery(id)`, `activeCouponsQuery`, `siteMediaQuery`. Long `staleTime` for settings/categories (rarely change), shorter for products.

## 2. Cold-start experience

- `src/components/wake-gate.tsx`: on first load, kick `settingsQuery`. If it hasn't resolved in ~2.5s, show a full-bleed glass panel — "Warming the dye house…" with the thread animating and an honest note that the first visit can take up to a minute. Auto-dismisses on resolve, and offers a WhatsApp link if it fails outright.
- One shared `<DataError retry>` glass block for failed sections, and skeletons matching final layout (no layout shift).

## 3. Settings everywhere

`src/hooks/use-settings.ts` → `useSuspenseQuery(settingsQuery)` plus derived helpers: `formatMoney`, `freeAbove`, `returnWindowDays`, `cancelWindowHours`, `codEnabled`, `deliveryRule`.

Wire the values that are currently hardcoded or described as "loaded from settings":
- Announcement ticker: real free-delivery threshold and active coupon code.
- Footer + `/contact`: shop name, address, phone, email from `/settings` (with the WhatsApp number staying ours).
- `/shipping`, `/returns-policy`, `/faq`: inject the real numbers into the prose instead of the "comes from settings" placeholder sentences.
- `/offers`: real coupon cards from `/coupons/active`, tap-to-copy code, min-order and validity rendered.

## 4. Navigation from the real tree

- `categoryTreeQuery` drives the header mega-menu (parents as columns, children as links) and the footer shop column, replacing `NAV_PLACEHOLDER`.
- Category imagery from the tree's `image` field, honouring `image_scale`.
- `/collections` lists top-level categories; `/collections/$slug` resolves slug → id from the tree, then loads `/products?category_id=…`, and throws `notFound()` for an unknown slug.

## 5. Catalog surfaces

- `ProductCard`: glass card, colour swatches from `colors[]`, price from the cheapest in-stock variant with MRP strikethrough and discount badge, out-of-stock treatment, wishlist heart stubbed until Phase 3.
- Home: "New arrivals" and "Shop by category" rails fed by real data; hero and 3D remain Phase 5 placeholders.
- `/product/$id`: real title, brand, description, colour/size picker driven by the variant matrix (disabled + "out of stock" per size), live price recalc on variant change, add-to-bag disabled until a valid in-stock variant is chosen. 3D yarn ball still a placeholder panel. Product JSON-LD from loader data.
- `/search`: query params → `/products` with `q`, sort and price filters; shareable URLs.
- `/upcoming`: attempt the "upcoming" category from the tree, fall back to the existing curated list — no visual regression either way.

## 6. Correctness rules baked in

- Money and stock are never derived from `product.price` alone — always the variant matrix.
- Bill totals are never computed client-side; that stays a `/orders/quote` call in Phase 6.
- Every route with a loader gets `errorComponent` + `notFoundComponent`; loaders prime the cache via `ensureQueryData` and components read with `useSuspenseQuery`.

## Technical notes

Reads go straight from the browser/SSR to the existing REST API — no server functions, no Supabase, nothing proxied. `VITE_API_BASE_URL` stays the single override point. Retries are capped so a genuinely down backend surfaces an error instead of spinning forever.

## Out of scope for Phase 2

OTP auth and account pages, cart/checkout/quote/Razorpay, wishlist and notification writes, the R3F yarn ball, and the GSAP "Thread" scroll indicator.
