import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { resolveMedia } from "@/components/commerce/review-card";
import type { ProductColor } from "@/lib/api/types";
import { shadeCode } from "@/lib/api/specs";
import { cn } from "@/lib/utils";

/**
 * Shade picker built for wide colour cards (60+ variants is normal for Indian
 * acrylic ranges). Renders the admin's colour photo when there is one and falls
 * back to the hex swatch, collapses long grids behind a "show all" toggle and
 * adds a filter box once the deck gets big.
 */

const COLLAPSED_COUNT = 27;
const FILTER_THRESHOLD = 30;

export function ShadeGrid({
  colors,
  activeName,
  onSelect,
}: {
  colors: ProductColor[];
  activeName: string | null;
  onSelect: (color: ProductColor) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return colors;
    return colors.filter((c) => c.name.toLowerCase().includes(q));
  }, [colors, query]);

  const visible =
    expanded || filtered.length <= COLLAPSED_COUNT ? filtered : filtered.slice(0, COLLAPSED_COUNT);
  const hidden = filtered.length - visible.length;

  return (
    <div>
      {colors.length > FILTER_THRESHOLD ? (
        <label className="mt-3 flex items-center gap-2 rounded-full border border-border px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Find a shade in ${colors.length}`}
            aria-label="Search shades"
            className="min-w-0 flex-1 bg-transparent font-data text-2xs text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </label>
      ) : null}

      <ul className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-9">
        {visible.map((c) => {
          const active = c.name === activeName;
          const img = resolveMedia(c.images?.[0] ?? null);
          const soldOut = c.stock === 0 && !c.sizes.some((s) => s.stock > 0);
          return (
            <li key={c.name}>
              <button
                type="button"
                onClick={() => onSelect(c)}
                disabled={soldOut}
                title={soldOut ? `${c.name} — sold out` : c.name}
                aria-label={c.name}
                aria-pressed={active}
                data-cursor="link"
                className={cn(
                  "group relative aspect-square w-full overflow-hidden rounded-full border transition-all duration-[var(--dur-standard)] ease-[var(--ease-enter)]",
                  active
                    ? "border-foreground ring-1 ring-foreground ring-offset-2 ring-offset-background"
                    : "border-transparent hover:-translate-y-0.5",
                  soldOut && "opacity-40",
                )}
                style={img ? undefined : { backgroundColor: c.hex ?? "transparent" }}
              >
                {img ? (
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                ) : null}
                {soldOut ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, transparent 46%, color-mix(in oklab, var(--ink) 55%, transparent) 46% 54%, transparent 54%)",
                    }}
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      {hidden > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          data-cursor="link"
          className="mt-4 inline-flex rounded-full border border-border px-4 py-2 font-data text-2xs text-foreground transition-colors hover:border-marigold"
        >
          Show all {filtered.length} shades
        </button>
      ) : null}
      {expanded && filtered.length > COLLAPSED_COUNT ? (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          data-cursor="link"
          className="mt-4 inline-flex rounded-full border border-border px-4 py-2 font-data text-2xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Show fewer
        </button>
      ) : null}
      {filtered.length === 0 ? (
        <p className="mt-3 font-data text-2xs text-muted-foreground">No shade matches that name.</p>
      ) : null}
    </div>
  );
}

export function shadeLabel(color: ProductColor | undefined): string {
  if (!color) return "";
  const code = shadeCode(color as unknown as { name: string } & Record<string, unknown>);
  return code ? `${code} · ${color.name}` : color.name;
}
