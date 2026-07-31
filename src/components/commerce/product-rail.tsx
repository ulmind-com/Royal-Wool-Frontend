import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { ProductCard } from "@/components/commerce/product-card";
import { CardSkeleton, DataError } from "@/components/data-state";
import { productsQuery, type ProductFilters } from "@/lib/api/queries";

/**
 * Horizontal catalogue rail. Rails are cheap to add because each one is just a
 * different filter against /products; when admin-driven home sections land,
 * only the filter argument changes.
 */
export function ProductRail({
  anchor,
  eyebrow,
  title,
  note,
  filters,
  viewAllTo = "/collections",
}: {
  anchor: string;
  eyebrow: string;
  title: string;
  note?: string;
  filters?: ProductFilters;
  viewAllTo?: "/collections" | "/offers" | "/upcoming";
}) {
  const { data, isPending, isError, error, refetch } = useQuery(
    productsQuery({ limit: 8, ...filters }),
  );

  // A rail with nothing in it is noise — drop it rather than show an empty shelf.
  if (!isPending && !isError && !data?.length) return null;

  return (
    <section data-thread-anchor={anchor} className="mt-20" aria-label={title}>
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-data text-2xs text-marigold">{eyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-light text-foreground">{title}</h2>
            {note ? <p className="mt-3 max-w-xl text-muted-foreground">{note}</p> : null}
          </div>
          <Link
            to={viewAllTo}
            data-cursor="link"
            className="rounded-full border border-border px-5 py-2.5 font-data text-2xs text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>

        <div className="mt-8">
          {isError ? (
            <DataError error={error} retry={() => void refetch()} title="This shelf didn't load" />
          ) : isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <CardSkeleton key={i} className="aspect-[3/4]" />
              ))}
            </div>
          ) : (
            <ul className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible">
              {(data ?? []).slice(0, 8).map((p) => (
                <li key={p.id} className="w-[70vw] shrink-0 snap-start sm:w-[42vw] lg:w-auto">
                  <ProductCard product={p} className="h-full" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
