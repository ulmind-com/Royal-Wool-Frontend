import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { resolveMedia } from "@/components/commerce/review-card";
import { cn } from "@/lib/utils";

/**
 * Shade picker built for wide colour cards (60+ variants is normal for Indian
 * acrylic ranges). Each shade is its own product (see product.$id.tsx), so a
 * swatch is a real link to that product's page, not a piece of local state —
 * clicking one navigates there directly, with hover-prefetch for a snappy
 * switch. Renders the admin's shade photo when there is one and falls back to
 * the hex swatch, collapses long grids behind a "show all" toggle and adds a
 * filter box once the deck gets big.
 */

export interface ShadeOption {
  /** Sibling product id — used for the link target and list key. */
  id: string;
  name: string;
  code: string | null;
  hex: string | null;
  image: string | null;
  inStock: boolean;
}

const COLLAPSED_COUNT = 27;
const FILTER_THRESHOLD = 30;

export function ShadeGrid({
  shades,
  activeId,
}: {
  shades: ShadeOption[];
  activeId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shades;
    return shades.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.code ?? "").toLowerCase().includes(q),
    );
  }, [shades, query]);

  const visible =
    expanded || filtered.length <= COLLAPSED_COUNT ? filtered : filtered.slice(0, COLLAPSED_COUNT);
  const hidden = filtered.length - visible.length;

  return (
    <div>
      {shades.length > FILTER_THRESHOLD ? (
        <label className="mt-3 flex items-center gap-2 rounded-full border border-border px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Find a shade in ${shades.length}`}
            aria-label="Search shades"
            className="min-w-0 flex-1 bg-transparent font-data text-2xs text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </label>
      ) : null}

      <ul className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-9">
        {visible.map((s) => {
          const active = s.id === activeId;
          const img = resolveMedia(s.image);
          const soldOut = !s.inStock;
          const label = shadeOptionLabel(s);
          return (
            <li key={s.id}>
              <Link
                to="/product/$id"
                params={{ id: s.id }}
                preload="intent"
                aria-disabled={soldOut}
                title={soldOut ? `${label} — sold out` : label}
                aria-label={label}
                aria-current={active ? "true" : undefined}
                data-cursor="link"
                className={cn(
                  "group relative block aspect-square w-full overflow-hidden rounded-full border transition-all duration-[var(--dur-standard)] ease-[var(--ease-enter)]",
                  active
                    ? "border-foreground ring-1 ring-foreground ring-offset-2 ring-offset-background"
                    : "border-transparent hover:-translate-y-0.5",
                  soldOut && "opacity-40",
                )}
                style={img ? undefined : { backgroundColor: s.hex ?? "transparent" }}
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
              </Link>
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

export function shadeOptionLabel(shade: ShadeOption | null | undefined): string {
  if (!shade) return "";
  return shade.code ? `${shade.code} · ${shade.name}` : shade.name;
}
