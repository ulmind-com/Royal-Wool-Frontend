# Mobile Bottom Nav — iOS-Style Liquid Glass (match video)

The video shows the iOS App Store tab bar: the pill is genuinely see-through — page content stays visible and blurred behind it, with only a faint white tint, a hairline rim, and a very soft shadow. Our current pill is still tinted too heavily and reads as frosted white.

## What changes

- Rework the glass treatment of the capsule in `src/components/layout/mobile-bottom-nav.tsx`:
  - Drop the white tint down so background content clearly shows through (roughly 25–35% white instead of ~60%).
  - Moderate blur with high saturation so colours behind the pill stay vivid, like iOS.
  - Thin hairline light rim (top brighter than bottom) instead of the current thick white border.
  - Much softer, tighter drop shadow — a low ambient shadow, not the current deep 80px stack.
  - Keep a subtle inner top highlight for the glass edge, remove the heavy inner bottom darkening.
- Make the active bubble glassy too: a soft translucent light bubble instead of the current solid grey gradient, so it reads as glass-on-glass like the video.
- Keep icons legible over the now-transparent glass (slightly stronger icon contrast where needed).

## Out of scope

No change to nav items, labels, routes, cart badge behaviour, layout/sizing, or anything above the nav. No separate search circle button.

## Technical notes

Single file: `src/components/layout/mobile-bottom-nav.tsx` — edit `LIQUID_GLASS_CONTAINER` and `LIQUID_GLASS_INDICATOR`.

- `backdropFilter: "blur(24px) saturate(190%)"`, written once (no hand-written `-webkit-` twin, which the production build would strip).
- Background: `linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.26) 100%)`.
- Border: `1px solid rgba(255,255,255,0.45)`; shadow: `0 8px 24px -8px rgba(15,12,20,0.18), inset 0 1px 0 rgba(255,255,255,0.7)`.
- Indicator: `rgba(255,255,255,0.55)` with a light inset highlight and `1px solid rgba(255,255,255,0.6)`.
- Verify with a Playwright pass at 375px width, scrolled so colourful product imagery sits behind the pill, confirming content shows through blurred.
