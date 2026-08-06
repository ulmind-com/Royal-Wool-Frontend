import { useQuery } from "@tanstack/react-query";

import { useSettings } from "@/hooks/use-settings";
import { activeCouponsQuery } from "@/lib/api/queries";

/**
 * Thin marquee strip. The delivery threshold and coupon line are read from the
 * store's own settings/coupons, so the strip can never advertise a stale offer.
 */
export function AnnouncementTicker() {
  const { settings, freeAbove, formatMoney } = useSettings();
  const { data: coupons } = useQuery(activeCouponsQuery);
  const coupon = coupons?.[0];

  const defaultItems = [
    freeAbove
      ? `Free delivery on orders above ${formatMoney(freeAbove)}`
      : "Tracked delivery across India",
    coupon
      ? `Use code ${coupon.code} — ${coupon.description ?? "live offer"}`
      : "Skin-safe, tested dyes — gentle enough for baby knits",
    "Support 10am–7pm IST, all days",
    "Small-batch colour, wound for stitch definition",
  ];

  // Try to use backend announcements, or fallback to the defaults.
  let items = settings?.announcements?.length ? settings.announcements : defaultItems;

  // Process smart placeholders in the strings
  items = items.map(text => {
    let out = text;
    if (out.includes("{free_delivery}")) {
      out = out.replace(/{free_delivery}/g, freeAbove ? formatMoney(freeAbove) : "");
    }
    if (out.includes("{coupon_code}")) {
      out = out.replace(/{coupon_code}/g, coupon?.code || "");
    }
    if (out.includes("{coupon_desc}")) {
      out = out.replace(/{coupon_desc}/g, coupon?.description || "special offer");
    }
    if (out === "{coupon}") {
      if (!coupon) return "";
      return `Use code ${coupon.code} — ${coupon.description ?? "live offer"}`;
    }
    return out;
  }).filter(t => t.trim().length > 0);

  // If after filtering we have no items left (e.g. only coupon item but no coupon),
  // fallback to defaults without the coupon
  if (items.length === 0) {
    items = defaultItems.filter(t => t && !t.includes("Use code undefined"));
  }

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
