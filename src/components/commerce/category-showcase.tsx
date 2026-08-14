import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { CardSkeleton, DataError, EmptyState } from "@/components/data-state";
import { WOOL_CATEGORIES } from "@/data/wool-categories";
import { useReducedMotion } from "@/hooks/use-motion";
import { categoryTreeQuery, productsQuery } from "@/lib/api/queries";
import { primaryImage, type CategoryNode } from "@/lib/api/types";

/**
 * "Shop by Category" — image tile with the name underneath.
 *
 * The shop's backend still returns the old clothing categories, so the section
 * renders the hand-written wool ranges from src/data/wool-categories.ts.
 * When real wool categories are seeded from the admin panel, set
 * USE_STATIC_CATEGORIES to false: the /categories/tree branch below then drives
 * order, names, counts, links and images automatically.
 */

const USE_STATIC_CATEGORIES = false;

type Tile = {
  key: string;
  id: string;
  name: string;
  image: string;
  note: string;
  href:
    | { to: "/search"; search: { q: string } }
    | { to: "/collections/$slug"; params: { slug: string } };
  imageScale?: number | undefined;
};

const STATIC_TILES: Tile[] = WOOL_CATEGORIES.map((c) => ({
  key: c.slug,
  id: c.slug,
  name: c.name,
  image: c.image,
  note: c.blurb,
  href: { to: "/search", search: { q: c.name } },
}));

function apiTile(category: CategoryNode): Tile {
  const childCount = category.children?.length ?? 0;
  return {
    key: category.id,
    id: category.id,
    name: category.name,
    image: category.image ?? WOOL_CATEGORIES[0]!.image,
    note: category.blurb ?? (childCount ? `${childCount} ranges` : "Explore range"),
    href: { to: "/collections/$slug", params: { slug: category.slug } },
    imageScale: category.image_scale ?? undefined,
  };
}

/** Renders the right typed Link for a static (search) or API (collection) tile. */
function TileLink({
  href,
  children,
  ...rest
}: {
  href: Tile["href"];
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
  "data-cursor"?: string;
}) {
  if (href.to === "/search") {
    return (
      <Link to="/search" search={href.search} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <Link to="/collections/$slug" params={href.params} {...rest}>
      {children}
    </Link>
  );
}

const ROTATE_MS = 3500;

function RotatingTileImage({ categoryId, fallback, alt, reduced }: { categoryId: string; fallback: string; alt: string; reduced: boolean }) {
  const { data } = useQuery(productsQuery({ category_id: categoryId, limit: 12 }));

  const images = useMemo(() => {
    const products = data ?? [];
    const imgs = products
      .map((p) => primaryImage(p))
      .filter(Boolean) as string[];
    if (imgs.length === 0) return [fallback].filter(Boolean);
    
    // Shuffle on mount so every visit shows different variants
    const shuffled = [...imgs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
  }, [data, fallback]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [images.length]);

  const currentImage = images[idx % images.length] ?? fallback;

  return (
    <AnimatePresence>
      <motion.img
        key={currentImage}
        src={currentImage}
        alt={alt}
        loading="lazy"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduced ? {} : { opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="absolute inset-0 h-full w-full object-contain transition-transform duration-[var(--dur-slow)] ease-[var(--ease-enter)] group-hover:scale-[1.06]"
      />
    </AnimatePresence>
  );
}

function CategoryTile({ tile, index, reduced }: { tile: Tile; index: number; reduced: boolean }) {
  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 26 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay: Math.min(index, 5) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <TileLink
        href={tile.href}
        data-cursor="product"
        aria-label={`Shop ${tile.name}`}
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
            <RotatingTileImage
              categoryId={tile.id}
              fallback={tile.image}
              alt={tile.name}
              reduced={reduced}
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
              {tile.name}
              <span
                className="absolute bottom-0 left-0 h-px w-full origin-right scale-x-0 bg-marigold transition-transform duration-[var(--dur-base)] ease-[var(--ease-enter)] group-hover:origin-left group-hover:scale-x-100"
                aria-hidden
              />
            </span>
          </h3>
          <p className="mt-1.5 font-data text-2xs text-muted-foreground">{tile.note}</p>
        </div>
      </TileLink>
    </motion.li>
  );
}

function SectionHeader() {
  return (
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
          Every range we wind, sorted the way crafters shop — pick a category and see its shades,
          weights and live stock.
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
  );
}

const GRID = "mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-7 lg:grid-cols-4";
const SECTION = "mt-24 sm:mt-28";
const SHELL = "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10";

function StaticShowcase({ reduced }: { reduced: boolean }) {
  return (
    <section data-thread-anchor="category" className={SECTION} aria-labelledby="shop-by-category">
      <div className={SHELL}>
        <SectionHeader />
        <ul className={GRID}>
          {STATIC_TILES.map((tile, i) => (
            <CategoryTile key={tile.key} tile={tile} index={i} reduced={reduced} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function ApiShowcase({ reduced }: { reduced: boolean }) {
  const { data, isPending, isError, error, refetch } = useQuery(categoryTreeQuery);

  const allTiles = (data ?? [])
    .filter((c) => !c.parent_id)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(apiTile);

  const visibleTiles = allTiles.slice(0, 4);
  const hasMore = allTiles.length > 4;

  return (
    <section data-thread-anchor="category" className={SECTION} aria-labelledby="shop-by-category">
      <div className={SHELL}>
        <SectionHeader />

        {isPending ? (
          <div className={GRID} aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <CardSkeleton key={i} className="aspect-[4/5] rounded-[1.75rem]" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-12">
            <DataError error={error} retry={() => void refetch()} />
          </div>
        ) : visibleTiles.length ? (
          <>
            <ul className={GRID}>
              {visibleTiles.map((tile, i) => (
                <CategoryTile key={tile.key} tile={tile} index={i} reduced={reduced} />
              ))}
            </ul>
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Link
                  to="/collections"
                  data-cursor="link"
                  className="sheen inline-flex items-center gap-2.5 rounded-full border border-border px-7 py-3 font-data text-2xs text-foreground transition-all duration-[var(--dur-base)] hover:border-marigold hover:text-marigold hover:-translate-y-0.5"
                >
                  See more categories
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                </Link>
              </div>
            )}
          </>
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

export function CategoryShowcase() {
  const reduced = useReducedMotion();
  return USE_STATIC_CATEGORIES ? (
    <StaticShowcase reduced={reduced} />
  ) : (
    <ApiShowcase reduced={reduced} />
  );
}
