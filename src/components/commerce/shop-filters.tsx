import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryNode } from "@/lib/api/types";
import type { YarnWeight } from "@/data/yarn-weights";

/**
 * Vertical filter groups for the Shop sidebar — categories, colour and yarn
 * weights. Only facets that exist in the current (possibly brand-filtered) set
 * render, so the rail never offers a dead end.
 */
export function ShopFilters({
  categories,
  weights,
  category,
  weight,
  onCategory,
  onWeight,
}: {
  categories: CategoryNode[];
  weights: YarnWeight[];
  category: string;
  weight: string;
  onCategory: (slug: string) => void;
  onWeight: (id: string) => void;
}) {
  if (!categories.length && !weights.length) return null;

  return (
    <>
      {categories.length ? (
        <FilterGroup label="Category">
          <Row active={!category} onClick={() => onCategory("")}>
            All categories
          </Row>
          {categories.map((c) => (
            <Row key={c.id} active={category === c.slug} onClick={() => onCategory(c.slug)}>
              {c.name}
            </Row>
          ))}
        </FilterGroup>
      ) : null}



      {weights.length ? (
        <FilterGroup label="Yarn weight">
          <Row active={!weight} onClick={() => onWeight("")}>
            All weights
          </Row>
          {weights.map((w) => (
            <Row key={w.id} active={weight === w.id} onClick={() => onWeight(w.id)}>
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border font-data text-[10px] text-marigold">
                {w.weight}
              </span>
              <span className="min-w-0 truncate">{w.name}</span>
              <span className="ml-auto shrink-0 font-data text-[10px] text-muted-foreground/60">
                {w.hookMm}
              </span>
            </Row>
          ))}
        </FilterGroup>
      ) : null}
    </>
  );
}

function FilterGroup({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex min-h-4 items-center justify-between gap-3">
        <h3 className="font-data text-2xs uppercase tracking-[0.16em] text-muted-foreground/70">
          {label}
        </h3>
        {action}
      </div>
      <ul className="mt-3 space-y-1">{children}</ul>
    </section>
  );
}

/**
 * Round colour chip. Falls back to a spectrum wheel when the admin saved a
 * shade with no hex, so an un-swatched family still reads as a colour.
 */
function Swatch({
  facet,
  active,
  onClick,
}: {
  facet: ColorFacet;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-cursor="link"
      aria-pressed={active}
      title={`${facet.name} · ${facet.count} ${facet.count === 1 ? "yarn" : "yarns"}`}
      onClick={onClick}
      className={cn(
        "group relative grid h-9 w-9 place-items-center rounded-full transition-all duration-200",
        "ring-1 ring-border hover:ring-marigold",
        active
          ? "ring-2 ring-marigold ring-offset-2 ring-offset-background"
          : "hover:-translate-y-0.5",
      )}
      style={
        facet.hex
          ? { backgroundColor: facet.hex }
          : {
              backgroundImage:
                "conic-gradient(#e0443e,#f0a202,#f2e205,#4f9d69,#2f6f9f,#6b4b9a,#e0443e)",
            }
      }
    >
      <span className="sr-only">{facet.name}</span>
      {active ? (
        <Check
          className="h-4 w-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]"
          style={{ color: readableOn(facet.hex) }}
          strokeWidth={3}
        />
      ) : null}
    </button>
  );
}

/** Black tick on pale swatches, white on dark ones, so the check never vanishes. */
function readableOn(hex: string | null): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? "");
  if (!m?.[1]) return "#fff";
  const n = parseInt(m[1], 16);
  const luma = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return luma > 0.6 ? "#111" : "#fff";
}

function Row({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        data-cursor="link"
        aria-pressed={active}
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left font-data text-2xs transition-colors",
          active
            ? "border-transparent bg-madder text-primary-foreground"
            : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
        )}
      >
        {children}
      </button>
    </li>
  );
}
