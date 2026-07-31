## Goal

Make Royal Wool a light/day-mode site only — no dark theme, no toggle. Same brand character (madder red, marigold, indigo accents), but on warm fleece-light surfaces.

## Approach

The palette already has a light variant: `.light-section` in `src/styles.css` (used today by lookbook/legal pages). Promote that mapping to the global default instead of inventing a new palette, so pages stay visually consistent.

### 1. `src/styles.css` (the bulk of the work)
- Repoint the semantic tokens in `:root` to the light mapping: `--background: fleece`, `--foreground: ink`, light `--card`/`--popover`/`--muted`/`--secondary`, dark-on-light `--border`/`--input`.
- Adjust accents for contrast on light: keep `--madder` as primary with light text, darken `--marigold` slightly where it is used as text (prices, eyebrows) so it passes contrast, keep `--indigo` for links/focus.
- Add light-appropriate elevation: soft warm shadows instead of relying on dark-surface separation.
- Make `.light-section` a no-op (it now matches the default) and add an optional `.ink-section` for any deliberately dark band we want to keep (e.g. footer or hero) — decided in step 3.
- Tune `grain` opacity/blend for light backgrounds (`overlay` at 3% reads as dirt on light; switch to `multiply` at ~2%).
- Set `color-scheme: light`, `<meta name="theme-color">` to the light background in `__root.tsx`.

### 2. Replace hardcoded dark-only color classes with semantic tokens
Files using literal `text-fleece` / `bg-ink` / `fleece-dim` that would become invisible or low-contrast on light:
`header.tsx`, `footer.tsx`, `announcement-ticker.tsx`, `whatsapp-fab.tsx`, `page-shell.tsx`, `glass.tsx`, `wake-gate.tsx`, `custom-cursor.tsx`, `product-card.tsx`, `product-rail.tsx`, `category-tiles.tsx`, and routes `index`, `product.$id`, `offers`, `search`, `collections.index`, `collections.$slug`, `upcoming`, `__root` (404 + error screens).
Mapping: `text-fleece` → `text-foreground`, `text-fleece-dim` → `text-muted-foreground`, `bg-ink`/`bg-ink-2` → `bg-background`/`bg-card`, cursor and glass specular highlights switch from light-on-dark to dark-on-light.

### 3. Glass + cursor rework for light
- `<Glass>`: the liquid-glass look is built on white-at-low-opacity over dark. On light it needs inverted treatment — translucent white with a subtle warm border and a soft shadow, and the specular highlight becomes a faint ink tint rather than a white glow.
- Custom cursor: hook glyph and ring recolor to ink/madder so it is visible.

### 4. Verify
Run the site in a headless browser across home, a category page, a PDP with variants, offers, cart/checkout, and one legal page; screenshot each and check for invisible text, blown-out glass panels, and console errors.

## Notes
One judgment call I'll make unless you say otherwise: keep the footer on the deep ink background as a grounding band (a common pattern for light sites) while everything above it goes light. Say the word if you want the footer light too.
