import { createFileRoute } from "@tanstack/react-router";

import { PageShell, Prose } from "@/components/layout/page-shell";
import { useSettings } from "@/hooks/use-settings";

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
  component: ReturnsPolicyPage,
});

function ReturnsPolicyPage() {
  const { returnWindowDays, cancelWindowHours } = useSettings();

  return (
    <PageShell light eyebrow="Policy" title="Returns & exchanges">
      <Prose>
        <h2>Window</h2>
        <p>
          {returnWindowDays
            ? `You can raise a return within ${returnWindowDays} days of delivery. The return option stays visible on your order for as long as it's eligible.`
            : "All sales are final. Because every skein is wound to order from small dye batches, we don't accept returns or exchanges once an order is placed."}
        </p>
        {returnWindowDays ? (
          <>
            <h2>Condition</h2>
            <p>
              Skeins must be unused with the band intact. Wound or partially worked yarn can't be
              resold, so it isn't returnable.
            </p>
            <h2>Refund vs exchange</h2>
            <p>
              Both are supported. Refunds go back to the original payment method; exchanges ship
              once we receive the returned skeins.
            </p>
          </>
        ) : (
          <>
            <h2>Damaged or wrong delivery</h2>
            <p>
              If a parcel arrives damaged or isn't what you ordered, message us the same day with
              photos and we'll make it right — that sits outside this policy.
            </p>
          </>
        )}
        <h2>Cancellations</h2>
        <p>
          {cancelWindowHours
            ? `Orders can be cancelled from the order page within ${cancelWindowHours} hours of placing them, as long as they haven't shipped.`
            : "Once payment goes through, an order is confirmed and can't be cancelled — we start winding it straight away."}
        </p>
      </Prose>
    </PageShell>
  );
}
