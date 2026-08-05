# Mobile Bottom Nav — Match Reference Shape

Update the mobile bottom navigation so the active state and overall capsule match the uploaded reference: a thick, near-solid white liquid-glass pill with a wide, rounded active bubble behind the icon and bold filled icons.

## What changes

- **Single 5-item pill**: fold Search back into the main capsule as the 4th item and Profile as the 5th, matching the reference layout (Home / Shop / Cart / Search / Profile). Remove the separate circular Search button.
- **Wide active bubble**: replace the current 46–52 px circular indicator with a wide, rounded-rectangle bubble (roughly 64–72 px wide × 40–46 px tall) that hugs the active icon like the reference.
- **Filled icons for active state**: use solid/filled Lucide variants when active (e.g. `Home` already fills, add filled feel for cart/shop/search/profile) and outlined/line variants when inactive, so the active icon pops against the grey bubble.
- **Thicker, more solid glass**: raise the pill background opacity closer to opaque white, keep strong blur/saturation, and add a crisp 1 px white rim plus a deeper soft shadow underneath. Increase pill height to ~64 px on small phones and ~72 px on larger phones.
- **Cart badge**: switch the badge to the reference style — bright red circular background with white number, white ring, slightly larger so it reads clearly.
- **Responsive**: keep the pill scaling cleanly from 320 px to 450 px+ using a 5-column grid, `min-w-0`, and flex-1 items. Active bubble width should scale down slightly on the smallest screens.

## Out of scope

No change to routes, nav labels, cart toggle behaviour, or anything above the nav.

## Technical notes

Single file: `src/components/layout/mobile-bottom-nav.tsx`.

- Edit `LIQUID_GLASS_CONTAINER` for a more opaque white gradient and stronger shadow.
- Replace `LIQUID_GLASS_INDICATOR` shape by changing the indicator `className` from `rounded-full` to `rounded-[22px]` (or responsive equivalent) and adjusting width/height classes.
- Update icon classes to use `fill-*` / `stroke-*` combinations for filled-vs-outline states.
- Keep `backdropFilter` written once (no hand-written `-webkit-` twin) so the production build keeps the standard property.
- Fix the existing indicator type issue if still present: type the indicator style as `MotionStyle` or let it infer.
- Verify visually at 320 / 375 / 430 px widths with a Playwright screenshot pass against the `/collections` route.
