import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/account/returns")({
  head: () => ({
    meta: [
      { title: "Returns & exchanges — Royal Wool" },
      { name: "description", content: "Track your Royal Wool return and exchange requests." },
      { property: "og:title", content: "Returns & exchanges — Royal Wool" },
      { property: "og:description", content: "Track your return and exchange requests." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <PageShell
      eyebrow="Returns"
      title="Returns & exchanges"
      intro="Requests from /returns. Only delivered orders inside the store's return window, and only returnable items, can be raised."
    />
  ),
});
