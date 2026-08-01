import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { CardSkeleton, DataError, EmptyState } from "@/components/data-state";
import { useReducedMotion } from "@/hooks/use-motion";
import { categoryTreeQuery } from "@/lib/api/queries";
import type { CategoryNode } from "@/lib/api/types";

import fallback1 from "@/assets/cat-fallback-1.jpg.asset.json";
import fallback2 from "@/assets/cat-fallback-2.jpg.asset.json";
import fallback3 from "@/assets/cat-fallback-3.jpg.asset.json";
import fallback4 from "@/assets/cat-fallback-4.jpg.asset.json";

/**
 * "Shop by Category" — image tile with the name underneath, one per top-level
 * category from /categories/tree. Everything (order, image, name, how many
 * tiles) is admin-controlled; the fallback photos only fill in for categories
 * that don't have an image uploaded yet.
 */

const FALLBACK_IMAGES = [fallback1.url, fallback2.url, fallback3.url, fallback4.url];

function tileImage(category: CategoryNode, index: number): string {
  return category.image ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]!;
}

function CategoryTile({
  category,
  index,
  reduced,
}: {
  category: CategoryNode;
  index: number;
  reduced: boolean;
}) {
  const childCount = category.children?.length ?? 0;

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 26 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay: Math.min(index, 5) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/collections/$slug"
        params={{ slug: category.slug }}
        data-cursor="product"
        aria-label={`Shop ${category.name}`}
        className="group block focus-visible:outline-none"
      >
        <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card transition-all duration-[var(--dur-slow)] ease-[var(--ease-enter)] group-hover:-translate-y-1.5 group-hover:border-marigold/50 group-hover:shadow-[0_36px_70px_-40px_color-mix(in_oklab,var(--ink)_45%,transparent)] group-focus-visible:border-marigold">
          {/* dye glow behind the yarn ball */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--dur-slow)] group-hover:opacity-100"
            style={{
              backgroundImage:
                "radial-gradient(120% 90% at 50% 100%, color-mix(in oklab, var(--marigold) 22%, transparent), transparent 62%)",
            }}
            aria-hidden
          />

          <div className="relative aspect-[4/5] overflow-hidden">
            <img
              src={tileImage(category, index)}
              alt={category.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-enter)] group-hover:scale-[1.06]"
              style={
                category.image_scale
                  ? { transform: `scale(${category.image_scale})` }
                  : undefined
              }
            />
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
              style={{
                backgroundImage:
                  "linear-gradient(to top, color-mix(in oklab, var(--background) 92%, transparent), transparent)",
              }}
              aria-hidden
            />
            <span className="absolute right-4 top-4 inline-flex h-9 w-9 translate-y-1 items-center justify-center rounded-full border border-border bg-background/80 text-foreground opacity-0 backdrop-blur transition-all duration-[var(--dur-base)] group-hover:translate-y-0 group-hover:opacity-100">
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </span>
          </div>
        </div>

        <div className="mt-5 text-center">
          <h3 className="font-display text-xl font-normal text-foreground sm:text-2xl">
            <span className="relative inline-block pb-1">
              {category.name}
              <span
                className="absolute bottom-0 left-0 h-px w-full origin-right scale-x-0 bg-marigold transition-transform duration-[var(--dur-base)] ease-[var(--ease-enter)] group-hover:origin-left group-hover:scale-x-100"
                aria-hidden
              />
            </span>
          </h3>
          <p className="mt-1.5 font-data text-2xs text-muted-foreground">
            {childCount ? `${childCount} ranges` : "Explore range"}
          </p>
        </div>
      </Link>
    </motion.li>
  );
}

export function CategoryShowcase() {
  const reduced = useReducedMotion();
  const { data, isPending, isError, error, refetch } = useQuery(categoryTreeQuery);

  const categories = (data ?? [])
    .filter((c) => !c.parent_id)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <section
      data-thread-anchor="category"
      className="mt-24 sm:mt-28"
      aria-labelledby="shop-by-category"
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-data text-2xs text-marigold">02 · Categories</p>
            <h2
              id="shop-by-category"
              className="mt-3 font-display text-4xl font-light tracking-[-0.02em] text-foreground sm:text-5xl"
            >
              Shop by Category
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Every range we wind, sorted the way crafters shop — pick a category and see
              its shades, weights and live stock.
            </p>
          </div>

          <Link
            to="/collections"
            data-cursor="link"
            className="sheen inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-5 py-2.5 font-data text-2xs text-foreground transition-colors hover:border-marigold hover:text-marigold"
          >
            View all collections
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          </Link>
        </div>

        {isPending ? (
          <div
            className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-7 lg:grid-cols-4"
            aria-hidden
          >
            {[0, 1, 2, 3].map((i) => (
              <CardSkeleton key={i} className="aspect-[4/5] rounded-[1.75rem]" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-12">
            <DataError error={error} retry={() => void refetch()} />
          </div>
        ) : categories.length ? (
          <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-7 lg:grid-cols-4">
            {categories.map((c, i) => (
              <CategoryTile key={c.id} category={c} index={i} reduced={reduced} />
            ))}
          </ul>
        ) : (
          <div className="mt-12">
            <EmptyState
              title="Categories coming up"
              note="Ranges are being set up in the shop. Message us on WhatsApp and we'll tell you what's on the shelf."
            />
          </div>
        )}
      </div>
    </section>
  );
}
