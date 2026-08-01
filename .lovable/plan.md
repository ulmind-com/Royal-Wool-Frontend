## Goal

Replace the four glass trust **cards** on the home page with a clean, borderless icon row — icon on top, bold title under it, one line of supporting copy below — matching the reference screenshot but in Royal Wool's own type and palette.

## Change (frontend only)

`src/routes/index.tsx` — the `TRUST` section:

1. **Drop the cards.** Remove `<Glass variant="card">`, `min-h-[9rem]`, borders and backgrounds. Each item becomes a plain centred stack on the page background.
2. **Layout.** 4-up on desktop (`grid-cols-4`), 2-up on tablet, 2-up on mobile with tighter type. Generous vertical rhythm (`py-14 sm:py-16`) and a hairline divider above/below the row so it reads as a deliberate trust band rather than floating text.
3. **Icons.** Keep the existing lucide icons (BadgeCheck, Baby, Truck, Heart) at a larger size (~28px), `strokeWidth={1.5}`, in `text-marigold`, centred. Optional subtle hover lift on the whole item.
4. **Typography.** Title in `font-display` (not the mono `font-data`) at `text-base sm:text-lg`, `text-foreground`; sub-line in `text-sm text-muted-foreground`, max-width constrained and centred so it wraps to at most two lines.
5. **Vertical hairlines** between columns on `lg` (`lg:divide-x divide-border/60`) for the premium editorial feel — omitted on mobile.
6. Keep the existing copy and `data-thread-anchor="trust"` / aria-label untouched. No `Glass` import removal issues elsewhere — it's still used by other sections in the file.

Note: the reference shows an OEKO-TEX badge and "60,000+ Customers". I'll keep your current wording/icons unless you want those exact claims swapped in.

## Verification

Playwright screenshots of `/` at 1280px and 390px confirming no clipping, even baselines, and readable two-line wraps.