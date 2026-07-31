## Royal Wool — Phase 1: Design tokens + layout shell

Scope this round: the visual foundation and navigational skeleton only. No API data wiring, no 3D, no commerce (those are Phases 2–8). At the end, every route in §4 exists and the site looks like the "dye house at night" world — reviewable before I go further.

### Confirmed decisions
- Router: TanStack Router file routes (react-router-dom is not available on this stack). Same URLs as your spec. SEO uses each route's `head()` instead of react-helmet-async.
- Razorpay: nothing added now. In Phase 6 I'll read the key from the `POST /orders` response if present, else fall back to `VITE_RAZORPAY_KEY_ID` with a TODO. No secret ever in the frontend.
- No Supabase/Firebase. All future data comes from `VITE_API_BASE_URL`.

### Backend reality check (verified live, 200 OK)
- `/settings` returns `currency ₹`, `tax_rate 0.05`, `cancel_window_hours 24`, `return_window_days 7`, `cod.enabled: false`, `delivery.free_above 1500`, `free_radius_km 3`, `per_km_rate 8`, `base_fee 20`.
- `shop.name` is **"Clothing Store"**, `shop.phone` is `+919999999999`, `shop.email` is empty.
- `/categories/tree` currently returns **Mens / Jeans / T-Shirts** — a clothing catalog, not yarn.

Consequences the client needs to decide on (I'll build correctly against the API either way): the site will read "Clothing Store" in the footer and show clothing categories in the mega-menu until the admin panel is re-seeded with yarn categories/products; COD will render disabled until `cod.enabled` is turned on. I will not hardcode "Royal Wool" over `settings.shop.name` — brand name in the logo/wordmark only.

### What Phase 1 builds

**1. Design tokens (`src/styles.css`)**
- Palette as CSS vars converted to oklch: `--ink #0D0A12`, `--ink-2 #171220`, `--fleece #EFE7DA`, `--fleece-dim #A79C8E`, `--madder #C6402E`, `--marigold #E9A93C`, `--indigo #3C4FA0`, plus `--dye-flow` gradient.
- Mapped into `@theme inline` so `bg-ink`, `text-fleece`, `text-marigold`, `ring-indigo` etc. work. Dark is the default surface; shadcn semantic tokens (`--background`, `--primary`, `--ring`…) re-pointed at the palette so every primitive inherits the brand instead of default shadcn.
- Fluid type scale (12→104px, clamped), radius scale, motion tokens (`--ease-enter .22,1,.36,1`, `--ease-move .65,0,.35,1`; 180/420/900ms).
- Fonts via `<link>` in `__root.tsx` head: Fraunces (display, variable), General Sans from Fontshare (body), JetBrains Mono (data). Registered as `--font-display / --font-sans / --font-mono`.
- `.light-section` utility that flips to `--fleece` bg + `--ink` text for Lookbook and policy pages.
- Grain overlay utility at 3% opacity.

**2. `<Glass>` primitive** (`src/components/ui/glass.tsx`) with `panel | card | pill | sheet` variants — exact gradient/blur/inset-shadow recipe from §6.3, plus a cursor-following specular highlight driven by `--mx/--my` updated on a throttled rAF pointermove, and an optional `feTurbulence` refraction layer for large panels. Guarded by reduced-motion. Text contrast kept ≥4.5:1 via an inner scrim option.

**3. Motion + input foundations**
- `useReducedMotion()` hook; every effect below reads it.
- Lenis smooth scroll provider, GSAP registered with ScrollTrigger and synced to Lenis' ticker (setup only; choreography lands in Phase 5).
- Custom crochet-hook cursor with spring-lagged trailing dot and `default / hover-link / hover-product / hover-drag / hover-image` states via `data-cursor` attributes. Hidden on touch and under reduced motion.
- `framer-motion` `AnimatePresence` page-transition wrapper (fabric-weave wipe, ≤450ms).

**4. App shell**
- Sticky header: wordmark, mega-menu (static placeholder columns this phase, swapped to `/categories/tree` in Phase 4), ⌘K search trigger, wishlist, notifications bell, account, cart badge. Transparent → frosted glass on scroll.
- Announcement ticker marquee above it (copy placeholder until settings context lands).
- Footer: shop details slots, policy links, socials, WhatsApp CTA.
- WhatsApp FAB: glass circle, breathing pulse, tooltip, appears after 600px scroll, stacked above the future chat launcher with reserved spacing so nothing overlaps.
- Skip-to-content link, visible focus rings, one `h1` per page.

**5. Routes (all of §4, real files, designed placeholders)**
`/`, `/collections`, `/collections/$slug`, `/product/$id`, `/search`, `/upcoming`, `/cart`, `/checkout`, `/order/$id/success`, `/account`, `/account/orders`, `/account/returns`, `/account/wishlist`, `/account/notifications`, `/offers`, `/about`, `/contact`, `/faq`, `/shipping`, `/returns-policy`, `/terms`, `/privacy`, `/login`, `/signup`, and a 404. Each gets its own `head()` with unique title/description/og tags. `/` gets a styled hero-shell block (dark, Fraunces headline, glass panel) so the design direction is judgeable — the 3D ball slots into it in Phase 5.
- Protected-route gate for `/account/*` and `/checkout` is stubbed with the redirect-to-`/login?next=` shape, activated in Phase 3.
- Static legal/about copy written now (the only permitted hardcoded content besides the Upcoming fallback).

**6. Deliverable at end of phase**
A runnable site: every route reachable, glass/cursor/scroll/type system visible, no console errors, correct at 360 / 768 / 1280 / 1920. I'll list what's done and what's next, then wait for your review.

### Technical notes
- Tailwind v4 CSS-first: tokens in `src/styles.css` under `@theme inline`; no `tailwind.config.js`. Fonts loaded by `<link>`, never `@import` of a URL.
- Packages to add: `three`, `@react-three/fiber`, `@react-three/drei`, `gsap`, `framer-motion`, `lenis`, `zustand`, `axios`. (`@tanstack/react-query` already present.) 3D packages installed now but only dynamically imported from Phase 5 onward, so Phase 1 ships no WebGL bundle.
- `.env` created with `VITE_API_BASE_URL=https://royal-wool-backend.onrender.com` and `VITE_WHATSAPP_NUMBER=918910792214`, with hardcoded non-secret defaults in code so the preview never breaks.
- TypeScript strict; no `any`.
