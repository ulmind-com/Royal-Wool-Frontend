Current `brand-banner.tsx` uses `object-contain` with `max-h` values. That keeps the whole artwork visible but creates empty left/right space (letterboxing) when the container is wider than the scaled image.

Goal: make the banner fill the full width with no side gaps, while staying compact in height and keeping the central text readable.

Plan:
1. In `src/components/commerce/brand-banner.tsx`:
   - Change `object-contain` to `object-cover` so the image always fills the width.
   - Remove `max-w-[1400px]` so the image can span the full section width.
   - Keep `object-center` to anchor the crop on the middle text/graphics.
   - Slightly lower the max-height values so the banner does not feel too tall.
2. Verify the preview shows the banner edge-to-edge with no letterbox bars and with the "Feel the softness..." text still visible.