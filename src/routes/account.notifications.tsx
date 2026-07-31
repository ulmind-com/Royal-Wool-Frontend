import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/account/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Royal Wool" },
      { name: "description", content: "Order updates, restocks and offers from Royal Wool." },
      { property: "og:title", content: "Notifications — Royal Wool" },
      { property: "og:description", content: "Order updates, restocks and offers." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <PageShell
      eyebrow="Inbox"
      title="Notifications"
      intro="Glass bell dropdown plus this inbox, with a 60s unread-count poll while the tab is visible (Phase 7)."
    />
  ),
});
