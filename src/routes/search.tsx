import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search yarns — Royal Wool" },
      {
        name: "description",
        content: "Search Royal Wool by colour, fibre, weight, brand, price and rating.",
      },
      { property: "og:title", content: "Search yarns — Royal Wool" },
      { property: "og:description", content: "Filter by colour, fibre, weight, price and rating." },
      { property: "og:url", content: "/search" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/search" }],
  }),
  component: () => (
    <PageShell
      eyebrow="Search"
      title="Find your colour"
      intro="Filters live in URL query params so results stay shareable. Wires to /search and /search/trending in Phase 4."
    />
  ),
});
