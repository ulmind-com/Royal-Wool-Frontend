import { motion } from "framer-motion";

import { Glass } from "@/components/ui/glass";
import type { BrandGroup } from "@/lib/api/brands";
import { cn } from "@/lib/utils";

/**
 * Brand selector for the Shop sidebar.
 *
 * Compact vertical list so it fits a 260px rail. Fully data-driven: whatever
 * brandGroups() returns is what renders.
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
    <section aria-labelledby="shop-brands">
      <h2
        id="shop-brands"
        className="font-data text-2xs uppercase tracking-[0.16em] text-muted-foreground/70"
      >
        Brand
      </h2>

      <ul className="mt-3 space-y-2">
        {groups.map((g, i) => {
          const selected = active === g.key;
          return (
            <li key={g.key}>
              <motion.button
                type="button"
                data-cursor="link"
                aria-pressed={selected}
                onClick={() => onSelect(selected ? "" : g.key)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="group block w-full text-left"
              >
                <Glass
                  variant="card"
                  className={cn(
                    "relative flex items-center gap-3 overflow-hidden !p-2.5 transition-transform duration-[var(--dur-standard)] group-hover:-translate-y-0.5",
                    selected && "ring-1 ring-marigold",
                  )}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
                    style={{ backgroundColor: g.meta.accent }}
                  />
                  <img
                    src={g.meta.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-11 w-11 shrink-0 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-light text-foreground">
                      {g.meta.name}
                    </span>
                    <span className="mt-0.5 block font-data text-[10px] uppercase tracking-[0.12em] text-marigold">
                      {g.products.length} {g.products.length === 1 ? "yarn" : "yarns"}
                      {selected ? (
                        <span aria-hidden className="text-muted-foreground/60">
                          {" "}
                          · active
                        </span>
                      ) : null}
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
