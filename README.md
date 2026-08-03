# Royal Wool Studio

# MASTER PROMPT — ROYAL WOOL STOREFRONT
### Paste this whole thing into Lovable (works for Antigravity / Cursor / Bolt too) as the first message.

---

You are the lead frontend engineer **and** design director for a single project. Build a complete, production-grade, ultra-premium **3D animated e-commerce storefront** for **Royal Wool**, a premium knitting & crochet yarn brand in India.

The backend and the admin panel **already exist and are live**. You are building **only the customer-facing website**. You must wire it to the existing API exactly as documented below — do not invent, rename, or "improve" any endpoint, and do not create any new database or auth system.

---

## 0. HARD RULES — READ FIRST, VIOLATE NONE

1. **Do NOT enable or use Supabase, Firebase, or any Lovable-native backend.** This project has its own backend. All data comes from the REST API below.
2. **Do NOT call any admin endpoint** from this site. The following are admin-only and are forbidden here: `POST/PATCH/DELETE /categories`, `POST/PATCH/DELETE /products`, `GET /products/admin/low-stock`, `GET /orders/admin/*`, `POST /orders/{id}/refund`, `GET /orders/{id}/payment`, `PATCH /orders/{id}/status`, `GET /reviews/admin/all`, `POST/PATCH/DELETE /coupons`, `POST/PATCH/DELETE /banners`, `PUT /settings`, `GET /users/admin/*`, `PATCH /users/admin/*`, `POST /notifications/send`, `POST /notifications/run-due`, `POST/PATCH/DELETE /home-sections`, `PUT /home-sections/order`, `POST/PATCH/DELETE /site-media`, `PUT /site-media/order`, `PUT /search/trending`, `POST /upload/image`, `POST /upload/video`, `GET /site-media/admin`.
3. **Never hardcode catalog content.** Products, categories, banners, home sections, coupons, trending searches, currency, tax, delivery rules and policy windows all come from the API so the client's existing admin panel stays the single source of truth. The only permitted hardcoded content is the "Upcoming" fallback list in §9 and static legal/about copy.
4. **Everything must be responsive** and fully usable on a 360px phone. The 3D must degrade gracefully (see §7.6).
5. **Respect `prefers-reduced-motion`** everywhere. Keyboard focus must always be visible.
6. **TypeScript strict.** No `any` in API layer. Every API response is normalized through a typed adapter because the OpenAPI schema is loosely typed (many responses are declared as `"string"` but return JSON objects/arrays).

---

## 1. TECH STACK

- **React 18 + Vite + TypeScript**
- **Tailwind CSS** + `shadcn/ui` for primitives only (dialog, sheet, popover, toast, accordion, tabs, skeleton). Restyle every primitive to the design system in §6 — nothing may look like default shadcn.
- **@tanstack/react-query** for all server state (staleTime 60s, retry 1, global error toast).
- **react-router-dom** v6.
- **@react-three/fiber + @react-three/drei + three** for 3D.
- **gsap** + **ScrollTrigger** for scroll choreography.
- **framer-motion** for component-level transitions, page transitions, layout animations.
- **lenis** (`@studio-freight/lenis`) for smooth inertial scrolling, synced to ScrollTrigger.
- **zustand** for cart, wishlist mirror, address book, UI state. Persist cart + addresses to `localStorage`.
- **axios** single instance in `src/lib/api.ts`.
- Fonts loaded from Google Fonts / Fontshare via `<link>` in `index.html`.

**Env vars** (create `.env`, and also hardcode sane defaults so the preview never breaks):
```
VITE_API_BASE_URL=https://royal-wool-backend.onrender.com
VITE_RAZORPAY_KEY_ID=<ask user / leave placeholder>
VITE_WHATSAPP_NUMBER=918910792214
```

**Important:** the backend is on Render free tier — the first request after idle can take 30–50s. Every initial load must show elegant skeletons (never a spinner-only white screen), and the API client must use a 60s timeout with one silent retry.

---

## 2. API CONTRACT

Base URL: `https://royal-wool-backend.onrender.com` (Swagger: `/docs`)

**Auth:** JWT bearer. Store `access_token` in `localStorage` under `rw_token`. Axios request interceptor attaches `Authorization: Bearer <token>`. Response interceptor: on `401`, clear token + user, and if the route was protected, redirect to `/login?next=<path>`.

### 2.1 Auth (`/auth`)
| Method | Path | Body | Use |
|---|---|---|---|
| POST | `/auth/otp/request` | `{email}` | Signup step 1 — sends 6-digit code, rate-limited |
| POST | `/auth/otp/verify` | `{email, code}` | Signup step 2 — returns short-lived `signup_token` |
| POST | `/auth/register` | `{signup_token, name, phone, password}` | Signup step 3 — returns `{access_token, token_type, user}` |
| POST | `/auth/login` | `{email, password}` | returns `{access_token, token_type, user}` |
| POST | `/auth/google` | `{id_token}` | Google sign-in |
| POST | `/auth/facebook` | `{access_token}` | Facebook sign-in |
| GET | `/auth/me` | — | current user |
| PATCH | `/auth/me` | `{name?, phone?, avatar?}` | update profile |

`user` = `{id, name, email, phone, avatar, role}`.

Build signup as a **single-screen 3-step wizard** with an animated progress thread: Email → 6-box OTP input (auto-advance, paste support, 60s resend countdown) → Name/Phone/Password. Show a friendly "code sent, check spam" state. Handle rate-limit errors from step 1 with a readable message.

For Google/Facebook: render the buttons; if the client hasn't supplied OAuth client IDs, wire the UI and leave a clearly-commented `TODO` with the exact place to drop the client ID. Do not fake the flow.

### 2.2 Catalog
- `GET /categories?parent_id=` — omit param for top-level, pass id for children
- `GET /categories/tree` — top-level with nested children. **Use this to build the mega-menu.**
- `GET /products?category_id&q&limit(≤100)&skip&admin=false`
- `GET /products/{product_id}`
- `GET /search?q&category_id&brands&sizes&colors&price_min&price_max&min_rating&min_discount&in_stock&sort&skip&limit` — `brands/sizes/colors` are comma-separated strings. `sort` default `relevance` (also support `price_asc`, `price_desc`, `newest`, `rating`, `discount` — read whatever the API echoes back and don't crash on unknown values).
- `GET /search/trending` — chips in the search overlay
- `GET /recommendations/home?limit`
- `GET /recommendations/similar/{product_id}?limit`
- `GET /recommendations/cart?product_ids=a,b,c&limit`

### 2.3 Home & media
- `GET /home-sections/resolved` — **the home page is driven by this.** Each section has `title`, `type`, `layout` (`rail` | others), and resolved products. Render `rail` as a horizontal snap carousel; render grid layouts as a masonry-ish grid. If an unknown layout appears, fall back to a rail.
- `GET /banners` — hero carousel
- `GET /site-media?section=<name>` — active media grouped by section (images/videos + poster + title + subtitle). Fetch **once**, no `section` param, and pick sections client-side (the API is designed for this).
- `GET /site-media/sections` — the catalogue of section keys, so you know what's available.

### 2.4 Cart, quote, orders
**There is no cart API.** Cart lives entirely client-side in zustand + localStorage. Line item shape: `{product_id, qty, color?, size?}` plus a denormalized snapshot (title, image, unit price, stock) for rendering.

- `POST /orders/quote` → `{items[], address, payment_method, coupon_code?}` — **always call this before showing the bill.** Never compute delivery/tax/total on the client; render exactly what the quote returns. Debounce 400ms and re-quote on any change to items, address, coupon, or payment method.
- `GET /orders/cod-availability` — gates the COD radio (respects global switch, scheduled pause, per-user block). If unavailable, disable COD with the reason returned.
- `POST /orders` — same body as quote. Returns the order (with Razorpay order id for online payments).
- `POST /orders/verify` → `{order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature}`
- `GET /orders`, `GET /orders/{order_id}`
- `POST /orders/{order_id}/cancel` — only show the Cancel button when within `settings.cancel_window_hours` of placement AND status is before shipped.

Address shape (client-side address book, persisted to localStorage; there is no address API):
```ts
{ tag: "Home"|"Work"|"Other", name, house, area, city, state, pincode, phone, lat, lng }
```
Include a "use my location" button that fills `lat/lng` via `navigator.geolocation` — delivery fee depends on distance (see settings).

### 2.5 Payments (Razorpay)
Load `https://checkout.razorpay.com/v1/checkout.js` lazily on the checkout page only.
Flow: `POST /orders` → if `payment_method === "online"`, open Razorpay with the returned order id and `VITE_RAZORPAY_KEY_ID` → on success `POST /orders/verify` → route to `/order/{id}/success`. On dismiss/failure, keep the order visible in "payment pending" state and offer Retry. Prefill Razorpay `prefill` with the user's name/email/phone and set `theme.color` to the brand accent.

### 2.6 Wishlist
`GET /wishlist`, `GET /wishlist/ids` (hydrate heart states in one call on app boot), `POST /wishlist/{product_id}`, `DELETE /wishlist/{product_id}`. Optimistic toggle with rollback on error. If logged out, tapping a heart opens the auth sheet and completes the action after login.

### 2.7 Reviews
`GET /reviews?product_id&rating`, `GET /reviews/summary?product_id` (rating histogram), `GET /reviews/can-review?product_id` (only show the write-review CTA when true), `POST /reviews` `{product_id, rating, title, text, photos[], tags[]}`, `POST /reviews/{review_id}/vote` `{helpful}`.
Photo upload: `POST /upload/review-image` (multipart, field name `file`, auth required) → returns URL → push into `photos[]`.

### 2.8 Coupons
`GET /coupons/active` (Offers page), `POST /coupons/applicable {subtotal}` — returns applicable coupons sorted best-first with a `best_code`, plus locked coupons with `needed_more`. In the cart drawer show a Flipkart/Amazon-style list: applicable ones in full colour with savings, locked ones greyed with "Add ₹X more to unlock". Auto-apply `best_code` but let the user remove or override it. `POST /coupons/validate {code, subtotal}` for manual codes.

### 2.9 Settings — drives all commerce copy
`GET /settings` returns `currency`, `currency_code`, `tax_rate`, `cancel_window_hours`, `return_window_days`, `cod.enabled`, `shop{name,address,phone,email,state}`, `delivery{free_radius_km, per_km_rate, base_fee, free_above, max_service_km, slabs[]}`.
Fetch once at app boot into a context. Use it for the currency symbol everywhere, the "Free delivery above ₹X" strip, the delivery-radius explainer, the returns window on the PDP, and the cancel window on the order page. **Never hardcode ₹ or any of these numbers.**

### 2.10 Returns
`GET /returns`, `POST /returns` `{order_id, type: "refund"|"exchange", reason, note, items[]}`. Show the Return/Exchange CTA on delivered orders only, within `settings.return_window_days`, and only for items whose product is `returnable`.

### 2.11 Notifications
`GET /notifications?limit&skip`, `GET /notifications/unread-count` (poll every 60s while tab is visible), `PATCH /notifications/{id}/read`, `POST /notifications/read-all`, `DELETE /notifications/{id}`, `DELETE /notifications` (clear all). Render as a glass bell dropdown with unread dot. `POST /users/fcm-token` / `DELETE /users/fcm-token` only if web push is set up — otherwise skip silently, don't break.

### 2.12 Support chat
`GET /chat/suggestions?order_id` and `POST /chat {messages[], order_id?}`. Build a **glass chat launcher** with the suggestion chips as starting points, streaming-style typing indicator, and message history in local state. Pass `order_id` when opened from an order page so answers are order-aware.

### 2.13 Profile
`GET /auth/me`, `PATCH /auth/me`, avatar via `POST /upload/user-image` (multipart, `file`).

---

## 3. DATA MODEL NOTES (critical for the PDP)

A product looks like:
```ts
{
  id, title, description, brand, category_id,
  mrp, price, discount_pct, discount_on: "price"|"mrp",
  cgst, sgst, igst,
  images: string[],
  colors: [{ name, hex, images[], price, mrp, discount_pct, discount_on, stock, sizes[] }],
  sizes: string[],
  stock, low_stock_threshold,
  rating, review_count, sold_count,
  returnable, return_days, is_active
}
```

**Variant logic — implement exactly:**
- If `colors[]` is non-empty, the selected colour **overrides** price / mrp / discount / stock / images / sizes. Falling back to the product-level values only when the colour omits them.
- Size list = selected colour's `sizes` if present, else product `sizes`.
- Effective stock = selected colour's stock if colours exist, else product stock.
- Show "Only N left" when `stock <= low_stock_threshold`, and "Sold out" at 0 (disable Add to bag, swap CTA to a WhatsApp "Notify me" link).
- Colour swatches render as the actual `hex` — and (see §7.4) **the 3D yarn ball on the PDP re-dyes itself to that hex with a smooth material tween.**

---

## 4. ROUTES

```
/                       Home
/collections            All yarns (all categories)
/collections/:slugOrId  Category listing (subcategory chips from /categories/tree)
/product/:id            PDP
/search                 Search results (filters in URL query params, shareable)
/upcoming               Upcoming Products (see §9)
/cart                   Cart page (plus a glass slide-over drawer everywhere)
/checkout               Address → payment → review, single page, 3 steps
/order/:id/success      Order confirmation
/account                Profile
/account/orders         Orders list + detail
/account/returns        Returns
/account/wishlist       Wishlist
/account/notifications  Inbox
/offers                 Active coupons
/about  /contact  /faq  /shipping  /returns-policy  /privacy  /terms
/login  /signup
*                       404 — a 3D yarn ball unravelling into "404"
```
Protected routes: `/account/*`, `/checkout`. Redirect to `/login?next=`.

---

## 5. SITE STRUCTURE — HOME PAGE ORDER

1. **Announcement ticker** — thin marquee strip: free-delivery threshold from settings, OEKO-TEX-style quality line, support hours.
2. **Sticky glass header** — logo, mega-menu from `/categories/tree` (grouped columns, hover-preview image per category), search trigger (⌘K), wishlist, notifications bell, account, cart with count badge. Header goes from transparent to frosted-glass on scroll.
3. **Hero** — the signature 3D moment (§7.1) with banners from `/banners` as the rotating content layer.
4. **Trust bar** — 4 glass pills: Quality Guarantee · Safe for Babies · Pan-India Delivery · Loved by Crafters. (Icons + short copy; content static, styled as glass.)
5. **Shop by Fibre** — category tiles from `/categories/tree`, each a tilting 3D card with the category image.
6. **Best Sellers / Featured / New** — rendered from `/home-sections/resolved` in the exact order and titles the admin configured.
7. **Upcoming Products** — §9. Place it high (right after the first home section) since it's a headline client requirement.
8. **Brand story block** — full-bleed media from `/site-media`, parallax layers, scroll-scrubbed text reveal.
9. **Lookbook** — masonry gallery from `/site-media`, images scale + tilt to cursor, click opens a lightbox.
10. **Offers strip** — `/coupons/active`, glass coupon cards with a tear-off dashed edge, tap-to-copy code.
11. **Recommendations** — `/recommendations/home`.
12. **Newsletter + footer** — footer with shop details from `settings.shop`, policy links, socials, and the WhatsApp CTA.

---

## 6. DESIGN SYSTEM — follow this exactly

The reference site (knittinghappiness.com) is a clean Shopify store. **We are going three levels above it**: a dark, cinematic "dye house at night" world where the product colour is the only saturated thing on screen. No cream-and-terracotta editorial template, no generic dark-mode-with-one-neon-accent. This is warm, deep, and tactile.

### 6.1 Palette (define as CSS variables + Tailwind theme tokens)
```
--ink        #0D0A12   /* base — deep aubergine-black, the dye vat */
--ink-2      #171220   /* raised surfaces */
--fleece     #EFE7DA   /* primary text on dark — raw undyed wool */
--fleece-dim #A79C8E   /* secondary text */
--madder     #C6402E   /* madder-root red — primary accent, CTAs */
--marigold   #E9A93C   /* marigold — highlights, badges, prices */
--indigo     #3C4FA0   /* indigo vat — links, focus rings, cool accent */
```
Gradients: `--dye-flow: linear-gradient(120deg, var(--indigo), var(--madder) 55%, var(--marigold))` — used only for the thread, focus glows and the hero light, never for large fills.

Light sections exist too — use `--fleece` as background with `--ink` text for the Lookbook and the policy pages, so the page breathes and the dark sections feel intentional.

### 6.2 Typography
- **Display:** `Fraunces` (variable, use optical size + soft `wonk` axis) — headlines only, tight tracking `-0.03em`, weights 300 and 600, huge sizes (clamp 3rem → 7rem).
- **Body:** `General Sans` (Fontshare) — 400/500, `line-height: 1.6`.
- **Utility/data:** `JetBrains Mono` — prices, SKU, gauge, weight, ply, stock counts, order ids. Uppercase, `letter-spacing: 0.08em`, small sizes. This mono-for-numbers rule is what makes the whole site read as engineered rather than templated.

Type scale: 12 / 14 / 16 / 18 / 22 / 28 / 38 / 52 / 72 / 104 px, clamped fluidly.

### 6.3 Liquid glass — build one primitive, use it everywhere
Create `<Glass>` with variants `panel | card | pill | sheet`. Implementation:
```css
background: linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.03));
backdrop-filter: blur(22px) saturate(160%);
border: 1px solid rgba(255,255,255,.14);
box-shadow: 0 1px 0 rgba(255,255,255,.20) inset,
            0 -1px 0 rgba(0,0,0,.35) inset,
            0 24px 60px -20px rgba(0,0,0,.7);
border-radius: 22px;
```
Plus a **specular highlight** pseudo-element that follows the cursor: a radial white gradient at ~8% opacity positioned by CSS vars `--mx/--my` updated on pointermove (throttled to rAF). This is the "liquid" part — the glass catches light as the mouse moves across it. Add a very subtle SVG `feTurbulence` displacement layer at low opacity on large panels only, for a refracted edge.

Rules: never nest glass inside glass. Never put glass on a flat background — there must be colour or media behind it or the effect is invisible. Always keep text contrast ≥ 4.5:1 (add a solid-ish inner scrim behind text where needed).

### 6.4 Motion tokens
- Easing: `cubic-bezier(.22,1,.36,1)` for entrances, `cubic-bezier(.65,0,.35,1)` for movement.
- Durations: micro 180ms, standard 420ms, cinematic 900ms.
- Stagger 60ms between siblings.
- Everything wrapped in a `useReducedMotion()` guard.

### 6.5 The one aesthetic risk (the signature)
**"The Thread."** A single continuous strand of yarn unspools from the 3D ball in the hero and runs down the entire page as an SVG path whose `stroke-dashoffset` is scrubbed by scroll progress. It weaves *behind* section headings and *in front* of media edges, its colour shifting along `--dye-flow` as it descends, and at the footer it knits itself into the Royal Wool wordmark. It doubles as the scroll-progress indicator, so it earns its place instead of being decoration. Build it as a fixed-position SVG overlay with `pointer-events: none`, path recalculated on resize from anchor elements (`data-thread-anchor`) placed in each section.

---

## 7. 3D & ANIMATION SPEC

### 7.1 Hero (react-three-fiber)
A slowly rotating **3D yarn ball** — a sphere with a procedurally wound yarn look: use an instanced/tube-geometry winding of ~120 strands over a sphere with a fuzzy fibre effect (soft rim light + a light fresnel shader + subtle normal noise for fibre texture). Two point lights (warm marigold key from upper-left, cool indigo rim from behind-right), soft contact shadow, `Environment preset="city"` at low intensity.
Interactions:
- Ball tilts toward the cursor (damped lerp, max 12°), no OrbitControls.
- Idle: continuous slow Y rotation + a gentle breathing scale.
- On scroll: ball drifts up-right, scales down, and hands the thread off to §6.5.
- Banner text/CTA from `/banners` sits on a glass panel to the left, with a per-slide crossfade + mask-reveal of the headline.
Load with `<Suspense>` and a poster-image fallback.

### 7.2 Scroll choreography (GSAP ScrollTrigger + Lenis)
- Section headings: mask-reveal per line, `y: 40 → 0`, blur `8px → 0`.
- Cards: staggered rise with 3D perspective (`rotateX: 8deg → 0`).
- Pinned scroll-scrub sequence in the brand-story block: 3 layers moving at different depths.
- Horizontal-scroll rail for one home section (pinned, scrubbed).
- Numbers (customers served, colours available) count up on enter.
- A grain/noise overlay at 3% opacity over the whole page for filmic texture.

### 7.3 Cursor
Custom cursor: a small **crochet-hook glyph** with a trailing dot that lags with spring physics. States: default, `hover-link` (dot expands into a ring), `hover-product` (ring shows "View"), `hover-drag` (arrows), `hover-image` (magnifier). Hide entirely on touch devices and under reduced-motion. Nearby thread segments and glass highlights react to the cursor position.

### 7.4 Product card + PDP 3D
- **Cards:** 3D tilt on pointer-move (max 10°, spring return), image parallax inside the frame, second image crossfades on hover, glass footer bar slides up with price + quick-add. Wishlist heart with a small burst animation.
- **PDP:** left = a 3D yarn-ball viewer (drag to rotate, the ball's material colour tweens to the selected swatch `hex`) with a toggle to switch to the real product photo gallery (zoom on hover, thumbnail rail, lightbox). Right = a sticky glass buy-panel: title, brand, mono price block with strike-through MRP + discount badge, colour swatches, size pills, qty stepper, Add to bag, Buy now, wishlist, delivery estimate (from settings + pincode input), returns line from `settings.return_window_days` and product `returnable`, and a WhatsApp "Ask about this yarn" link that prefills the product title and URL.
- Below: description, specs table (mono), reviews with histogram + photos + helpful votes, `/recommendations/similar/{id}` rail.

### 7.5 Micro-interactions
Add-to-cart flies a small yarn-ball into the cart icon which then wobbles. Cart drawer slides as a liquid-glass sheet with a spring. Toasts are glass pills entering from the bottom-right. Buttons have a light sweep on hover. Page transitions: a fabric-weave wipe (fast, ≤450ms) via framer-motion `AnimatePresence`.

### 7.6 Performance (non-negotiable)
- One WebGL canvas at a time; unmount off-screen canvases.
- `dpr={[1, 1.75]}`, `frameloop="demand"` where nothing animates continuously, pause rendering when the tab is hidden or the canvas is out of viewport (IntersectionObserver).
- On mobile (`< 768px`) **or** low `hardwareConcurrency` **or** `prefers-reduced-motion`: replace the hero/PDP 3D with a high-quality still image + CSS parallax. The site must still feel premium without WebGL.
- Lazy-load all 3D and Razorpay code via dynamic import. Route-level code splitting. All product images lazy with blur-up placeholders and `aspect-ratio` boxes to prevent CLS.
- Target Lighthouse ≥ 90 performance on desktop, ≥ 75 on mobile.

---

## 8. WHATSAPP INTEGRATION (client requirement)

Number: **+91 8910792214** → link format `https://wa.me/918910792214?text=<encoded>`

Place it in four spots:
1. **Floating action button**, bottom-right above the chat launcher: a glass circle with the WhatsApp mark, a soft breathing pulse, and a tooltip "Chat with us". Appears after 600px of scroll. Never overlaps the cart drawer or the AI chat panel — stack them vertically with clear spacing.
2. **PDP** — "Ask about this yarn" — prefill: `Hi Royal Wool, I'd like to know more about "<product title>" — <product URL>`
3. **Sold-out / Upcoming products** — "Notify me on WhatsApp" — prefill: `Hi Royal Wool, please notify me when "<product name>" is available.`
4. **Footer + Contact page** — number shown as plain text and as a link, next to `settings.shop.phone` and `settings.shop.email`.

All links `target="_blank" rel="noopener"`, with `aria-label`s.

---

## 9. UPCOMING PRODUCTS SECTION (client requirement — build carefully)

The client wants a dedicated **Upcoming Products** showcase for these six ranges:

1. **Acrylic Rainbow**
2. **MultiTone Acrylic**
3. **CloudCotton**
4. **Aroma Cotton**
5. **TwistTone Cotton**
6. **Exclusive Acrylic**

**Data strategy — keep it admin-controllable without touching the backend:**
- On load, fetch `/categories/tree` and look for a category whose slug or name matches `upcoming` (case-insensitive). If found, fetch `GET /products?category_id=<that id>` and render those products — so the admin can manage the section from the existing panel by adding products to an "Upcoming" category.
- Also check `GET /site-media` for a section keyed `upcoming` and use those images/videos as the section's visuals if present.
- **If neither exists**, render the six ranges from a local constant `UPCOMING_FALLBACK` in `src/data/upcoming.ts`, each with `{name, blurb, palette: string[]}` — write short, specific one-line blurbs in the brand voice (e.g. Acrylic Rainbow → "One ball, seven gradients. Self-striping without changing yarn."). Structure the file so swapping to live API data later is a one-line change.

**Presentation:** a horizontally-scrolling pinned rail of six tall glass cards. Each card holds a small 3D yarn ball whose material colours are drawn from that range's palette (Acrylic Rainbow cycles through a gradient, MultiTone shows a two-tone twist, CloudCotton is matte and fluffy, TwistTone shows a visible ply twist). Each card carries a mono `COMING SOON` eyebrow, the range name in Fraunces, the blurb, and a "Notify me on WhatsApp" button (§8.3). Cards enter with a stagger and tilt to the cursor.

---

## 10. CART, CHECKOUT & ORDERS

**Cart drawer** (glass sheet, opens from the right): line items with thumbnail, colour + size, qty stepper (clamped to available stock), remove with undo toast, subtotal, coupon block from `/coupons/applicable`, "Add ₹X more for free delivery" progress bar from settings, `/recommendations/cart` rail at the bottom, and a sticky checkout button.

**Checkout page** — three glass steps on one page, with the thread as the progress line:
1. **Address** — saved addresses (localStorage) as selectable glass cards + "Add new" form with pincode validation, phone validation (10 digits), and "use my location" for lat/lng.
2. **Payment** — Online (Razorpay) or COD. Call `/orders/cod-availability` and disable COD with the returned reason when blocked. Re-quote when the method changes (COD may add a fee).
3. **Review** — the bill exactly as `/orders/quote` returns it: item total, discount, delivery, tax, grand total. Place Order.

Guard against double-submit. Show a full-screen glass "placing your order" state. Clear the cart only after a confirmed order.

**Order success page:** a knitting-stitch animation drawing the order number, order summary, estimated delivery, track/cancel actions, continue-shopping CTA.

**Orders list/detail:** status timeline (placed → confirmed → packed → shipped → delivered) drawn as a thread being knitted; cancel button within the window; return/exchange CTA when eligible; invoice-style breakdown in mono.

---

## 11. ERROR, EMPTY & LOADING STATES

- Every list has a designed empty state with an illustration and one clear action ("Your bag is empty — Browse yarns"). No blank screens.
- Errors are specific and actionable, in the interface's voice, never apologetic: "Couldn't load this collection. Retry."
- Skeletons match the final layout exactly (same aspect ratios, same grid).
- A cold-start banner: if the first request takes >6s, show "Waking up the store…" so slow Render boot never looks broken.
- Global error boundary with a 3D-ball-unravelling illustration and a reload button.

---

## 12. SEO, A11Y, POLISH

- `react-helmet-async` per route: title, description, canonical, OG image (product image on PDP).
- JSON-LD `Product` + `AggregateRating` on the PDP, `Organization` + `WebSite` on home.
- Semantic HTML, one `h1` per page, alt text on every image, skip-to-content link, focus trap in dialogs/drawers, `aria-live` for cart and toast updates, full keyboard operability including the search overlay (⌘K / Ctrl+K, Esc to close, arrows to navigate).
- Favicon + web manifest + a branded 512px OG image.

---

## 13. BUILD ORDER

Work in these phases and keep the app runnable at the end of each:
1. Scaffold, Tailwind theme + design tokens, fonts, `<Glass>` primitive, Lenis, cursor, layout shell (header/footer), routing.
2. API layer: axios instance, interceptors, typed response normalizers, react-query setup, settings context, auth store.
3. Auth: login, 3-step signup, protected routes, `/auth/me`, profile.
4. Catalog: home (banners + `/home-sections/resolved` + categories), listing, search with filters, PDP with variant logic.
5. 3D: hero ball, PDP viewer, card tilt, the Thread, scroll choreography.
6. Commerce: cart store + drawer, coupons, quote, checkout, Razorpay, orders, cancel, returns.
7. Engagement: wishlist, reviews + photo upload, notifications, AI chat, offers, WhatsApp, Upcoming section.
8. Polish pass: empty/error/loading states, mobile pass, reduced-motion pass, performance pass, SEO, a11y audit.

At the end of each phase, list what you built and what remains, and flag anything the API didn't support so the client can decide.

---

## 14. ACCEPTANCE CHECKLIST — verify all before you say you're done

- [ ] Zero calls to admin endpoints from the customer site.
- [ ] No Supabase/Firebase; all data from `VITE_API_BASE_URL`.
- [ ] Currency, tax, delivery rules, cancel window and return window all read from `/settings`.
- [ ] Home layout is driven by `/home-sections/resolved` and `/banners` — the admin can change the homepage without a code change.
- [ ] Colour-variant pricing/stock/images/sizes override product-level values correctly.
- [ ] Bill totals are never computed client-side — always from `/orders/quote`.
- [ ] Full signup OTP flow works; token persists across reload; 401 clears session cleanly.
- [ ] Razorpay success path completes `/orders/verify`; failure path is recoverable.
- [ ] COD respects `/orders/cod-availability`.
- [ ] Upcoming Products section renders all six ranges with WhatsApp notify CTAs.
- [ ] WhatsApp FAB works and doesn't overlap the chat launcher or cart drawer.
- [ ] Liquid-glass, cursor, scroll and 3D effects present on desktop; graceful non-WebGL fallback on mobile.
- [ ] `prefers-reduced-motion` disables all heavy motion.
- [ ] Perfect at 360px, 768px, 1280px, 1920px.
- [ ] No console errors; no layout shift on image load.

---

**Start now.** Begin with Phase 1 and show me the design tokens + layout shell before continuing.

Referral website : https://knittinghappiness.com/

besi al fal token urabi na

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://royal-yarn-threads.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/98ac7b66-3091-4c69-b56d-fa930358de68).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
