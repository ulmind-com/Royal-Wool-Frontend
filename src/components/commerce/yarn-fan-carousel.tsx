import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Glass } from "@/components/ui/glass";
import { YARN_FAN_FALLBACKS, type FanCardData } from "@/data/yarn-fan";
import { useReducedMotion } from "@/hooks/use-motion";
import { productsQuery } from "@/lib/api/queries";
import { primaryImage } from "@/lib/api/types";

/**
 * Fanned lookbook carousel — cards spread in a shallow arc, the centre card
 * upright and sharp, side cards rotated, scaled down and dimmed. The stack
 * glides right → left one card at a time on its own.
 *
 * Backend still holds the old clothing catalogue, so the cards use the client's
 * yarn photography for now; titles/links come from the live catalogue whenever
 * products exist. Flip PREFER_LOCAL_IMAGES to false once /products returns real
 * wool products and the admin-managed images take over.
 */
const PREFER_LOCAL_IMAGES = true;
const AUTOPLAY_MS = 4000;
/** Slots visible on each side of the centre card. */
const SPREAD = 2;

type FanItem = FanCardData & { href: string };

/** Geometry per fan slot (-2 … +2). */
function slotStyle(offset: number) {
  const dir = Math.sign(offset);
  const abs = Math.abs(offset);
  return {
    x: `${offset * 46}%`,
    y: abs === 0 ? 0 : abs === 1 ? 34 : 78,
    rotate: dir * (abs === 1 ? 4.5 : abs === 2 ? 9 : 0),
    scale: abs === 0 ? 1 : abs === 1 ? 0.93 : 0.86,
    opacity: abs === 0 ? 1 : abs === 1 ? 0.9 : 0.72,
    zIndex: 10 - abs,
    filter: abs === 0 ? "brightness(1) blur(0px)" : `brightness(0.82) blur(${abs}px)`,
  };
}

function FanCard({
  item,
  offset,
  active,
  reduced,
  onSelect,
}: {
  item: FanItem;
  offset: number;
  active: boolean;
  reduced: boolean;
  onSelect: () => void;
}) {
  const s = slotStyle(offset);
  return (
    <motion.div
      className="absolute left-1/2 top-0 -ml-[calc(min(21rem,70vw)/2)] w-[min(21rem,70vw)]"
      style={{ zIndex: s.zIndex }}
      initial={false}
      animate={{
        x: s.x,
        y: s.y,
        rotate: s.rotate,
        scale: s.scale,
        opacity: s.opacity,
        filter: s.filter,
      }}
      transition={
        reduced ? { duration: 0 } : { type: "spring", stiffness: 130, damping: 20, mass: 0.9 }
      }
    >
      <button
        type="button"
        onClick={onSelect}
        tabIndex={active ? 0 : -1}
        data-cursor="link"
        aria-label={`Open ${item.title}`}
        aria-hidden={!active}
        className="group relative block aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] border border-[color-mix(in_oklab,var(--ink)_10%,transparent)] text-left shadow-[0_40px_90px_-45px_color-mix(in_oklab,var(--ink)_55%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold"
      >
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-enter)] group-hover:scale-[1.04]"
        />
        {/* bottom scrim so the copy stays readable over the yarn */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to top, color-mix(in oklab, var(--ink) 78%, transparent) 0%, color-mix(in oklab, var(--ink) 34%, transparent) 34%, transparent 62%)",
          }}
        />

        {/* floating label pill */}
        <motion.span
          className="absolute left-1/2 top-5 -translate-x-1/2"
          initial={false}
          animate={{ opacity: active ? 1 : 0, y: active ? 0 : -8 }}
          transition={{ duration: reduced ? 0 : 0.35 }}
        >
          <Glass
            variant="pill"
            className="whitespace-nowrap font-data text-2xs uppercase tracking-[0.18em] text-ink"
          >
            {item.label}
          </Glass>
        </motion.span>

        {/* title + caption */}
        <motion.span
          className="absolute inset-x-0 bottom-0 block px-6 pb-7"
          initial={false}
          animate={{ opacity: active ? 1 : 0, y: active ? 0 : 14 }}
          transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.05 }}
        >
          <span className="block font-display text-2xl font-normal leading-tight text-fleece">
            {item.title}
          </span>
          <span className="mt-2 block text-sm italic leading-snug text-[color-mix(in_oklab,var(--fleece)_82%,transparent)]">
            {item.caption}
          </span>
        </motion.span>
      </button>
    </motion.div>
  );
}

export function YarnFanCarousel() {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const { data } = useQuery(productsQuery({ sort: "newest", limit: 12 }));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragging = useRef(false);

  const items = useMemo<FanItem[]>(() => {
    const products = data ?? [];
    if (!PREFER_LOCAL_IMAGES && products.length) {
      return products
        .map((p) => ({
          key: p.id,
          image: primaryImage(p) ?? "",
          label: "New",
          title: p.title,
          caption: "Fresh off the winder.",
          href: `/product/${p.id}`,
        }))
        .filter((i) => i.image);
    }
    return YARN_FAN_FALLBACKS.map((fallback, i) => {
      const product = products[i % Math.max(products.length, 1)];
      return { ...fallback, href: product ? `/product/${product.id}` : "/collections" };
    });
  }, [data]);

  const count = items.length;

  const step = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  // Autoplay: one card slides out on the left every few seconds.
  useEffect(() => {
    if (reduced || paused || count < 2) return;
    const id = window.setInterval(() => step(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reduced, paused, count, step]);

  // Pause while the tab is hidden.
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const open = (href: string) => {
    if (href.startsWith("/product/")) {
      void navigate({ to: "/product/$id", params: { id: href.replace("/product/", "") } });
    } else {
      void navigate({ to: "/collections" });
    }
  };

  if (!count) return null;

  return (
    <section data-thread-anchor="story" className="mt-24 sm:mt-28" aria-labelledby="yarn-lookbook">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-data text-2xs text-marigold">05 · Lookbook</p>
            <h2
              id="yarn-lookbook"
              className="mt-3 font-display text-4xl font-light tracking-[-0.02em] text-foreground sm:text-5xl"
            >
              The shade deck
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Swipe, drag or let it run — each skein slides in from the right. Tap the front card to
              open it.
            </p>
          </div>
          <Link
            to="/collections"
            data-cursor="link"
            className="rounded-full border border-border px-5 py-2.5 font-data text-2xs text-muted-foreground transition-colors hover:border-marigold hover:text-marigold"
          >
            View all shades
          </Link>
        </div>
      </div>

      <div
        className="relative mt-12 overflow-hidden"
        /* Pause only for real mouse hover — touch taps must not freeze autoplay. */
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setPaused(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setPaused(false);
        }}
      >
        <motion.div
          className="relative mx-auto h-[min(31rem,112vw)] w-full max-w-[1200px] cursor-grab active:cursor-grabbing sm:h-[32rem]"
          style={{ perspective: 1400 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.14}
          onDragStart={() => {
            dragging.current = true;
            setPaused(true);
          }}
          onDragEnd={(_, info) => {
            dragging.current = false;
            if (info.offset.x < -60) step(1);
            else if (info.offset.x > 60) step(-1);
            setPaused(false);
          }}
          role="group"
          aria-roledescription="carousel"
          aria-label="Yarn shade deck"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
        >
          {items.map((item, i) => {
            let offset = i - index;
            if (offset > count / 2) offset -= count;
            if (offset < -count / 2) offset += count;
            if (Math.abs(offset) > SPREAD) return null;
            return (
              <FanCard
                key={item.key}
                item={item}
                offset={offset}
                active={offset === 0}
                reduced={reduced}
                onSelect={() => {
                  if (dragging.current) return;
                  if (offset === 0) open(item.href);
                  else step(offset);
                }}
              />
            );
          })}
        </motion.div>

        {/* controls */}
        <div className="mx-auto mt-2 flex w-full max-w-[1200px] items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous shade"
            data-cursor="link"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-marigold hover:text-marigold"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>

          <div className="flex items-center gap-2">
            {items.map((item, i) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${item.title}`}
                aria-current={i === index}
                className={
                  "h-1.5 rounded-full transition-all duration-[var(--dur-base)] " +
                  (i === index ? "w-6 bg-marigold" : "w-1.5 bg-border hover:bg-foreground/40")
                }
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next shade"
            data-cursor="link"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-marigold hover:text-marigold"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
