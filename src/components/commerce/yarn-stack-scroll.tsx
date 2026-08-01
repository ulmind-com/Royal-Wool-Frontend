import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Glass } from "@/components/ui/glass";
import { YARN_FAN_FALLBACKS } from "@/data/yarn-fan";
import { useReducedMotion } from "@/hooks/use-motion";
import { productsQuery } from "@/lib/api/queries";

/**
 * Stacked shade strip — cards sit in a shallow paper stack; every few seconds the
 * front card glides out to the left while the rest step forward and a new card
 * slides in from the right. Compact height, breathing room on both sides.
 */
const AUTOPLAY_MS = 3200;
/** How many cards of the stack stay visible behind the front one. */
const DEPTH = 3;

type StackItem = {
  key: string;
  image: string;
  label: string;
  title: string;
  href: string;
};

function depthStyle(offset: number) {
  // offset 0 = front card, 1..DEPTH = cards behind it
  return {
    x: `${offset * 3.5}%`,
    y: offset * -20,
    scale: 1 - offset * 0.05,
    opacity: offset === 0 ? 1 : Math.max(0.25, 0.62 - (offset - 1) * 0.18),
    zIndex: 20 - offset,
    filter: offset === 0 ? "brightness(1) blur(0px)" : `brightness(0.85) blur(${offset}px)`,
  };
}

export function YarnStackScroll() {
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const { data } = useQuery(productsQuery({ sort: "newest", limit: 12 }));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragging = useRef(false);

  const items = useMemo<StackItem[]>(() => {
    const products = data ?? [];
    return YARN_FAN_FALLBACKS.map((f, i) => {
      const product = products[i % Math.max(products.length, 1)];
      return {
        key: f.key,
        image: f.image,
        label: f.label,
        title: f.title,
        href: product ? `/product/${product.id}` : "/collections",
      };
    });
  }, [data]);

  const count = items.length;

  const step = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  useEffect(() => {
    if (reduced || paused || count < 2) return;
    const id = window.setInterval(() => step(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reduced, paused, count, step]);

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
    <section
      data-thread-anchor="winder"
      className="mt-24 sm:mt-28"
      aria-labelledby="yarn-stack-heading"
    >
      <div className="mx-auto w-full max-w-[1100px] px-6 sm:px-10 lg:px-16">
        <p className="font-data text-2xs text-marigold">04b · Fresh lots</p>
        <h2
          id="yarn-stack-heading"
          className="mt-3 font-display text-3xl font-light tracking-[-0.02em] text-foreground sm:text-4xl"
        >
          Straight off the winder
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Each lot slides through as it leaves the dye house. Tap the front card to open it.
        </p>

        <motion.div
          className="relative mx-auto mt-10 h-[clamp(280px,40vh,380px)] w-full max-w-[760px] cursor-grab active:cursor-grabbing"
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") setPaused(true);
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") setPaused(false);
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
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
          aria-label="Fresh yarn lots"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
        >
          {items.map((item, i) => {
            let offset = i - index;
            if (offset < 0) offset += count;
            const outgoing = offset === count - 1;
            const visible = offset <= DEPTH || outgoing;
            if (!visible) return null;
            const s = outgoing
              ? {
                  x: "-115%",
                  y: 0,
                  scale: 0.94,
                  opacity: 0,
                  zIndex: 21,
                  filter: "brightness(1) blur(0px)",
                }
              : depthStyle(offset);
            const active = offset === 0;
            return (
              <motion.div
                key={item.key}
                className="absolute inset-x-0 bottom-0 top-0"
                style={{ zIndex: s.zIndex }}
                initial={false}
                animate={{
                  x: s.x,
                  y: s.y,
                  scale: s.scale,
                  opacity: s.opacity,
                  filter: s.filter,
                }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 120, damping: 22, mass: 0.9 }
                }
              >
                <button
                  type="button"
                  onClick={() => {
                    if (dragging.current) return;
                    if (active) open(item.href);
                    else step(offset);
                  }}
                  tabIndex={active ? 0 : -1}
                  aria-hidden={!active}
                  data-cursor="link"
                  aria-label={`Open ${item.title}`}
                  className="group relative block h-full w-full overflow-hidden rounded-[1.75rem] border border-[color-mix(in_oklab,var(--ink)_10%,transparent)] text-left shadow-[0_40px_90px_-50px_color-mix(in_oklab,var(--ink)_55%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marigold"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-enter)] group-hover:scale-[1.03]"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(to top, color-mix(in oklab, var(--ink) 72%, transparent) 0%, color-mix(in oklab, var(--ink) 26%, transparent) 38%, transparent 66%)",
                    }}
                  />
                  <motion.span
                    className="absolute left-5 top-5"
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
                  <motion.span
                    className="absolute inset-x-0 bottom-0 block px-6 pb-6"
                    initial={false}
                    animate={{ opacity: active ? 1 : 0, y: active ? 0 : 12 }}
                    transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.05 }}
                  >
                    <span className="block font-display text-xl font-normal leading-tight text-fleece sm:text-2xl">
                      {item.title}
                    </span>
                  </motion.span>
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-5 flex items-center justify-center gap-2">
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
      </div>
    </section>
  );
}
