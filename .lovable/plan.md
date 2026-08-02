## Goal

`Featured yarn`-er porei, footer-er upore — ekta full-bleed banner section. Kono heading, eyebrow ba copy na; sudhu upload kora image-ta.

## Ja hobe

1. **Asset**: upload kora banner-ta Lovable CDN asset hisebe rakhbo — `src/assets/royal-wool-banner.png.asset.json` (binary repo-te dhukbe na).
2. **Notun component** `src/components/commerce/brand-banner.tsx`:
   - `<section data-thread-anchor="banner">`, `aria-label` sudhu screen-reader-er jonno (visible text nei).
   - Image `max-w-[1600px]` container-e, `rounded-3xl overflow-hidden`, page-er soft border/shadow token diye — homepage-er baki section-er moto same gutter (`px-4 sm:px-6 lg:px-10`).
   - `w-full h-auto`, native `aspect-[1656/931]` reserve kore CLS avoid, `loading="lazy"`, descriptive `alt`.
   - Halka premium touch: view-e ele ekbar soft fade+rise (Framer Motion, `useReducedMotion` respect) — kono text/overlay na.
3. **Wire-up** `src/routes/index.tsx`: `<FeaturedYarn />`-er niche `<BrandBanner />`, tarpor footer.

## Note

Image-er lekha-te "Roya**all** Wool" ache (double 'a'/'l') — ami image edit korchi na, sudhu boste dilam. Chaile thik kora version generate kore dite pari.
