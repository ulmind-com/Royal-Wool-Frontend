# Mobile Bottom Nav — Clear Liquid Glass, No White

The reference image is a nearly clear glass capsule: you can see the flower straight through it, only slightly blurred and brightened, with a thin light rim catching the edge. Our nav pill is still a white frosted panel, so it reads as painted white plastic rather than glass.

## What changes

In `src/components/layout/mobile-bottom-nav.tsx` — the 4-item pill (Home, Shop, Cart, Profile) and the search circle share the same material, so both change together:

- Remove the white fill almost entirely. Keep only a very faint neutral tint so the page content behind shows through clearly, like the reference.
- Push blur up and add a slight brightness/saturation lift, which is what makes clear glass read as glass instead of a hole.
- Thin bright hairline rim only — brighter along the top edge, fading down the sides, with a faint bright line along the bottom inner edge (light passing through the far wall of the glass).
- Keep a soft, low ambient shadow under the capsule so it still floats, no heavy dark stack.
- Tone the specular sheen down to a single narrow diagonal streak instead of a broad white wash.
- The active blob becomes glass-on-glass: slightly brighter than the pill but still see-through, with its own hairline rim.
- Legibility guard: because the tint drops, icons and labels get stronger contrast (near-solid ink glyphs, active items in the brand accent) plus a very subtle text shadow so they stay readable over colourful yarn photos scrolling underneath.

## Out of scope

No changes to nav items, order, labels, routes, cart badge, sizing, motion behaviour, or anything above the nav. Desktop header untouched. The uploaded image is reference only, not added to the app.

## Technical notes

Single file: `src/components/layout/mobile-bottom-nav.tsx`.

- `LIQUID_GLASS_CONTAINER`: `background: "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.08) 100%)"`, `backdropFilter: "blur(28px) saturate(180%) brightness(1.06)"`, `border: "1px solid rgba(255,255,255,0.4)"`, `boxShadow: "0 8px 24px -10px rgba(15,12,20,0.22), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(255,255,255,0.3)"`.
- Write `backdrop-filter` once only — no hand-written `-webkit-` twin, since the production CSS build drops the standard property when both are present.
- `RIM_HIGHLIGHT`: keep the mask-composite ring but lower stops to ~`0.6` top / `0.22` bottom. `SPECULAR_SHEEN`: narrow band, peak ~`0.16`.
- `LIQUID_GLASS_BLOB`: fill `rgba(255,255,255,0.26) → 0.16`, `blur(14px) saturate(190%) brightness(1.08)`, rim `rgba(255,255,255,0.5)`.
- Icons: inactive `text-ink` at full strength with `drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]`; labels bumped from `text-ink/70` to `text-ink/90` with the same subtle halo.
- Verify with a Playwright pass at 375px on `/` and `/collections`, scrolled so colourful product imagery sits behind the nav, confirming content is visibly readable through the glass with no white slab.
