import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { DataError, EmptyState, GridSkeleton } from "@/components/data-state";
import { Glass } from "@/components/ui/glass";
import { useSettings } from "@/hooks/use-settings";
import { activeCouponsQuery } from "@/lib/api/queries";
import type { Coupon } from "@/lib/api/types";

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
  component: OffersPage,
});

function OffersPage() {
  const { data, isPending, isError, error, refetch } = useQuery(activeCouponsQuery);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-24 pt-16 sm:px-6 lg:px-10">
      <p className="font-data text-2xs text-marigold">Offers</p>
      <h1 className="mt-4 font-display text-5xl sm:text-6xl font-light tracking-[-0.03em] text-foreground">
        Coupons on the rack
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Tap a code to copy it, then paste it at checkout.
      </p>

      <div className="mt-12">
        {isPending ? (
          <GridSkeleton count={3} ratio="aspect-[5/3]" />
        ) : isError ? (
          <DataError error={error} retry={() => void refetch()} />
        ) : data?.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((c) => (
              <li key={c.id}>
                <CouponCard coupon={c} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No live coupons right now"
            note="New offers drop with each dye batch. Free delivery thresholds still apply on every order."
          />
        )}
      </div>
    </div>
  );
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const { formatMoney } = useSettings();
  const [copied, setCopied] = useState(false);

  const headline =
    coupon.type === "percent" ? `${coupon.value}% off` : `${formatMoney(coupon.value)} off`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Glass variant="card" className="h-full">
      <p className="font-display text-3xl font-light text-foreground">{headline}</p>
      {coupon.description ? (
        <p className="mt-2 text-sm text-muted-foreground">{coupon.description}</p>
      ) : null}

      <ul className="mt-4 space-y-1 font-data text-2xs text-muted-foreground/80">
        {coupon.min_order ? <li>Min order {formatMoney(coupon.min_order)}</li> : null}
        {coupon.max_discount ? <li>Up to {formatMoney(coupon.max_discount)} off</li> : null}
        {coupon.first_order_only ? <li>First order only</li> : null}
        {coupon.valid_until ? (
          <li>Valid till {new Date(coupon.valid_until).toLocaleDateString("en-IN")}</li>
        ) : null}
      </ul>

      {/* tear-off edge */}
      <div
        className="my-5 border-t border-dashed"
        style={{ borderColor: "color-mix(in oklab, var(--ink) 22%, transparent)" }}
        aria-hidden
      />

      <button
        type="button"
        onClick={() => void copy()}
        data-cursor="link"
        aria-label={`Copy coupon code ${coupon.code}`}
        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-data text-2xs text-foreground transition-colors hover:border-marigold hover:text-marigold"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : coupon.code}
      </button>
    </Glass>
  );
}
