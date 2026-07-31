import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Yarn detail — Royal Wool` },
      {
        name: "description",
        content:
          "Colour swatches, weight, gauge, stock and reviews for this Royal Wool yarn, with a 3D yarn-ball viewer.",
      },
      { property: "og:title", content: "Yarn detail — Royal Wool" },
      { property: "og:description", content: "Colour, gauge, stock and reviews for this yarn." },
      { property: "og:url", content: `/product/${params.id}` },
    ],
    links: [{ rel: "canonical", href: `/product/${params.id}` }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  return (
    <PageShell
      eyebrow={`Product · ${id}`}
      title="Product detail"
      intro="3D yarn-ball viewer plus a sticky glass buy panel. Colour-variant pricing, stock and sizes override product-level values in Phase 4."
    />
  );
}
