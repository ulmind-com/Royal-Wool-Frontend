import { createFileRoute } from "@tanstack/react-router";

import { PageShell, Prose } from "@/components/layout/page-shell";
import { useSettings } from "@/hooks/use-settings";

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
      {
        property: "og:description",
        content: "Dispatch times, delivery fees and free-delivery rules.",
      },
      { property: "og:url", content: "/shipping" },
    ],
    links: [{ rel: "canonical", href: "/shipping" }],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  const { formatMoney, freeAbove, freeRadiusKm, perKmRate, baseFee, maxServiceKm } = useSettings();

  return (
    <PageShell light eyebrow="Shipping" title="How your yarn travels">
      <Prose>
        <h2>Dispatch</h2>
        <p>Orders placed before 4pm IST are usually packed the same working day.</p>
        <h2>Delivery fee</h2>
        <p>
          Our fee is distance-based, and the exact amount always appears on your bill before you
          pay.
        </p>
        <ul>
          {freeRadiusKm != null ? (
            <li>Free delivery within {freeRadiusKm} km of our store.</li>
          ) : null}
          {baseFee != null ? <li>Base fee of {formatMoney(baseFee)} beyond that radius.</li> : null}
          {perKmRate != null ? <li>{formatMoney(perKmRate)} per additional kilometre.</li> : null}
          {freeAbove != null ? (
            <li>Delivery is free on orders above {formatMoney(freeAbove)}.</li>
          ) : null}
        </ul>
        <h2>Serviceable area</h2>
        <p>
          {maxServiceKm != null
            ? `We currently deliver up to ${maxServiceKm} km from the store. If your address falls outside that, checkout will tell you before you pay.`
            : "If your address falls outside our delivery range, checkout will tell you before you pay."}
        </p>
      </Prose>
    </PageShell>
  );
}
