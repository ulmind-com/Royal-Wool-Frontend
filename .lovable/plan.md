## Goal
Replace the still image in the About hero with the uploaded clip, looping in the exact same framed shape — same rounded corners, hairline border, shadow and gradient veil.

## Approach
1. Upload the clip via `lovable-assets` → `src/assets/about/about-hero.mp4.asset.json`. (Both uploads are byte-identical, so only one clip is used; it loops seamlessly.)
2. In `src/components/about/about-hero.tsx`, swap the `<img>` for a `<video>` inside the existing framed `motion.div`:
   - `autoPlay muted loop playsInline preload="metadata"`
   - `poster={heroImage.url}` so the existing photo shows while the video buffers (no layout jump, no blank frame)
   - identical classes: `h-[300px] sm:h-[380px] lg:h-[520px] w-full object-cover object-center`
   - keep the gradient overlay and entrance animation as-is
   - clip is vertical 720x1280, so `object-cover` crops to the frame — kept centred
3. Reduced motion: when `useReducedMotion()` is true, render the existing still image instead of the video (no autoplay).
4. Keep `about-hero.jpg` in place — it becomes the poster/fallback.

## Not changing
Values band, story section, copy, metadata, and every other page.

## Verification
Build, then load `/about` in the preview at desktop and mobile widths to confirm the video plays muted on loop inside the framed shape.
