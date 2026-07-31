import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";

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
  return (
    <PageShell
      eyebrow="Category"
      title={slug.replace(/[-_]/g, " ")}
      intro="Subcategory chips come from /categories/tree; the grid comes from /products?category_id."
    />
  );
}
