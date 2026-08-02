import { cn } from "@/lib/utils";
import type { CategoryNode } from "@/lib/api/types";
import type { YarnWeight } from "@/data/yarn-weights";

/**
 * Horizontal chip filters for the Shop page — categories and yarn weights.
 * Only facets that actually exist in the current (possibly brand-filtered) set
 * are rendered, so the bar never offers a dead end.
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
    <div className="mt-8 space-y-4">
      {categories.length ? (
        <FilterRow label="Category">
          <Chip active={!category} onClick={() => onCategory("")}>
            All
          </Chip>
          {categories.map((c) => (
            <Chip key={c.id} active={category === c.slug} onClick={() => onCategory(c.slug)}>
              {c.name}
            </Chip>
          ))}
        </FilterRow>
      ) : null}

      {weights.length ? (
        <FilterRow label="Yarn weight">
          <Chip active={!weight} onClick={() => onWeight("")}>
            All
          </Chip>
          {weights.map((w) => (
            <Chip key={w.id} active={weight === w.id} onClick={() => onWeight(w.id)}>
              <span className="mr-1.5 font-data text-[10px] text-marigold">{w.weight}</span>
              {w.name}
            </Chip>
          ))}
        </FilterRow>
      ) : null}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center sm:gap-4">
      <p className="font-data text-2xs uppercase tracking-[0.16em] text-muted-foreground/70">
        {label}
      </p>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {children}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-cursor="link"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-4 py-2 font-data text-2xs transition-colors",
        active
          ? "border-transparent bg-madder text-primary-foreground"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
