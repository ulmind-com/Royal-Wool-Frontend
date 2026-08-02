## Goal

Footer-er upore review section-ta ekhon dekhachhe na karon backend-e ekta-o review nei. Ekta dummy/seed review set add korbo jate section-ta ekhoni pro-level design-e dekhа jay — ar backend-e asol review dhuklei dummy gulo nije-nijei chole jabe.

## What to build

1. **New file `src/data/demo-reviews.ts`**
   - 9-10 realistic yarn reviews: name, 1-5 rating, short + long comments (jate masonry-te card height alada alada lage), kichu review-e photo (existing `public/assets/` / `src/assets/yarn` images use korbo), product name (Cotton Candy, Cotton Delight, Hobby India, Aroma Cotton), ar different dates (Today theke koyek mash age).
   - Same normalised `Review` shape use korbe, tai UI-te kono change lagbe na.

2. **`src/lib/api/reviews.ts` — fallback add**
   - Fetch-er sesh-e: jodi API theke 0 ta review ase, tokhon demo reviews return korbe (ekta `isDemo: true` flag songe).
   - API-te ek-ta review thaklei demo data pray-e bad — ekta line-o mix hobe na.

3. **`src/components/commerce/customer-reviews.tsx`**
   - Demo mode-e ekta chhoto honest label: "Sample reviews — real customer reviews will appear here automatically" (font-data, muted, small). Chaile eta baad-o dite pari.
   - Baki filter / see-more / lightbox / breakdown sob age-r motoi kaj korbe.

## Technical notes

- Demo data-r photo path resolve howa dorkar tai relative `/assets/...` path use korbo (`resolveMedia` already handles it) — noy imported asset URL.
- `count === 0` hole section null return kore, sei guard-ta demo fallback-er por-e ache tai section always render korbe.
- Verify: Playwright diye home page-e section screenshot niye check korbo.
