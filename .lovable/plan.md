## Goal

Homepage-e `The shade deck`-er por footer porjonto joto section ache — sob bad. Tar jaygay ekta **Featured Yarn** section: background-removed yarn cutouts, prottek tar niche name + price, dane theke bame nijei chole (auto marquee) ebong drag-o kora jay. Puro data admin/backend theke dynamic.

## 1. Ja remove hobe (`src/routes/index.tsx`)

Shade deck (`<YarnFanCarousel />`)-er niche theke:
- `<ProductRail anchor="bestsellers" ... />` — Best sellers
- `<UpcomingRail />`
- `<SectionStub>` × 3 (lookbook, offers, recs) + `SectionStub` function + oi unused imports

Shade deck-er porei `<FeaturedYarn />`, tar por footer.

## 2. Cutout images (background removed)

Client-er 9ta yarn photo (`src/assets/yarn/*.jpg`) theke transparent PNG cutout banabo — prottekta pic-er background sorie sudhu skein-ta thakbe, tarpor CDN asset hisebe upload kore `src/assets/yarn-cutout/*.png.asset.json` pointer-e rakhbo. Fallback data-tei ei transparent version-gulo use hobe, tai product-gulo page background-er upor bhasche mone hobe (no box, no card edge).

## 3. Notun `src/components/commerce/featured-yarn.tsx`

- **Data (dynamic):** `productsQuery({ sort: "popular", limit: 12 })` (existing API client) theke live products — image `primaryImage(p)`, name `p.title`, price `displayPrice(p)` + struck price, link `/product/$id`. Backend-e ekhon jehetu wool product nei, ekta `PREFER_LOCAL_IMAGES` flag (jemon `CategoryShowcase`/`YarnFanCarousel`-e ache) local cutout + `src/data/featured-yarn.ts`-er name/price dekhabe; admin panel theke product add holei flag off korlei automatic live data. Price INR format-e (`₹ 1,240` style, `Intl.NumberFormat`).
- **Motion:** duplicated track diye seamless right→left marquee (Framer Motion loop, ~40s), hover-e slow, drag-e user nijei ghurate parbe (drag chharle abar auto chalu). Touch tap-e freeze hobe na (mouse hover-only pause — shade deck-e ei bug already fix kora ache). `useReducedMotion` true hole marquee off, simple horizontally scrollable row.
- **Premium look:** prottek item — cutout image ekta soft radial dye-glow + niche elliptical contact shadow-er upor bhaseche; hover-e image slightly upore uthe + scale, glow tibro hoy, specular sheen sweep kore. Niche `font-display` name ar `font-data` price. Dupashe fleece-colour edge fade mask jate track edge-e mishe jay.
- Header: `font-data` eyebrow (`05 · Featured`), `font-display` heading "Featured yarn", short copy + "View all" link → `/collections`. Section-e `data-thread-anchor="featured"`.

## 4. Technical notes

- Sudhu design token (marigold, madder, ink, fleece, border) — kono hardcoded hex/`text-white` na.
- Marquee-r duplicate track `aria-hidden`, real items keyboard-focusable link.
- Verification: Playwright diye section screenshot (marquee-r 2ta position) + console/network check, ar production build.
