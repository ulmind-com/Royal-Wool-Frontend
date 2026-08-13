import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Package2 } from "lucide-react";

import { useSettings } from "@/hooks/use-settings";
import { type Combo, comboIsLive, combosQuery } from "@/lib/api/catalog-extras";
import { productsQuery } from "@/lib/api/queries";
import { fmtDate } from "@/lib/date";

/**
 * Bundle offers from the admin's Combos screen: buy N of the listed yarns for
 * a flat price. Product titles are resolved from the catalogue we already
 * cache, so the strip costs no extra request in the common case.
 */
export function BundleOffers() {
  const { formatMoney } = useSettings();
  const { data } = useQuery(combosQuery);
  const { data: catalogue } = useQuery(productsQuery({ limit: 100 }));

  const combos = (data ?? []).filter(comboIsLive);
  if (combos.length === 0) return null;

  const titleFor = (id: string) => catalogue?.find((p) => p.id === id)?.title;

  return (
    <section aria-label="Bundle offers" className="mt-16">
      <h2 className="font-display text-2xl font-light tracking-[-0.02em] text-foreground sm:text-3xl">
        Bundle offers
      </h2>
      <p className="mt-2 font-data text-2xs text-muted-foreground">
        Mix and match the listed yarns — the bundle price applies at checkout.
      </p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {combos.map((c) => (
          <li key={c.id} className="rounded-2xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-marigold/15 px-2.5 py-1 font-data text-2xs uppercase tracking-wider text-marigold">
                  <Package2 className="h-3.5 w-3.5" /> Any {c.qty}
                </span>
                <h3 className="mt-2 font-display text-lg font-light text-foreground">{c.name}</h3>
              </div>
              <span className="shrink-0 font-display text-xl text-foreground">
                {formatMoney(c.price)}
              </span>
            </div>

            {c.description ? (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
            ) : null}

            {c.product_ids?.length ? (
              <ul className="mt-3 space-y-1 border-t border-border pt-3">
                {c.product_ids.slice(0, 4).map((pid) => {
                  const title = titleFor(pid);
                  return (
                    <li key={pid} className="truncate font-data text-2xs text-muted-foreground">
                      <Link
                        to="/product/$id"
                        params={{ id: pid }}
                        className="transition-colors hover:text-marigold"
                      >
                        {title ?? "View yarn"}
                      </Link>
                    </li>
                  );
                })}
                {c.product_ids.length > 4 ? (
                  <li className="font-data text-2xs text-muted-foreground/70">
                    +{c.product_ids.length - 4} more
                  </li>
                ) : null}
              </ul>
            ) : null}

            <Endsline combo={c} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Endsline({ combo }: { combo: Combo }) {
  if (!combo.end_date) return null;
  return (
    <p className="mt-3 font-data text-2xs text-madder">
      Ends {fmtDate(combo.end_date)}
    </p>
  );
}
