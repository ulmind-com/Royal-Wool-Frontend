import { createFileRoute } from "@tanstack/react-router";

import { PageShell, Prose } from "@/components/layout/page-shell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of service — Royal Wool" },
      {
        name: "description",
        content: "The terms that apply when you order yarn from Royal Wool.",
      },
      { property: "og:title", content: "Terms of service — Royal Wool" },
      { property: "og:description", content: "The terms that apply when you order from us." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: () => (
    <PageShell light eyebrow="Legal" title="Terms of service">
      <Prose>
        <h2>Orders</h2>
        <p>
          An order is confirmed once payment is captured, or once a cash-on-delivery order is
          accepted. Prices, taxes and delivery fees shown at checkout are the ones that apply.
        </p>
        <h2>Colour accuracy</h2>
        <p>
          Screens vary. We photograph in daylight and describe dye lots honestly, but a small shade
          difference from your monitor is not a defect.
        </p>
        <h2>Stock</h2>
        <p>
          If a colour sells out between your order and packing, we'll contact you to swap or refund
          that line.
        </p>
        <h2>Liability</h2>
        <p>Our liability for any order is limited to the amount you paid for it.</p>
      </Prose>
    </PageShell>
  ),
});
