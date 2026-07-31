import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/checkout")({
  // TODO Phase 3: gate behind auth — redirect to /login?next=/checkout when
  // no rw_token is present. Intentionally public in Phase 1 so the shell is
  // reviewable and prerender can't 401.
  head: () => ({
    meta: [
      { title: "Checkout — Royal Wool" },
      { name: "description", content: "Address, payment and order review in three steps." },
      { property: "og:title", content: "Checkout — Royal Wool" },
      { property: "og:description", content: "Address, payment and order review." },
      { property: "og:url", content: "/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: () => (
    <PageShell
      eyebrow="Checkout"
      title="Three steps, one page"
      intro="Address → payment → review, with the thread as the progress line. Razorpay and COD availability wire up in Phase 6."
    />
  ),
});
