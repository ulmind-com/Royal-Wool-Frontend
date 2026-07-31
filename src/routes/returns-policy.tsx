import { createFileRoute } from "@tanstack/react-router";

import { PageShell, Prose } from "@/components/layout/page-shell";

export const Route = createFileRoute("/returns-policy")({
  head: () => ({
    meta: [
      { title: "Returns & exchange policy — Royal Wool" },
      {
        name: "description",
        content:
          "Royal Wool return and exchange rules: eligibility, condition, the return window and how refunds are issued.",
      },
      { property: "og:title", content: "Returns & exchange policy — Royal Wool" },
      { property: "og:description", content: "Eligibility, condition, window and refunds." },
      { property: "og:url", content: "/returns-policy" },
    ],
    links: [{ rel: "canonical", href: "/returns-policy" }],
  }),
  component: () => (
    <PageShell light eyebrow="Policy" title="Returns & exchanges">
      <Prose>
        <h2>Window</h2>
        <p>
          The return window is set in our store settings and shown on every product page and order.
          The CTA only appears while an order is still eligible.
        </p>
        <h2>Condition</h2>
        <p>
          Skeins must be unused with the band intact. Wound or partially worked yarn can't be
          resold, so it isn't returnable.
        </p>
        <h2>Refund vs exchange</h2>
        <p>
          Both are supported. Refunds go back to the original payment method; exchanges ship once we
          receive the returned skeins.
        </p>
        <h2>Cancellations</h2>
        <p>
          Orders can be cancelled from the order page within the cancel window configured in our
          settings, as long as the order hasn't shipped.
        </p>
      </Prose>
    </PageShell>
  ),
});
