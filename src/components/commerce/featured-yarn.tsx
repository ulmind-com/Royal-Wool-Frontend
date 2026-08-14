import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useMemo, useRef, useState } from "react";

import { FEATURED_YARN_FALLBACK, type FeaturedYarnItem } from "@/data/featured-yarn";
import { useReducedMotion } from "@/hooks/use-motion";
import { productsQuery } from "@/lib/api/queries";
import { displayPrice, primaryImage, struckPrice } from "@/lib/api/types";
import { shortProductName } from "@/lib/short-name";

/**
 * Featured yarn — an endless right → left marquee of background-removed skein
 * cutouts, each with its name and price underneath.
 *
 * Data is admin-driven: live products from the catalogue win as soon as real
 * wool products exist. Until then PREFER_LOCAL keeps the client's own
 * photography (cut out to transparent PNGs) on screen.
 */
const PREFER_LOCAL = false;
/** px per second the track travels leftwards. */
const SPEED = 46;

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const GLOWS = ["#E4568C", "#6FC5E8", "#E9C94A", "#B4482A", "#8FD07A", "#C6402E"];

function YarnItem({ item, ariaHidden }: { item: FeaturedYarnItem; ariaHidden?: boolean }) {
  return (
    <li className="shrink-0" aria-hidden={ariaHidden || undefined}>
      <Link
        to={item.href}
        data-cursor="link"
        tabIndex={ariaHidden ? -1 : 0}
        draggable={false}
        className="group block w-[9.5rem] select-none rounded-3xl px-3 pb-4 pt-5 outline-none focus-visible:ring-2 focus-visible:ring-marigold xs:w-[11rem] sm:w-[15rem] sm:px-4 sm:pb-5 sm:pt-6"
      >
        <div className="relative grid h-[10.5rem] place-items-center xs:h-[12rem] sm:h-[16.5rem]">
          {/* dye glow */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-2 top-4 bottom-8 rounded-full opacity-55 blur-2xl transition-opacity duration-[var(--dur-slow)] group-hover:opacity-90"
            style={{
              backgroundImage: `radial-gradient(60% 55% at 50% 45%, color-mix(in oklab, ${item.glow} 60%, transparent), transparent 72%)`,
            }}
          />
          {/* contact shadow */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-3 left-1/2 h-4 w-[62%] -translate-x-1/2 rounded-[100%] blur-md transition-all duration-[var(--dur-slow)] group-hover:w-[54%] group-hover:opacity-70"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--ink) 42%, transparent), transparent)",
            }}
          />
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            draggable={false}
            className="relative z-10 h-full w-full object-contain drop-shadow-[0_18px_28px_color-mix(in_oklab,var(--ink)_22%,transparent)] transition-transform duration-[var(--dur-slow)] ease-[var(--ease-enter)] group-hover:-translate-y-2 group-hover:scale-[1.05]"
          />
        </div>

        <p className="mt-4 text-center font-display text-base font-normal leading-snug text-foreground transition-colors group-hover:text-marigold">
          {item.name}
        </p>
        <p className="mt-1.5 flex items-center justify-center gap-2 font-data text-2xs text-muted-foreground">
          <span className="text-sm tracking-normal text-foreground">{inr.format(item.price)}</span>
          {item.mrp ? <span className="line-through">{inr.format(item.mrp)}</span> : null}
        </p>
      </Link>
    </li>
  );
}

export function FeaturedYarn() {
  const reduced = useReducedMotion();
  const { data } = useQuery(productsQuery({ sort: "popular", limit: 12 }));
  const trackRef = useRef<HTMLUListElement>(null);
  const x = useMotionValue(0);
  const [paused, setPaused] = useState(false);
  const dragging = useRef(false);

  const items = useMemo<FeaturedYarnItem[]>(() => {
    const products = data ?? [];
    if (!PREFER_LOCAL && products.length) {
      return products
        .map((p, i) => {
          const struck = struckPrice(p);
          return {
            key: p.id,
            image: primaryImage(p) ?? "",
            name: shortProductName(p.title),
            price: displayPrice(p),
            ...(struck ? { mrp: struck } : {}),
            glow: GLOWS[i % GLOWS.length]!,
            href: `/product/${p.id}`,
          };
        })
        .filter((i) => i.image);
    }
    return FEATURED_YARN_FALLBACK;
  }, [data]);

  // Seamless loop: translate the first copy fully out, then wrap.
  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const half = (trackRef.current?.scrollWidth ?? 0) / 2;
    if (!half) return;
    const drift = paused || dragging.current ? 0 : (SPEED * delta) / 1000;
    let next = x.get() - drift;
    // wrap both ways so dragging can never run the track off either end
    while (next <= -half) next += half;
    while (next > 0) next -= half;
    x.set(next);
  });

  if (!items.length) return null;

  const loop = [...items, ...items];

  return (
    <section
      data-thread-anchor="featured"
      className="mt-24 sm:mt-28"
      aria-labelledby="featured-yarn"
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-data text-2xs text-marigold">06 · Featured</p>
            <h2
              id="featured-yarn"
              className="mt-3 font-display text-4xl font-light tracking-[-0.02em] text-foreground sm:text-5xl"
            >
              Featured yarn
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Hand-picked skeins from the current shelf. Let them drift by, or drag to browse at
              your own pace.
            </p>
          </div>
          <Link
            to="/collections"
            data-cursor="link"
            className="rounded-full border border-border px-5 py-2.5 font-data text-2xs text-muted-foreground transition-colors hover:border-marigold hover:text-marigold"
          >
            Shop all yarn
          </Link>
        </div>
      </div>

      <div
        className="relative mt-10 overflow-hidden"

        style={{
          maskImage: "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 7%, black 93%, transparent)",
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setPaused(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setPaused(false);
        }}
      >
        {reduced ? (
          <ul className="flex gap-2 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-10">
            {items.map((item) => (
              <YarnItem key={item.key} item={item} />
            ))}
          </ul>
        ) : (
          <motion.ul
            ref={trackRef}
            className="flex w-max cursor-grab gap-2 active:cursor-grabbing"
            style={{ x }}
            drag="x"
            dragConstraints={{ left: -100000, right: 100000 }}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={() => {
              dragging.current = true;
            }}
            onDragEnd={() => {
              dragging.current = false;
            }}
            aria-label="Featured yarn"
          >
            {loop.map((item, i) => (
              <YarnItem key={`${item.key}-${i}`} item={item} ariaHidden={i >= items.length} />
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}
