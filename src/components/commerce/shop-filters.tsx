import { cn } from "@/lib/utils";
import type { CategoryNode } from "@/lib/api/types";
import type { YarnWeight } from "@/data/yarn-weights";

/**
 * Vertical filter groups for the Shop sidebar — categories and yarn weights.
 * Only facets that exist in the current (possibly brand-filtered) set render,
 * so the rail never offers a dead end.
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

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-data text-2xs uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </h3>
      <ul className="mt-3 space-y-1">{children}</ul>
    </section>
  );
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
