import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/order/$id/success")({
  head: () => ({
    meta: [
      { title: "Order confirmed — Royal Wool" },
      { name: "description", content: "Your Royal Wool order is confirmed." },
      { property: "og:title", content: "Order confirmed — Royal Wool" },
      { property: "og:description", content: "Your Royal Wool order is confirmed." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const { id } = Route.useParams();
  return (
    <PageShell
      eyebrow={`Order ${id}`}
      title="Cast on — your order is in"
      intro="A knitting-stitch animation draws the order number here, with summary, delivery estimate and track/cancel actions (Phase 6)."
    />
  );
}
