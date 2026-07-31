import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { DataError, EmptyState, GridSkeleton } from "@/components/data-state";
import { ProductGrid } from "@/components/commerce/product-card";
import { categoryTreeQuery, productsQuery } from "@/lib/api/queries";

export const Route = createFileRoute("/collections/")({
  head: () => ({
    meta: [
      { title: "All Yarns — Royal Wool" },
      {
        name: "description",
        content: "Browse every Royal Wool yarn: acrylic, cotton, blends and specialty ranges.",
      },
      { property: "og:title", content: "All Yarns — Royal Wool" },
      { property: "og:description", content: "Browse every Royal Wool yarn range." },
      { property: "og:url", content: "/collections" },
    ],
    links: [{ rel: "canonical", href: "/collections" }],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const products = useQuery(productsQuery({ limit: 48 }));
  const tree = useQuery(categoryTreeQuery);
  const topLevel = (tree.data ?? []).filter((c) => !c.parent_id);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-24 pt-16 sm:px-6 lg:px-10">
      <p className="font-data text-2xs text-marigold">Collections</p>
      <h1 className="mt-4 max-w-3xl font-display text-5xl sm:text-6xl font-light tracking-[-0.03em] text-fleece">
        Every yarn we wind
      </h1>

      {topLevel.length ? (
        <ul className="mt-10 flex flex-wrap gap-2" aria-label="Categories">
          {topLevel.map((c) => (
            <li key={c.id}>
              <Link
                to="/collections/$slug"
                params={{ slug: c.slug }}
                data-cursor="link"
                className="inline-flex rounded-full border border-border px-4 py-2 font-data text-2xs text-fleece-dim transition-colors hover:text-fleece"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-12">
        {products.isPending ? (
          <GridSkeleton count={8} />
        ) : products.isError ? (
          <DataError error={products.error} retry={() => void products.refetch()} />
        ) : products.data?.length ? (
          <ProductGrid products={products.data} />
        ) : (
          <EmptyState
            title="Nothing wound yet"
            note="This catalogue is being stocked. Check back shortly or message us for what's in the dye house."
          />
        )}
      </div>
    </div>
  );
}
