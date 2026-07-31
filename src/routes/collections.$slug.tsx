import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { ProductGrid } from "@/components/commerce/product-card";
import { DataError, EmptyState, GridSkeleton } from "@/components/data-state";
import { categoryTreeQuery, productsQuery } from "@/lib/api/queries";
import { findCategoryBySlug } from "@/lib/api/types";

export const Route = createFileRoute("/collections/$slug")({
  head: ({ params }) => {
    const label = params.slug.replace(/[-_]/g, " ");
    return {
      meta: [
        { title: `${label} yarn — Royal Wool` },
        {
          name: "description",
          content: `Shop ${label} yarn from Royal Wool, with subcategory filters and live stock.`,
        },
        { property: "og:title", content: `${label} yarn — Royal Wool` },
        { property: "og:description", content: `Shop ${label} yarn from Royal Wool.` },
        { property: "og:url", content: `/collections/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/collections/${params.slug}` }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const tree = useQuery(categoryTreeQuery);

  const category = tree.data ? findCategoryBySlug(tree.data, slug) : undefined;
  const children = category?.children ?? [];

  // Wait for the tree before asking for products, otherwise the first request
  // would fetch the whole catalogue and then immediately be replaced.
  const products = useQuery({
    ...productsQuery({ category_id: category?.id, limit: 48 }),
    enabled: Boolean(category?.id),
  });

  const title = category?.name ?? slug.replace(/[-_]/g, " ");

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-24 pt-16 sm:px-6 lg:px-10">
      <nav aria-label="Breadcrumb" className="font-data text-2xs text-fleece-dim/70">
        <Link to="/collections" data-cursor="link" className="hover:text-fleece">
          Collections
        </Link>
        <span aria-hidden> / </span>
        <span className="text-fleece-dim">{title}</span>
      </nav>

      <h1 className="mt-4 font-display text-fluid-3xl font-light capitalize tracking-[-0.03em] text-fleece">
        {title}
      </h1>

      {children.length ? (
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Subcategories">
          {children.map((c) => (
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
        {tree.isError ? (
          <DataError error={tree.error} retry={() => void tree.refetch()} />
        ) : tree.isPending || products.isPending ? (
          <GridSkeleton count={8} />
        ) : !category ? (
          <EmptyState
            title="Category not found"
            note="This range may have been renamed. Browse all collections to find it."
          />
        ) : products.isError ? (
          <DataError error={products.error} retry={() => void products.refetch()} />
        ) : products.data?.length ? (
          <ProductGrid products={products.data} />
        ) : (
          <EmptyState
            title="Nothing in this range yet"
            note="We're winding new colours for it. Message us on WhatsApp and we'll tell you what's close."
          />
        )}
      </div>
    </div>
  );
}
