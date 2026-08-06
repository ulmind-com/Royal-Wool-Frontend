# Mobile Bottom Nav — Liquid Glass Capsule

Make the white mobile bottom nav capsule in the live preview look like liquid glass (frosted/translucent) instead of an opaque white pill.

## What changes

- Update `LIQUID_GLASS_CONTAINER` in `src/components/layout/mobile-bottom-nav.tsx`.
- Switch from the near-solid white gradient to a translucent white gradient with strong `backdrop-filter` blur and saturation.
- Keep the 1px white rim and soft drop shadow so the pill still floats above content.
- Preserve the existing 5-item layout, active bubble, icons, cart badge, and behavior.

## Also fix

- `src/components/cart/cart-drawer.tsx` is missing the `ShieldCheck` import, causing a build error. Add it to the `lucide-react` import line.

## Out of scope

No changes to nav items, routes, structure, icon states, or anything outside the capsule background and the missing import fix.

## Technical notes

- Use `backdropFilter: "blur(40px) saturate(220%)"` and `background: "linear-gradient(150deg, rgba(255,255,255,0.78) 0%, rgba(250,248,245,0.68) 100%)"`.
- Keep `border: "1px solid rgba(255,255,255,0.9)"` and a deeper soft shadow.
- Verify visually on the mobile preview.
