import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/account/orders")({
  head: () => ({
    meta: [
      { title: "Your orders — Royal Wool" },
      { name: "description", content: "Track, cancel or return your Royal Wool orders." },
      { property: "og:title", content: "Your orders — Royal Wool" },
      { property: "og:description", content: "Track, cancel or return your orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <PageShell
      eyebrow="Orders"
      title="Your orders"
      intro="Status timeline drawn as a knitted thread. Cancel appears inside the store's cancel window; returns inside the return window."
    />
  ),
});
