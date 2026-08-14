import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, type MotionStyle, motion, useScroll, useTransform } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Glass } from "@/components/ui/glass";
import { useReducedMotion } from "@/hooks/use-motion";
import { categoryTreeQuery, productsQuery } from "@/lib/api/queries";
import { getRecentCategoryIds } from "@/lib/category-history";
import { primaryImage } from "@/lib/api/types";
import type { CategoryNode } from "@/lib/api/types";

/**
 * Scroll-stacking range cards — **personalised & admin-driven**.
 *
 * Shows the top 3 categories most relevant to the current user:
 * - If the user has browsing history → their most-viewed categories
 * - If no history → first 3 categories from the admin panel
 *
 * All data (image, name, blurb) comes from /categories/tree (admin panel).
 * Clicking a card takes the user to the category page to shop.
 */

type CardData = {
  key: string;
  categoryId: string;
  eyebrow: string;
  title: string;
  copy: string;
  fallbackImage: string;
  imageAlt: string;
  slug: string;
  specs: { label: string; value: string }[];
  cta: string;
};

function categoryToCard(cat: CategoryNode, index: number): CardData {
  // Derive a fibre-type hint from the category name for the specs row
  const nameLower = cat.name.toLowerCase();
  const fibre = nameLower.includes("cotton") ? "Cotton blend"
    : nameLower.includes("acrylic") ? "Premium acrylic"
    : "Blended fibre";

  return {
    key: cat.id,
    categoryId: cat.id,
    eyebrow: `Range ${String(index + 1).padStart(2, "0")} · ${cat.name}`,
    title: cat.name,
    copy: cat.blurb ?? "Explore this range — tap to see all shades, weights and live stock.",
    fallbackImage: cat.image ?? "",
    imageAlt: cat.name,
    slug: cat.slug,
    specs: [
      { label: "Fibre", value: fibre },
      { label: "Shades", value: "Multiple colours" },
      { label: "Care", value: "See product label" },
    ],
    cta: `Shop ${cat.name}`,
  };
}

export function YarnStackCards() {
  const reduced = useReducedMotion();
  const { data: tree, isPending } = useQuery(categoryTreeQuery);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  // Read browsing history on mount (client-only)
  useEffect(() => {
    setRecentIds(getRecentCategoryIds());
  }, []);

  // Build the 3 cards — personalised by browsing history
  const cards = useMemo(() => {
    const allCategories = (tree ?? [])
      .filter((c) => !c.parent_id && c.image)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (allCategories.length === 0) return [];

    let picked: CategoryNode[];

    if (recentIds.length > 0) {
      // User has history — show their most-viewed categories first
      const byId = new Map(allCategories.map((c) => [c.id, c]));
      const fromHistory = recentIds
        .map((id) => byId.get(id))
        .filter(Boolean) as CategoryNode[];
      // Fill remaining slots from categories they haven't seen
      const seen = new Set(fromHistory.map((c) => c.id));
      const rest = allCategories.filter((c) => !seen.has(c.id));
      picked = [...fromHistory, ...rest].slice(0, 3);
    } else {
      // New user — show the first 3 admin-ordered categories
      picked = allCategories.slice(0, 3);
    }

    return picked.map((cat, i) => categoryToCard(cat, i));
  }, [tree, recentIds]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity1 = useTransform(scrollYProgress, [0, 0.33], [1, 0]);
  const scale1 = useTransform(scrollYProgress, [0, 0.33], [1, 0.9]);
  const opacity2 = useTransform(scrollYProgress, [0.33, 0.66], [1, 0]);
  const scale2 = useTransform(scrollYProgress, [0.33, 0.66], [1, 0.9]);

  const stackStyles: MotionStyle[] = [
    { opacity: opacity1, scale: scale1 },
    { opacity: opacity2, scale: scale2 },
    {},
  ];

  const flat = reduced;

  // Don't render until we have categories
  if (isPending || cards.length === 0) return null;

  return (
    <section
      data-thread-anchor="ranges"
      className="mt-24 sm:mt-28"
      aria-labelledby="yarn-stack-heading"
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-14">
        <p className="font-data text-2xs text-marigold">Picked for you</p>
        <h2
          id="yarn-stack-heading"
          className="mt-3 font-display text-3xl font-light tracking-[-0.02em] text-foreground sm:text-4xl"
        >
          {recentIds.length > 0
            ? "Your top ranges"
            : "Explore our ranges"}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {recentIds.length > 0
            ? "Based on your browsing — scroll through and shop your favourites."
            : "Scroll through our house ranges — each one stacks over the last."}
        </p>
      </div>

      <div ref={containerRef} className="relative mt-10">
        {cards.map((card, i) => (
          <motion.div
            key={card.key}
            style={flat ? {} : (stackStyles[i] ?? {})}
            className={
              flat
                ? "mx-auto w-full max-w-[1200px] px-4 pb-8 sm:px-8 lg:px-14"
                : "sticky top-14 mx-auto flex h-[88svh] w-full max-w-[1200px] items-center px-4 sm:top-0 sm:h-svh sm:px-8 lg:px-14"
            }
          >
            <RangeCard card={card} index={i} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const ROTATE_MS = 4000;

function RotatingProductImage({ categoryId, fallback, alt }: { categoryId: string; fallback: string; alt: string }) {
  const { data } = useQuery(productsQuery({ category_id: categoryId, limit: 20 }));
  const reduced = useReducedMotion();

  // Collect all product images, shuffle on mount
  const images = useMemo(() => {
    const products = data ?? [];
    const imgs = products
      .map((p) => primaryImage(p))
      .filter(Boolean) as string[];
    if (imgs.length === 0) return [fallback].filter(Boolean);
    // Shuffle so each visit starts differently
    for (let i = imgs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [imgs[i], imgs[j]] = [imgs[j]!, imgs[i]!];
    }
    return imgs;
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
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--dur-cinematic)] ease-[var(--ease-enter)] group-hover:scale-[1.04]"
      />
    </AnimatePresence>
  );
}

function RangeCard({ card, index }: { card: CardData; index: number }) {
  return (
    <article
      className="group relative w-full overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-[0_50px_110px_-60px_color-mix(in_oklab,var(--ink)_60%,transparent)] sm:rounded-[2rem]"
      style={{ minHeight: "clamp(380px, 68svh, 580px)" }}
    >
      {/* dye glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            index % 2 === 0
              ? "radial-gradient(120% 90% at 92% 8%, color-mix(in oklab, var(--marigold) 16%, transparent), transparent 60%)"
              : "radial-gradient(120% 90% at 92% 8%, color-mix(in oklab, var(--madder) 14%, transparent), transparent 60%)",
        }}
      />

      <div className="relative grid h-full gap-0 lg:grid-cols-2">
        {/* Left (top on mobile): auto-rotating product images */}
        <div className="relative h-[150px] shrink-0 overflow-hidden xs:h-[170px] sm:h-[240px] lg:h-auto lg:min-h-full">
          <RotatingProductImage
            categoryId={card.categoryId}
            fallback={card.fallbackImage}
            alt={card.imageAlt}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,color-mix(in_oklab,var(--card)_85%,transparent)_100%)] lg:bg-[linear-gradient(to_right,transparent_55%,color-mix(in_oklab,var(--card)_85%,transparent)_100%)]"
          />
        </div>

        {/* Right (below on mobile): copy */}
        <div className="flex min-w-0 flex-col justify-center gap-4 px-5 py-6 sm:gap-6 sm:px-10 sm:py-12 lg:px-14">
          <Glass
            variant="pill"
            className="w-fit whitespace-nowrap font-data text-2xs uppercase tracking-[0.18em] text-ink"
          >
            {card.eyebrow}
          </Glass>

          <h3 className="font-display text-2xl font-light leading-[1.05] tracking-[-0.02em] text-foreground xs:text-3xl sm:text-4xl lg:text-5xl">
            {card.title}
          </h3>

          <p className="max-w-md text-[0.8rem] leading-relaxed text-muted-foreground sm:text-base">
            {card.copy}
          </p>

          <dl className="grid grid-cols-3 gap-2 border-t border-border pt-4 sm:gap-3 sm:pt-5">
            {card.specs.map((spec) => (
              <div key={spec.label} className="min-w-0">
                <dt className="font-data text-2xs text-marigold">{spec.label}</dt>
                <dd className="mt-1 text-[0.7rem] leading-snug text-foreground sm:text-xs">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-center gap-4 pt-1 sm:gap-5">
            <Link
              to="/collections/$slug"
              params={{ slug: card.slug }}
              data-cursor="link"
              className="sheen inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-data text-2xs text-primary-foreground transition-transform duration-[var(--dur-micro)] hover:-translate-y-0.5"
            >
              {card.cta}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            </Link>
            <Link
              to="/collections"
              data-cursor="link"
              className="story-link font-data text-2xs text-muted-foreground hover:text-foreground"
            >
              All collections
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
