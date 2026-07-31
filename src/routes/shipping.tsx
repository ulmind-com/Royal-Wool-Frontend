import { createFileRoute } from "@tanstack/react-router";

import { PageShell, Prose } from "@/components/layout/page-shell";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping & delivery — Royal Wool" },
      {
        name: "description",
        content:
          "How Royal Wool ships across India: dispatch times, distance-based delivery fees and free-delivery thresholds.",
      },
      { property: "og:title", content: "Shipping & delivery — Royal Wool" },
      { property: "og:description", content: "Dispatch times, delivery fees and free-delivery rules." },
      { property: "og:url", content: "/shipping" },
    ],
    links: [{ rel: "canonical", href: "/shipping" }],
  }),
  component: () => (
    <PageShell light eyebrow="Shipping" title="How your yarn travels">
      <Prose>
        <h2>Dispatch</h2>
        <p>Orders placed before 4pm IST are usually packed the same working day.</p>
        <h2>Delivery fee</h2>
        <p>
          Our fee is distance-based: free inside a local radius, then a per-kilometre rate on top of
          a base fee, and free above an order value threshold. All four numbers come from our store
          settings and are shown on the bill before you pay — nothing is estimated on this page.
        </p>
        <h2>Serviceable area</h2>
        <p>
          There's a maximum service distance configured in our settings. If your pincode falls
          outside it, checkout will tell you before you pay.
        </p>
      </Prose>
    </PageShell>
  ),
});
