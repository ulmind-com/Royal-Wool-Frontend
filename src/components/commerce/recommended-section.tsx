import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

import { ProductCard } from "@/components/commerce/product-card";
import { getRecentCategories, type CategoryEntry } from "@/lib/category-history";
import { useReducedMotion } from "@/hooks/use-motion";
import { productsQuery } from "@/lib/api/queries";

/**
 * "Picked for You" — personalised product rail based on the categories the
 * shopper has recently browsed. Reads localStorage, fetches products from
 * those categories, and renders a scrollable rail. First-time visitors
 * (no history) see nothing.
 */

export function RecommendedSection() {
  const reduced = useReducedMotion();
  const [history, setHistory] = useState<CategoryEntry[]>([]);

  // Read history on mount (client-side only)
  useEffect(() => {
    setHistory(getRecentCategories());
  }, []);

  // Use the most recent category for the query
  const topCategory = history[0];

  const { data, isPending } = useQuery({
    ...productsQuery({
      ...(topCategory?.id ? { category_id: topCategory.id } : {}),
      limit: 12,
      sort: "newest",
    }),
    enabled: Boolean(topCategory?.id),
  });

  const products = useMemo(() => data ?? [], [data]);

  // Don't render if no history or no products
  if (!topCategory || (!isPending && products.length === 0)) return null;

  return (
    <section
      data-thread-anchor="recommended"
      aria-label="Picked for you"
      className="mt-20 sm:mt-28"
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={reduced ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div className="max-w-2xl">
            <p className="font-data text-2xs text-marigold inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
              Picked for you
            </p>
            <h2 className="mt-3 font-display text-3xl font-light tracking-[-0.02em] text-foreground sm:text-4xl">
              Because you browsed{" "}
              <span className="text-marigold">{topCategory.name}</span>
            </h2>
            {history.length > 1 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Based on your recent browsing — fresh picks from your favourite ranges.
              </p>
            )}
          </div>

          <Link
            to="/collections/$slug"
            params={{ slug: topCategory.slug }}
            data-cursor="link"
            className="sheen inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-5 py-2.5 font-data text-2xs text-foreground transition-colors hover:border-marigold hover:text-marigold"
          >
            View all in {topCategory.name}
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          </Link>
        </motion.div>

        {/* Products rail */}
        {isPending ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-muted/40"
              />
            ))}
          </div>
        ) : (
          <ul className="-mx-1 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 sm:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {products.map((p, i) => (
              <motion.li
                key={p.id}
                className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%] xl:w-[19%]"
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={reduced ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(i, 4) * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <ProductCard product={p} className="h-full" />
              </motion.li>
            ))}
          </ul>
        )}

        {/* Other recently viewed categories as pills */}
        {history.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="font-data text-2xs text-muted-foreground/70 self-center mr-1">
              Also browsed:
            </span>
            {history.slice(1).map((entry) => (
              <Link
                key={entry.id}
                to="/collections/$slug"
                params={{ slug: entry.slug }}
                data-cursor="link"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 font-data text-2xs text-muted-foreground transition-all hover:border-marigold hover:text-foreground hover:-translate-y-0.5"
              >
                {entry.name}
                <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} aria-hidden />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
