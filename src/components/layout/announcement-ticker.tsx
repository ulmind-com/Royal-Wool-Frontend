/**
 * Thin marquee strip. Copy is provisional in Phase 1 — Phase 2 swaps the
 * free-delivery threshold and support line for values from GET /settings.
 */
const ITEMS = [
  "Free delivery on qualifying orders — threshold from store settings",
  "Skin-safe, tested dyes — gentle enough for baby knits",
  "Support 10am–7pm IST, all days",
  "Small-batch colour, wound for stitch definition",
];

export function AnnouncementTicker() {
  const row = [...ITEMS, ...ITEMS];

  return (
    <div
      className="relative overflow-hidden border-b border-border"
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
              className="flex shrink-0 items-center gap-10 whitespace-nowrap font-data text-2xs text-fleece/80"
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
