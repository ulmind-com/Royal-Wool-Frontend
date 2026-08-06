# Mobile Bottom Nav — Match the App Store Liquid Glass Exactly

The screenshots show Apple's App Store tab bar, and it differs from our current nav in specific, visible ways:

- The bar is a **bright, nearly-white pill** — not a heavily transparent lens. Only a faint hint of the page shows through.
- There is a **separate circular search button** floating to the right of the pill, with the same glass material.
- Each item shows an **icon with a text label under it** (Today / Games / Apps / Arcade).
- The active item is a **raised glass blob that bulges past the pill outline** — taller and wider than the pill's inner height, with its own bright rim, so it reads as a droplet sitting on the bar.
- Active item is **tinted blue**; inactive icons are solid black glyphs.
- Mid-transition the blob **smears the icons it passes over** (the third screenshot shows "Apps" stretched and colour-fringed).

## What changes

1. **Material**: raise the pill tint back to near-white frosted (high white opacity, moderate blur) instead of the current 26% see-through lens. Soft, tight ambient shadow. Thin bright rim.
2. **Layout**: split into a 4-item pill (Home, Shop, Cart, Profile) plus a **separate circular Search button** to its right, matching the reference composition. Both share one glass style.
3. **Labels**: add small labels under each icon, active label tinted with the brand accent.
4. **Active blob**: replace the inset rounded-rect bubble with a larger rounded blob that overflows the pill vertically and horizontally (pill gets `overflow-visible`), with its own brighter glass fill, rim highlight and soft outer glow.
5. **Refraction smear**: as the blob travels, the icon under it is scaled/blurred slightly and given a faint chromatic fringe, so passing items distort like in the reference. Implemented with a per-item distance-to-blob value driving scale/blur/hue, not a full WebGL pass.
6. **Motion**: keep the spring travel plus a short stretch-and-settle on the blob.

## Out of scope

No route, cart, or state logic changes. Nothing above the nav changes. Desktop header untouched.

## Technical notes

Single file: `src/components/layout/mobile-bottom-nav.tsx`.

- Container: white gradient around `rgba(255,255,255,0.72) → 0.62`, `backdrop-filter: blur(30px) saturate(180%)`, `1px solid rgba(255,255,255,0.75)`, shadow `0 10px 30px -10px rgba(15,12,20,0.22)`. Written once, no hand-written `-webkit-` twin.
- Search circle: same style object, fixed `56px`/`60px` square, `rounded-full`, `ml-2`.
- Pill changes from `grid-cols-5` to `grid-cols-4`; `overflow-hidden` becomes `overflow-visible` so the blob can bulge, and decorative rim/sheen layers keep their own clipped wrapper.
- Blob: `layoutId` motion.div sized ~`72×56` with `rounded-[26px]`, `z-0`, brighter fill + inset top highlight + `0 6px 18px -6px` outer shadow; spring `stiffness 380 / damping 26 / mass 0.9` plus `scaleX/scaleY` settle keyframes.
- Smear: track active index in state; each item computes `Math.abs(index - activeIndex)` and applies `blur(0.6px) scale(1.06)` + slight `hue-rotate` while a transition flag is true (cleared on `onLayoutAnimationComplete`).
- Verify with a Playwright pass at 375px on `/collections`, capturing the nav element in idle and mid-transition states.
