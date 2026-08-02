## Goal

Under the shade swatches in the right column of the product page, show a premium "yarn spec sheet" (Fibre/Blend, Yarn Weight, Yarn Length, Needle Size, Crochet Hook Size, Needle Stitch, Crochet Stitch, Ball Weight) — inspired by the reference, but not a copy: a distinctly more refined, branded layout.

## Design direction (different from the reference)

Reference is 8 identical wide pink pills. Instead:

```text
┌── SPECIFICATIONS ───────────────────────────┐
│  ╭──────────────╮  ╭──────────────╮         │
│  │ ◆  FIBRE     │  │ ◆  WEIGHT    │         │
│  │  100% Acrylic│  │  4 Medium    │         │
│  ╰──────────────╯  ╰──────────────╯         │
│  ╭──────────────╮  ╭──────────────╮         │
│  │ ◆  LENGTH    │  │ ◆  BALL WT   │         │
└─────────────────────────────────────────────┘
```
- Two-column card grid on desktop, single column on mobile (grid + `min-w-0` + `shrink-0` per responsive rules).
- Each tile: soft cream/blush surface with a hairline border, a marigold hairline that animates on hover, a subtle lift on hover, and a small tinted circular medallion holding the icon.
- Label in `font-data` uppercase micro-tracking (muted), value in larger foreground text — inverted emphasis vs. the reference's bold label.
- Section gets a proper eyebrow heading ("Specifications") with a thin rule, sitting after the shade grid / weight selector.
- All colors via existing semantic tokens (marigold, madder, card, border, muted-foreground) — no hardcoded hex.

## Icon art

Generate 8 transparent-background PNG icon illustrations (yarn ball, weight gauge, tape measure, knitting needles, crochet hook, knit swatch, crochet swatch, kitchen scale) in a consistent hand-drawn ink line style matching the brand, register them via the asset CLI, and map them by spec id — replacing the current inline SVGs in the spec sheet. Existing inline SVGs stay in place for the trust band.

## Data

Fully dynamic — rows come from `productSpecs(product)`, which already reads `specs` / `attributes` / `meta` / flat fields from the API. No hardcoding per product. Rows the backend doesn't send are simply not rendered, so once you add these attributes in the admin panel they appear automatically.

## Files

- `src/components/commerce/spec-tiles.tsx` — rewritten layout + heading + hover states.
- `src/components/commerce/spec-icons.tsx` — add the generated-image icon map (keep the SVG set for trust band).
- `src/assets/spec/*.png.asset.json` — 8 new icon assets.
- `src/routes/product.$id.tsx` — reposition/spacing only, so the spec sheet sits directly under the shade grid.
