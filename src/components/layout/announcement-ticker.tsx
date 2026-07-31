import { useQuery } from "@tanstack/react-query";

import { useSettings } from "@/hooks/use-settings";
import { activeCouponsQuery } from "@/lib/api/queries";

/**
 * Thin marquee strip. The delivery threshold and coupon line are read from the
 * store's own settings/coupons, so the strip can never advertise a stale offer.
 */
export function AnnouncementTicker() {
  const { freeAbove, formatMoney, returnWindowDays } = useSettings();
  const { data: coupons } = useQuery(activeCouponsQuery);
  const coupon = coupons?.[0];

  const items = [
    freeAbove
      ? `Free delivery on orders above ${formatMoney(freeAbove)}`
      : "Tracked delivery across India",
    coupon
      ? `Use code ${coupon.code} — ${coupon.description ?? "live offer"}`
      : "Skin-safe, tested dyes — gentle enough for baby knits",
    returnWindowDays
      ? `Easy returns within ${returnWindowDays} days`
      : "Support 10am–7pm IST, all days",
    "Small-batch colour, wound for stitch definition",
  ];

  const row = [...items, ...items];

  return (
    <div
      className="ink-section relative overflow-hidden border-b border-border"
      style={{ backgroundImage: "var(--dye-flow)" }}
      role="region"
      aria-label="Store announcements"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "color-mix(in oklab, var(--ink) 74%, transparent)" }}
        aria-hidden
      />
      <div className="relative py-2">
        <div className="marquee-track gap-10">
          {row.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex shrink-0 items-center gap-10 whitespace-nowrap font-data text-2xs text-foreground/80"
            >
              {item}
              <span aria-hidden className="text-marigold">
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
