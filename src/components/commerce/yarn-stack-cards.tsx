import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, type MotionStyle, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { Glass } from "@/components/ui/glass";
import { useReducedMotion } from "@/hooks/use-motion";
import { useSettings } from "@/hooks/use-settings";
import { productsQuery } from "@/lib/api/queries";
import { getRecentCategoryIds } from "@/lib/category-history";
import { displayPrice, type Product } from "@/lib/api/types";

/**
 * Scroll-stacking range cards — **product-led & shade-cycling**.
 *
 * Each card is a single yarn (product). The big image cycles continuously
 * through every shade that yarn comes in (product.colors[].images), so the
 * card "changes colour" while you look at it. The shade order is shuffled on
 * mount, and which products appear is shuffled too, so every visit differs.
 *
 * Products are lightly personalised: yarns from categories the visitor has
 * browsed float to the front (see src/lib/category-history.ts). The card
 * design — image + copy + specs grid + CTA — is unchanged from the ranges
 * version; only the data behind it moved from categories to products.
 */

type ShadeImage = { image: string; name: string };

type CardData = {
  key: string;
  productId: string;
  eyebrow: string;
  title: string;
  copy: string;
  imageAlt: string;
  shades: ShadeImage[];
  fallbackImage: string;
  specs: { label: string; value: string }[];
  cta: string;
};

/** All shade images of a product, paired with the shade name, de-duped. */
function collectShades(p: Product): ShadeImage[] {
  const out: ShadeImage[] = [];
  for (const c of p.colors ?? []) {
    const name = c.name ?? c.color_family ?? "Shade";
    for (const img of c.images ?? []) {
      if (img) out.push({ image: img, name });
    }
  }
  if (out.length === 0) {
    const name = p.primary_color_name ?? p.title;
    for (const img of p.images ?? []) {
      if (img) out.push({ image: img, name });
    }
  }
  const seen = new Set<string>();
  return out.filter((s) => (seen.has(s.image) ? false : (seen.add(s.image), true)));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function productToCard(
  p: Product,
  index: number,
  formatMoney: (n: number | null | undefined) => string,
): CardData {
  const shades = collectShades(p);
  const colorCount = p.colors?.length ?? shades.length;
  return {
    key: p.id,
    productId: p.id,
    eyebrow: `Yarn ${String(index + 1).padStart(2, "0")} · ${p.brand ?? p.product_line ?? "Royal Wool"}`,
    title: p.title,
    copy:
      p.short_description ??
      p.description ??
      "Every shade this yarn is wound in — cycling through live. Tap to pick your colour.",
    imageAlt: p.title,
    shades,
    fallbackImage: shades[0]?.image ?? "",
    specs: [
      { label: "Shades", value: colorCount > 1 ? `${colorCount} colours` : "1 colour" },
      { label: "Weight", value: p.skein_weight ? `${p.skein_weight} g / skein` : "See label" },
      { label: "From", value: formatMoney(displayPrice(p)) },
    ],
    cta: "Shop this yarn",
  };
}

export function YarnStackCards() {
  const reduced = useReducedMotion();
  const { formatMoney } = useSettings();
  const { data: products, isPending } = useQuery(productsQuery({ sort: "popular", limit: 12 }));
  const [recentIds, setRecentIds] = useState<string[]>([]);

  // Read browsing history on mount (client-only)
  useEffect(() => {
    setRecentIds(getRecentCategoryIds());
  }, []);

  const hasHistory = recentIds.length > 0;

  // Build the 3 cards — one product each, shade-cycling, lightly personalised.
  const cards = useMemo(() => {
    const withShades = (products ?? []).filter((p) => collectShades(p).length > 0);
    if (withShades.length === 0) return [];

    // Prefer yarns that come in more than one shade — the cycling is the point.
    const multi = withShades.filter((p) => collectShades(p).length > 1);
    const pool = multi.length >= 3 ? multi : withShades;

    // Float products from browsed categories to the front, shuffle within groups.
    const recent = new Set(recentIds);
    const fromHistory = shuffle(pool.filter((p) => p.category_id && recent.has(p.category_id)));
    const rest = shuffle(pool.filter((p) => !(p.category_id && recent.has(p.category_id))));

    return [...fromHistory, ...rest].slice(0, 3).map((p, i) => productToCard(p, i, formatMoney));
    // formatMoney is stable per settings; recompute when data/history change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, recentIds]);

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

  // Don't render until we have products
  if (isPending || cards.length === 0) return null;

  return (
    <section
      data-thread-anchor="ranges"
      className="mt-24 sm:mt-28"
      aria-labelledby="yarn-stack-heading"
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-14">
        <p className="font-data text-2xs text-marigold">
          {hasHistory ? "Picked for you" : "Every shade, live"}
        </p>
        <h2
          id="yarn-stack-heading"
          className="mt-3 font-display text-3xl font-light tracking-[-0.02em] text-foreground sm:text-4xl"
        >
          Explore our ranges
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Each yarn cycles through every colour it's wound in — scroll through and shop the shade
          that catches your eye.
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

const ROTATE_MS = 3200;

/** Cycles through one product's shade images, with a live shade-name badge. */
function RotatingProductImage({
  shades,
  fallback,
  alt,
}: {
  shades: ShadeImage[];
  fallback: string;
  alt: string;
}) {
  const reduced = useReducedMotion();

  // Shuffle shade order on mount so each visit starts on a different colour.
  const ordered = useMemo(() => {
    if (shades.length === 0) {
      return fallback ? [{ image: fallback, name: alt }] : [];
    }
    return shuffle(shades);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shades, fallback]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (ordered.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % ordered.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [ordered.length]);

  const current = ordered[idx % ordered.length] ?? { image: fallback, name: alt };

  return (
    <>
      <AnimatePresence>
        <motion.img
          key={current.image}
          src={current.image}
          alt={alt}
          loading="lazy"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? {} : { opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--dur-cinematic)] ease-[var(--ease-enter)] group-hover:scale-[1.04]"
        />
      </AnimatePresence>

      {/* live shade name — updates as the colour cycles */}
      {ordered.length > 1 && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-10 sm:bottom-4 sm:left-4">
          <AnimatePresence mode="wait">
            <motion.span
              key={current.name}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? {} : { opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-3 py-1 font-data text-2xs text-foreground backdrop-blur"
            >
              <span
                className="h-2 w-2 rounded-full bg-marigold"
                aria-hidden
              />
              {current.name}
            </motion.span>
          </AnimatePresence>
        </div>
      )}
    </>
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
        {/* Left (top on mobile): auto-cycling shade images of this yarn */}
        <div className="relative h-[150px] shrink-0 overflow-hidden xs:h-[170px] sm:h-[240px] lg:h-auto lg:min-h-full">
          <RotatingProductImage
            shades={card.shades}
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
              to="/product/$id"
              params={{ id: card.productId }}
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
