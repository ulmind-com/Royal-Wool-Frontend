import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { CardSkeleton } from "@/components/data-state";
import { categoryTreeQuery } from "@/lib/api/queries";

/**
 * "Shop by fibre" tiles, straight from the category tree so a new range in the
 * admin appears here without a code change.
 */
export function CategoryTiles() {
  const { data, isPending } = useQuery(categoryTreeQuery);
  const top = (data ?? []).filter((c) => !c.parent_id).slice(0, 6);

  if (!isPending && !top.length) return null;

  return (
    <section data-thread-anchor="fibre" className="mt-20" aria-label="Shop by fibre">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <p className="font-data text-2xs text-marigold">02 · Shop by fibre</p>
        <h2 className="mt-3 font-display text-4xl font-light text-fleece">
          Pick your fibre, then your shade
        </h2>

        {isPending ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <CardSkeleton key={i} className="aspect-[16/9]" />
            ))}
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {top.map((c) => (
              <li key={c.id}>
                <Link
                  to="/collections/$slug"
                  params={{ slug: c.slug }}
                  data-cursor="link"
                  className="group relative block aspect-[16/9] overflow-hidden rounded-2xl border border-border"
                >
                  {c.image ? (
                    <img
                      src={c.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-enter)] group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{ backgroundImage: "var(--dye-flow)", opacity: 0.5 }}
                      aria-hidden
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(to top, color-mix(in oklab, var(--ink) 88%, transparent), transparent 65%)",
                    }}
                    aria-hidden
                  />
                  <span className="absolute bottom-4 left-5 font-display text-2xl font-light text-fleece">
                    {c.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
