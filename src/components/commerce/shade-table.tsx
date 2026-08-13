import { Check, Minus, Plus, Search, ShoppingBag, X, ZoomIn } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { resolveMedia } from "@/components/commerce/review-card";
import type { ProductColor } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────────────────── */

export interface ShadeTableProps {
  /** Colour variants from the product's `colors` array. */
  colors: ProductColor[];
  /** Callback fired when user hits "Add to cart". Receives list of {color, qty}. */
  onBulkAdd: (items: { color: ProductColor; qty: number }[]) => void;
  /** Format a number as currency. */
  formatMoney: (n: number) => string;
  /** Base product price (fallback when a colour has no per-shade price). */
  basePrice: number;
  baseMrp: number | null;
}

/* ── Constants ─────────────────────────────────────────────────────── */

const FILTER_THRESHOLD = 8;

/* ── Component ─────────────────────────────────────────────────────── */

export function ShadeTable({
  colors,
  onBulkAdd,
  formatMoney,
  basePrice,
  baseMrp,
}: ShadeTableProps) {
  // ── Search ──
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return colors;
    return colors.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.shade_code ?? "").toLowerCase().includes(q) ||
        (c.color_family ?? "").toLowerCase().includes(q),
    );
  }, [colors, query]);

  // ── Selection state ──
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [quantities, setQuantities] = useState<Map<number, number>>(new Map());

  const getQty = (idx: number) => quantities.get(idx) ?? 1;

  const toggleOne = useCallback((idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const selectableIndices = useMemo(
    () => filtered.map((_, i) => colors.indexOf(filtered[i]!)).filter((ci) => (colors[ci]?.stock ?? 0) > 0),
    [filtered, colors],
  );

  const allSelected = selectableIndices.length > 0 && selectableIndices.every((i) => selected.has(i));

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      if (selectableIndices.every((i) => prev.has(i))) {
        // Deselect all visible
        const next = new Set(prev);
        for (const i of selectableIndices) next.delete(i);
        return next;
      }
      // Select all visible
      const next = new Set(prev);
      for (const i of selectableIndices) next.add(i);
      return next;
    });
  }, [selectableIndices]);

  const setQty = useCallback((idx: number, qty: number) => {
    setQuantities((prev) => {
      const next = new Map(prev);
      next.set(idx, Math.max(1, qty));
      return next;
    });
    // Auto-select when qty is changed
    setSelected((prev) => {
      if (prev.has(idx)) return prev;
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  }, []);

  // ── Lightbox ──
  const [lightbox, setLightbox] = useState<string | null>(null);

  // ── Computed ──
  const selectedCount = selected.size;
  const resolvePrice = (c: ProductColor) => c.price ?? basePrice;
  const resolveMrp = (c: ProductColor) => c.mrp ?? baseMrp;
  const totalQty = useMemo(
    () => Array.from(selected).reduce((sum, idx) => sum + getQty(idx), 0),
    [selected, quantities],
  );
  const totalPrice = useMemo(
    () =>
      Array.from(selected).reduce(
        (sum, idx) => sum + resolvePrice(colors[idx]!) * getQty(idx),
        0,
      ),
    [selected, quantities, colors, basePrice],
  );

  // ── Bulk add ──
  const handleBulkAdd = () => {
    const items = Array.from(selected)
      .filter((idx) => (colors[idx]?.stock ?? 0) > 0)
      .map((idx) => ({ color: colors[idx]!, qty: getQty(idx) }));
    if (items.length) onBulkAdd(items);
    setSelected(new Set());
    setQuantities(new Map());
  };

  return (
    <div className="mt-4">
      {/* ── Search bar ── */}
      {colors.length > FILTER_THRESHOLD ? (
        <label className="mb-3 flex items-center gap-2 rounded-full border border-border px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${colors.length} shades by name or code…`}
            aria-label="Search shades"
            className="min-w-0 flex-1 bg-transparent font-data text-2xs text-foreground outline-none placeholder:text-muted-foreground/60"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground/60 hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </label>
      ) : null}

      {/* ── Selection summary bar ── */}
      {selectedCount > 0 ? (
        <div
          className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3"
          style={{ backgroundColor: "color-mix(in oklab, var(--madder) 8%, transparent)" }}
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-madder px-2 font-data text-[11px] font-semibold text-primary-foreground">
              {selectedCount}
            </span>
            <span className="font-data text-2xs text-foreground">
              {selectedCount} shade{selectedCount > 1 ? "s" : ""} · {totalQty} ball{totalQty > 1 ? "s" : ""} · {formatMoney(totalPrice)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setSelected(new Set()); setQuantities(new Map()); }}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 font-data text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleBulkAdd}
              data-cursor="link"
              className="sheen inline-flex items-center gap-1.5 rounded-full bg-madder px-4 py-2 font-data text-[11px] font-semibold text-primary-foreground"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Add {selectedCount} to cart
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border" style={{ backgroundColor: "color-mix(in oklab, var(--ink) 4%, transparent)" }}>
              <th className="w-10 py-3 pl-3 pr-1">
                <button
                  type="button"
                  onClick={toggleAll}
                  aria-label={allSelected ? "Deselect all" : "Select all in-stock shades"}
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded border transition-colors",
                    allSelected
                      ? "border-madder bg-madder text-primary-foreground"
                      : "border-border hover:border-muted-foreground",
                  )}
                >
                  {allSelected ? <Check className="h-3 w-3" /> : null}
                </button>
              </th>
              <th className="w-14 py-3 pl-1 pr-2 font-data text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Image
              </th>
              <th className="py-3 px-2 font-data text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Shade
              </th>
              <th className="py-3 px-2 font-data text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Code
              </th>
              <th className="py-3 px-2 text-right font-data text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Price
              </th>
              <th className="py-3 px-2 text-center font-data text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Stock
              </th>
              <th className="w-28 py-3 px-2 text-center font-data text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Qty
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map((c) => {
              const ci = colors.indexOf(c);
              const isSelected = selected.has(ci);
              const out = (c.stock ?? 0) <= 0;
              const thumb = resolveMedia(c.swatch_image || c.images?.[0] || null);
              const price = resolvePrice(c);
              const mrp = resolveMrp(c);
              const qty = getQty(ci);

              return (
                <tr
                  key={ci}
                  className={cn(
                    "transition-colors",
                    isSelected && "bg-madder/[0.04]",
                    out && "opacity-50",
                    !out && !isSelected && "hover:bg-secondary/40",
                  )}
                >
                  {/* Checkbox */}
                  <td className="py-2.5 pl-3 pr-1">
                    <button
                      type="button"
                      disabled={out}
                      onClick={() => toggleOne(ci)}
                      aria-label={`Select ${c.name}`}
                      className={cn(
                        "grid h-5 w-5 place-items-center rounded border transition-colors",
                        isSelected
                          ? "border-madder bg-madder text-primary-foreground"
                          : "border-border",
                        !out && !isSelected && "hover:border-muted-foreground",
                        out && "cursor-not-allowed opacity-50",
                      )}
                    >
                      {isSelected ? <Check className="h-3 w-3" /> : null}
                    </button>
                  </td>

                  {/* Thumbnail */}
                  <td className="py-2.5 pl-1 pr-2">
                    <button
                      type="button"
                      onClick={() => { if (thumb) setLightbox(thumb); }}
                      disabled={!thumb}
                      className="group relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-fleece"
                      style={thumb ? undefined : { backgroundColor: c.hex || "#ccc" }}
                      title={thumb ? "Click to enlarge" : c.name}
                    >
                      {thumb ? (
                        <>
                          <img src={thumb} alt={c.name} className="h-full w-full object-cover" loading="lazy" />
                          <span className="absolute inset-0 grid place-items-center bg-ink/0 opacity-0 transition-opacity group-hover:bg-ink/30 group-hover:opacity-100">
                            <ZoomIn className="h-3.5 w-3.5 text-fleece" />
                          </span>
                        </>
                      ) : null}
                    </button>
                  </td>

                  {/* Shade name */}
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 shrink-0 rounded-full border border-border"
                        style={{ backgroundColor: c.hex || "#ccc" }}
                        aria-hidden
                      />
                      <span className="font-data text-2xs text-foreground">{c.name}</span>
                    </div>
                    {c.color_family ? (
                      <span className="mt-0.5 block font-data text-[10px] text-muted-foreground/70">{c.color_family}</span>
                    ) : null}
                  </td>

                  {/* Code */}
                  <td className="py-2.5 px-2">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {c.shade_code || "—"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-2.5 px-2 text-right">
                    <span className="font-data text-2xs font-medium text-foreground">
                      {formatMoney(price)}
                    </span>
                    {mrp && mrp > price ? (
                      <span className="ml-1 font-data text-[10px] text-muted-foreground/60 line-through">
                        {formatMoney(mrp)}
                      </span>
                    ) : null}
                  </td>

                  {/* Stock */}
                  <td className="py-2.5 px-2 text-center">
                    {out ? (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-data text-[10px] text-destructive">
                        Sold out
                      </span>
                    ) : (c.stock ?? 0) <= 5 ? (
                      <span className="rounded-full bg-marigold/15 px-2 py-0.5 font-data text-[10px] text-marigold">
                        Only {c.stock}
                      </span>
                    ) : (
                      <span className="font-data text-[10px] text-muted-foreground">
                        {c.stock}
                      </span>
                    )}
                  </td>

                  {/* Qty */}
                  <td className="py-2.5 px-2">
                    <div className="mx-auto flex w-fit items-center rounded-lg border border-border">
                      <button
                        type="button"
                        disabled={out || qty <= 1}
                        onClick={() => setQty(ci, qty - 1)}
                        className="grid h-7 w-7 place-items-center text-muted-foreground disabled:opacity-30"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-6 text-center font-data text-[11px] text-foreground">{qty}</span>
                      <button
                        type="button"
                        disabled={out || qty >= (c.stock ?? 1)}
                        onClick={() => setQty(ci, qty + 1)}
                        className="grid h-7 w-7 place-items-center text-muted-foreground disabled:opacity-30"
                        aria-label="Increase"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 ? (
          <p className="py-8 text-center font-data text-2xs text-muted-foreground">
            No shades match "{query}"
          </p>
        ) : null}
      </div>

      {/* ── Bottom sticky bar (mobile) ── */}
      {selectedCount > 0 ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-madder/30 px-4 py-3 md:hidden"
          style={{ backgroundColor: "color-mix(in oklab, var(--madder) 6%, var(--background))" }}
        >
          <span className="font-data text-2xs text-foreground">
            {selectedCount} shade{selectedCount > 1 ? "s" : ""} · {formatMoney(totalPrice)}
          </span>
          <button
            type="button"
            onClick={handleBulkAdd}
            data-cursor="link"
            className="sheen inline-flex items-center gap-1.5 rounded-full bg-madder px-4 py-2 font-data text-[11px] font-semibold text-primary-foreground"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to cart
          </button>
        </div>
      ) : null}

      {/* ── Lightbox ── */}
      {lightbox ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/80 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-label="Shade image preview"
        >
          <div className="relative max-h-[85dvh] max-w-[90vw] overflow-hidden rounded-3xl border border-border shadow-2xl sm:max-w-lg">
            <img src={lightbox} alt="" className="h-full w-full object-contain" />
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-ink/60 text-fleece backdrop-blur-sm"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
