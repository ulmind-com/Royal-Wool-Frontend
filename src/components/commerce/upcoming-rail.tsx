import { Link } from "@tanstack/react-router";

import { Glass } from "@/components/ui/glass";
import {
  UPCOMING_FALLBACK,
  groupUpcomingByCategory,
  type UpcomingRange,
} from "@/data/upcoming";
import { waNotifyMe } from "@/lib/whatsapp";

/**
 * Single upcoming-range card. Shared by the home rail and the /upcoming page so
 * the two surfaces can never drift apart.
 */
export function UpcomingCard({ range }: { range: UpcomingRange }) {
  return (
    <Glass variant="card" className="flex h-full flex-col gap-5" data-cursor="product">
      <div className="flex items-start justify-between gap-3">
        <p className="font-data text-2xs text-marigold">Coming soon</p>
        <div className="flex shrink-0 gap-1" aria-hidden>
          {range.palette.map((hex) => (
            <span
              key={hex}
              className="h-4 w-4 rounded-full border border-border"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>

      <div
        className="mx-auto h-28 w-28 rounded-full"
        style={{
          backgroundImage: `linear-gradient(135deg, ${range.palette.join(", ")})`,
          boxShadow: `0 30px 60px -28px ${range.palette[0]}`,
        }}
        aria-hidden
      />

      <div className="min-w-0">
        <p className="font-data text-2xs text-muted-foreground">{range.category}</p>
        <h3 className="mt-2 font-display text-2xl font-light text-foreground">{range.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{range.blurb}</p>
      </div>

      <a
        href={waNotifyMe(range.name)}
        target="_blank"
        rel="noopener"
        aria-label={`Notify me on WhatsApp when ${range.name} is available`}
        data-cursor="link"
        className="sheen mt-auto inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 font-data text-2xs text-foreground transition-colors hover:border-marigold hover:text-marigold"
      >
        Notify me on WhatsApp
      </a>
    </Glass>
  );
}

/**
 * Home-page Upcoming section: category-wise groups, each a horizontal snap rail
 * on small screens and a grid from lg up.
 */
export function UpcomingRail({
  ranges = UPCOMING_FALLBACK,
}: {
  ranges?: UpcomingRange[];
}) {
  const groups = groupUpcomingByCategory(ranges);
  if (!groups.length) return null;

  return (
    <section data-thread-anchor="upcoming" className="mt-20" aria-label="Upcoming products">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-data text-2xs text-marigold">04 · Upcoming products</p>
            <h2 className="mt-3 font-display text-4xl font-light text-foreground">
              On the <span className="italic text-marigold">dyeing rack</span>
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Six new ranges landing soon. Tap a card and we'll WhatsApp you the day it goes live.
            </p>
          </div>
          <Link
            to="/upcoming"
            data-cursor="link"
            className="rounded-full border border-border px-5 py-2.5 font-data text-2xs text-muted-foreground transition-colors hover:text-foreground"
          >
            View all upcoming
          </Link>
        </div>

        {groups.map((group) => (
          <div key={group.category} className="mt-10">
            <div className="flex items-center gap-4">
              <h3 className="font-data text-2xs text-foreground">{group.category}</h3>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </div>

            <ul className="-mx-1 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible">
              {group.ranges.map((range) => (
                <li key={range.name} className="w-[70vw] shrink-0 snap-start sm:w-[42vw] lg:w-auto">
                  <UpcomingCard range={range} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
