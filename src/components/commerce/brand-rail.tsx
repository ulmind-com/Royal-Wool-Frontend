import { motion } from "framer-motion";

import { Glass } from "@/components/ui/glass";
import type { BrandGroup } from "@/lib/api/brands";
import { cn } from "@/lib/utils";

/**
 * Brand selector for the Shop page.
 *
 * Compact liquid-glass cards — deliberately short, so the grid stays above the
 * fold. Fully data-driven: whatever brandGroups() returns is what renders.
 */
export function BrandRail({
  groups,
  active,
  onSelect,
}: {
  groups: BrandGroup[];
  active: string;
  onSelect: (key: string) => void;
}) {
  if (!groups.length) return null;

  return (
    <section aria-labelledby="shop-brands" className="mt-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="shop-brands" className="font-data text-2xs uppercase tracking-[0.18em] text-marigold">
          Shop by brand
        </h2>
        {active ? (
          <button
            type="button"
            data-cursor="link"
            onClick={() => onSelect("")}
            className="font-data text-2xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear brand
          </button>
        ) : null}
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {groups.map((g, i) => {
          const selected = active === g.key;
          return (
            <li key={g.key}>
              <motion.button
                type="button"
                data-cursor="link"
                aria-pressed={selected}
                onClick={() => onSelect(selected ? "" : g.key)}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="group block w-full text-left"
              >
                <Glass
                  variant="card"
                  className={cn(
                    "relative flex items-center gap-4 overflow-hidden !p-3 transition-transform duration-[var(--dur-standard)] group-hover:-translate-y-0.5 sm:!p-4",
                    selected && "ring-1 ring-marigold",
                  )}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
                    style={{ backgroundColor: g.meta.accent }}
                  />
                  <img
                    src={g.meta.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-base font-light text-foreground sm:text-lg">
                      {g.meta.name}
                    </span>
                    <span className="mt-0.5 block truncate font-data text-2xs text-muted-foreground/80">
                      {g.meta.blurb}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-2 font-data text-[10px] uppercase tracking-[0.14em] text-marigold">
                      {g.products.length} {g.products.length === 1 ? "yarn" : "yarns"}
                      <span aria-hidden className="text-muted-foreground/60">
                        {selected ? "· filtering" : "· view range"}
                      </span>
                    </span>
                  </span>
                </Glass>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
