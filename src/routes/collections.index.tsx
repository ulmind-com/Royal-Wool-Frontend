import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/collections")({
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
  component: () => (
    <PageShell
      eyebrow="Collections"
      title="Every yarn we wind"
      intro="The full catalogue, with fibre, weight and colour filters. Product grid wires to /products in Phase 4."
    />
  ),
});
