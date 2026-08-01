## Goal

The 4 yarn-ball photos should live in the project's `public/assets` folder (as plain files, served by path) and be used by the "Shop by Category" section. As soon as the admin panel provides a category image, it takes over automatically.

## What changes

1. **Copy the images into `public/assets/categories/`**
   - `yarn-red.jpg`, `yarn-pink.jpg`, `yarn-green.jpg`, `yarn-yellow.jpg`
   - Served at `/assets/categories/yarn-red.jpg` etc.

2. **Point the category section at those paths**
   - In `src/components/commerce/category-showcase.tsx`, replace the four `.asset.json` imports with a plain array of `/assets/categories/...` paths.
   - Keep the existing logic unchanged: `category.image ?? fallback[index % 4]` — so any admin-uploaded image wins, and the fallbacks just fill the gaps.

3. **Remove the now-unused CDN pointers**
   - Delete `src/assets/cat-fallback-{1..4}.jpg.asset.json` (and their CDN objects) so there's only one source of truth for these photos.

4. **Verify**
   - Load `/` in a headless browser, confirm the 4 tiles render the photos from `/assets/categories/...` with no 404s, then screenshot.

## Notes

The section itself (dynamic count, order, names, links to `/collections/$slug`, hover/scroll animations) stays exactly as built — this change is only about where the fallback photos are stored.
