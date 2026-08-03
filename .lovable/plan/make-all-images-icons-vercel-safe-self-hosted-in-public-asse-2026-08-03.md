# Make all images/icons Vercel-safe (self-hosted in `public/assets`)

Right now 56 images/videos live on Lovable's CDN (`/__l5e/assets-v1/...`) via `.asset.json` pointer files. That path only exists on Lovable hosting — on Vercel every one of those images/icons would 404. Fix: download all of them into `public/assets/**` and point the app at the local paths.

## What changes

1. Download all 56 CDN files into `public/assets/`, mirroring the current folders:

```text
public/assets/hero/        hero-1..3, royal-wool-banner
public/assets/about/       about-hero.jpg, about-hero.mp4, about-story.jpg, 4 ink icons
public/assets/assurance/   secure, delivery, baby, quality
public/assets/spec/        8 spec icons
public/assets/contact/     hotline, whatsapp, email, location, hours
public/assets/blog/        featured + p1..p9
public/assets/yarn/        9 shade photos
public/assets/yarn-cutout/ 9 transparent skeins
public/assets/categories/  (already local, unchanged)
```

2. Rewrite each `.asset.json` `url` field to its new local path (e.g. `/assets/contact/email.png`). Every component already imports the pointer and reads `.url`, so no component/data file needs editing — one field per pointer, ~56 edits, zero risk of a missed reference.

3. Keep the pointer files (they stay valid JSON with `url`, `content_type`, `size`), so nothing about the import style changes and the CDN copies remain intact for the Lovable preview.

4. Verify: build the project, then grep the whole `src/` tree and `public/` for any remaining `/__l5e/` reference outside of harmless legacy handling, and check the fallback URL normalizer in `src/components/commerce/review-card.tsx` still accepts `/assets/...` (it does).

## Notes on size

The three hero PNGs are ~2.2–2.6 MB each and the yarn cutouts ~1 MB. Committed as-is they'd make the repo ~20 MB and slow first paint on Vercel. I'll re-encode the large photos/heroes to WebP (visually identical, ~10x smaller) and keep the transparent PNG icons as PNG, updating pointer filenames accordingly. The `.mp4` stays as-is.

## Also for Vercel

Add `vercel.json` with a SPA/SSR-safe config for TanStack Start so deep links (`/product/123`, `/blog/slug`) don't 404, and confirm the API base URL for the Render backend comes from an env var (`VITE_API_BASE_URL`) rather than a hardcoded host, so you can set it in Vercel's dashboard.
