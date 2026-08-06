# Mobile bottom nav — match the video's liquid glass

The video shows Apple's App Store tab bar: a floating capsule that looks like a real piece of glass. Content behind it is blurred and slightly *bent* at the edges, the rim catches light like a lens, and the active pill stretches and settles with a liquid spring when you tap. Our current capsule is only a flat frosted panel, so it reads thinner and more "web-like".

The nav layout stays exactly as it is — same 5 items (Home, Shop, Cart, Search, Profile), same order, same size. Only the glass material and the tap motion change.

## What changes

1. **Real lens material, not a flat frost**
   - Lower the white tint so background colour actually shows through, and push blur + saturation up so the yarn photos behind read as soft colour, exactly like the video.
   - Add a light-bending rim: a bright hairline on the top edge that fades out toward the bottom, plus a darker inner edge at the bottom. That top-lit / bottom-shaded pairing is what makes glass look thick instead of painted.
   - Add a faint diagonal specular sheen across the upper half of the capsule so it catches light as the page scrolls under it.

2. **Edge refraction**
   - A thin inner ring just inside the border, blurred and semi-transparent, so content near the capsule edge looks slightly distorted rather than cleanly cut — this is the single biggest reason the video looks like glass.

3. **Liquid active bubble**
   - The bubble keeps its position-sliding spring but gains a short squish: it stretches slightly along the direction of travel and settles back, giving the "liquid" feel from the video.
   - Bubble gets its own thinner glass treatment (brighter top rim, soft inner glow) so it reads as a second, smaller piece of glass sitting on the first.

4. **Legibility guard**
   - Because the tint drops, icon contrast is bumped slightly and the drop shadow under the capsule is deepened so the nav still separates from light backgrounds.

## Technical notes

- Single file: `src/components/layout/mobile-bottom-nav.tsx`.
- Replace `LIQUID_GLASS_CONTAINER` / `LIQUID_GLASS_INDICATOR` with layered styles: base translucent gradient + `backdrop-filter: blur(...) saturate(...)`, then absolutely positioned sibling layers inside the capsule for the rim highlight, the specular sheen, and the blurred refraction ring (all `pointer-events-none`, behind the buttons).
- Only write the standard `backdrop-filter` property — no `-webkit-` twin, since the production CSS build drops the standard one when both are present.
- Bubble squish via Framer Motion `layoutId` plus a spring on `scaleX`/`scaleY` returning to 1; no layout thrash.
- No structural, routing, or state changes; no other files touched.
