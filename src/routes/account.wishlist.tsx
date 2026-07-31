import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/account/wishlist")({
  head: () => ({
    meta: [
      { title: "Your wishlist — Royal Wool" },
      { name: "description", content: "Yarns you saved for later at Royal Wool." },
      { property: "og:title", content: "Your wishlist — Royal Wool" },
      { property: "og:description", content: "Yarns you saved for later." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <PageShell
      eyebrow="Wishlist"
      title="Saved for later"
      intro="Hearts hydrate from /wishlist/ids on boot and toggle optimistically (Phase 7)."
    />
  ),
});
