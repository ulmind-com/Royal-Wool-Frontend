import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your bag — Royal Wool" },
      { name: "description", content: "Review the yarn in your bag, apply coupons and check out." },
      { property: "og:title", content: "Your bag — Royal Wool" },
      { property: "og:description", content: "Review your bag and check out." },
      { property: "og:url", content: "/cart" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: () => (
    <PageShell
      eyebrow="Bag"
      title="Your bag"
      intro="Cart lives client-side (zustand + localStorage). Bill totals always come from /orders/quote — never computed here."
    />
  ),
});
