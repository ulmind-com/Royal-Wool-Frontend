import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & coupons — Royal Wool" },
      { name: "description", content: "Live Royal Wool coupons and savings on yarn orders." },
      { property: "og:title", content: "Offers & coupons — Royal Wool" },
      { property: "og:description", content: "Live coupons and savings on yarn orders." },
      { property: "og:url", content: "/offers" },
    ],
    links: [{ rel: "canonical", href: "/offers" }],
  }),
  component: () => (
    <PageShell
      eyebrow="Offers"
      title="Coupons on the rack"
      intro="Glass coupon cards with a tear-off dashed edge and tap-to-copy codes, from /coupons/active (Phase 7)."
    />
  ),
});
