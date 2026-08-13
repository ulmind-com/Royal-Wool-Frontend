import { Link } from "@tanstack/react-router";
import { Search, X, ZoomIn } from "lucide-react";
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
  viewMode = "grid",
}: {
  shades: ShadeOption[];
  activeId: string | null;
  /** "grid" renders the original swatch circles; "table" renders a rows-based list. */
  viewMode?: "grid" | "table";
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

  /* ── Search bar (shared between both views) ── */
  const searchBar =
    shades.length > FILTER_THRESHOLD ? (
      <label className="mt-3 flex items-center gap-2 rounded-full border border-border px-3 py-2">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Find a shade in ${shades.length}`}
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
    ) : null;

  /* ── Expand / collapse buttons (shared) ── */
  const expandBtns = (
    <>
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
    </>
  );

  /* ── TABLE VIEW ── */
  if (viewMode === "table") {
    return (
      <div>
        {searchBar}
        <ShadeListTable shades={visible} activeId={activeId} />
        {expandBtns}
      </div>
    );
  }

  /* ── GRID VIEW (original) ── */
  return (
    <div>
      {searchBar}

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

      {expandBtns}
    </div>
  );
}

export function shadeOptionLabel(shade: ShadeOption | null | undefined): string {
  if (!shade) return "";
  return shade.code ? `${shade.code} · ${shade.name}` : shade.name;
}

/* ──────────────────────────────────────────────────────────────────────
 * Sibling shade table — each row links to its own product page.
 * ──────────────────────────────────────────────────────────────────── */

function ShadeListTable({
  shades,
  activeId,
}: {
  shades: ShadeOption[];
  activeId: string | null;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr
              className="border-b border-border"
              style={{ backgroundColor: "color-mix(in oklab, var(--ink) 4%, transparent)" }}
            >
              <th className="w-12 py-2.5 pl-3 pr-1 font-data text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Image
              </th>
              <th className="py-2.5 px-2 font-data text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Shade
              </th>
              <th className="py-2.5 px-2 font-data text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Code
              </th>
              <th className="py-2.5 px-2 text-center font-data text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {shades.map((s) => {
              const active = s.id === activeId;
              const img = resolveMedia(s.image);
              const soldOut = !s.inStock;

              return (
                <tr
                  key={s.id}
                  className={cn(
                    "transition-colors",
                    active && "bg-madder/[0.06]",
                    soldOut && "opacity-50",
                    !soldOut && !active && "hover:bg-secondary/40",
                  )}
                >
                  {/* Thumbnail */}
                  <td className="py-2 pl-3 pr-1">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); if (img) setLightbox(img); }}
                      disabled={!img}
                      className="group relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-border bg-fleece"
                      style={img ? undefined : { backgroundColor: s.hex ?? "#ccc" }}
                      title={img ? "Click to enlarge" : s.name}
                    >
                      {img ? (
                        <>
                          <img src={img} alt={s.name} className="h-full w-full object-cover" loading="lazy" />
                          <span className="absolute inset-0 grid place-items-center bg-ink/0 opacity-0 transition-opacity group-hover:bg-ink/30 group-hover:opacity-100">
                            <ZoomIn className="h-3 w-3 text-fleece" />
                          </span>
                        </>
                      ) : null}
                    </button>
                  </td>

                  {/* Name (linked) */}
                  <td className="py-2 px-2">
                    <Link
                      to="/product/$id"
                      params={{ id: s.id }}
                      preload="intent"
                      data-cursor="link"
                      className={cn(
                        "inline-flex items-center gap-2 font-data text-2xs transition-colors hover:text-marigold",
                        active ? "font-semibold text-madder" : "text-foreground",
                      )}
                    >
                      <span
                        className="inline-block h-3 w-3 shrink-0 rounded-full border border-border"
                        style={{ backgroundColor: s.hex ?? "#ccc" }}
                        aria-hidden
                      />
                      {s.name}
                      {active ? <span className="text-[10px] text-madder">(current)</span> : null}
                    </Link>
                  </td>

                  {/* Code */}
                  <td className="py-2 px-2">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {s.code || "—"}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="py-2 px-2 text-center">
                    {soldOut ? (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-data text-[10px] text-destructive">
                        Sold out
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-data text-[10px] text-emerald-600">
                        In stock
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Lightbox */}
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
    </>
  );
}
