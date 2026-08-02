import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import { BrandRail } from "@/components/commerce/brand-rail";
import { ProductGrid } from "@/components/commerce/product-card";
import { ShopFilters } from "@/components/commerce/shop-filters";
import { DataError, EmptyState, GridSkeleton } from "@/components/data-state";
import {
  availableCategoryIds,
  availableWeights,
  brandGroups,
  matchesBrand,
  sortProducts,
  weightOf,
} from "@/lib/api/brands";
import { categoryTreeQuery, productsQuery } from "@/lib/api/queries";
import { flattenCategories } from "@/lib/api/types";

type ShopSearch = { brand: string; category: string; weight: string; sort: string };

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price_asc", label: "Price · low to high" },
  { id: "price_desc", label: "Price · high to low" },
  { id: "name", label: "A–Z" },
];

export const Route = createFileRoute("/collections/")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    brand: typeof search["brand"] === "string" ? search["brand"] : "",
    category: typeof search["category"] === "string" ? search["category"] : "",
    weight: typeof search["weight"] === "string" ? search["weight"] : "",
    sort: typeof search["sort"] === "string" ? search["sort"] : "featured",
  }),
  head: () => ({
    meta: [
      { title: "Shop Yarn by Brand & Weight — Royal Wool" },
      {
        name: "description",
        content:
          "Shop Royal Wool yarn by brand — Heartbeats Premium Yarns and Ganga Acrowools — then filter by category and yarn weight.",
      },
      { property: "og:title", content: "Shop Yarn by Brand & Weight — Royal Wool" },
      {
        property: "og:description",
        content: "Browse every Royal Wool yarn range by brand, category and yarn weight.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/collections" },
    ],
    links: [{ rel: "canonical", href: "/collections" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { brand, category, weight, sort } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const products = useQuery(productsQuery({ limit: 96 }));
  const tree = useQuery(categoryTreeQuery);

  const all = products.data ?? [];
  const groups = useMemo(() => brandGroups(all), [all]);
  const activeGroup = groups.find((g) => g.key === brand);

  // Brand narrows the pool first; category + weight facets are derived from it.
  const pool = useMemo(
    () => (activeGroup ? all.filter((p) => matchesBrand(p, activeGroup.meta)) : all),
    [all, activeGroup],
  );

  const catList = useMemo(() => {
    const flat = flattenCategories(tree.data ?? []);
    if (!activeGroup) return flat.filter((c) => !c.parent_id);
    const ids = availableCategoryIds(pool);
    const scoped = flat.filter((c) => ids.has(c.id));
    return scoped.length ? scoped : flat.filter((c) => !c.parent_id);
  }, [tree.data, activeGroup, pool]);

  const weights = useMemo(() => availableWeights(pool), [pool]);

  const visible = useMemo(() => {
    const catId = catList.find((c) => c.slug === category)?.id;
    const filtered = pool.filter((p) => {
      if (catId && p.category_id !== catId) return false;
      if (weight && weightOf(p)?.id !== weight) return false;
      return true;
    });
    return sortProducts(filtered, sort);
  }, [pool, catList, category, weight, sort]);

  const set = (patch: Partial<ShopSearch>) =>
    void navigate({ search: (prev: ShopSearch) => ({ ...prev, ...patch }) });

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 lg:px-10">
      <p className="font-data text-2xs text-marigold">Shop</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl font-light tracking-[-0.03em] text-foreground sm:text-6xl">
        {activeGroup ? activeGroup.meta.name : "Every yarn we wind"}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        {activeGroup
          ? activeGroup.meta.blurb
          : "Pick a brand, then narrow by category and yarn weight."}
      </p>

      <BrandRail groups={groups} active={brand} onSelect={(key) => set({ brand: key, category: "", weight: "" })} />

      <ShopFilters
        categories={catList}
        weights={weights}
        category={category}
        weight={weight}
        onCategory={(slug) => set({ category: slug })}
        onWeight={(id) => set({ weight: id })}
      />

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="min-w-0 truncate font-data text-2xs text-muted-foreground/80">
          {products.isPending ? "Loading yarns…" : `${visible.length} products`}
        </p>
        <label className="flex shrink-0 items-center gap-2">
          <span className="sr-only">Sort products</span>
          <select
            value={sort}
            onChange={(e) => set({ sort: e.target.value })}
            className="rounded-full border border-border bg-transparent px-3 py-2 font-data text-2xs text-muted-foreground"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6">
        {products.isPending ? (
          <GridSkeleton count={8} />
        ) : products.isError ? (
          <DataError error={products.error} retry={() => void products.refetch()} />
        ) : visible.length ? (
          <ProductGrid products={visible} />
        ) : (
          <EmptyState
            title="Nothing matches these filters yet"
            note="Clear a filter, or message us on WhatsApp and we'll tell you what's close in the dye house."
          />
        )}
      </div>
    </div>
  );
}
