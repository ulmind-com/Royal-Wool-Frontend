import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Glass } from "@/components/ui/glass";
import { YARN_WEIGHTS, type YarnWeight } from "@/data/yarn-weights";
import { useReducedMotion } from "@/hooks/use-motion";

/**
 * "Shop by Yarn Weight" — liquid-glass tile rail.
 *
 * The strand graphic inside each tile is procedural: stroke width scales with
 * the weight number, so 1 reads as a whisper-thin thread and 7 as a rope.
 * No bitmaps, so every tile stays crisp and instant.
 */

/** Twisted-strand mark; thickness and spacing are derived from the weight. */
function StrandMark({ weight }: { weight: number }) {
  const t = (weight - 1) / 6; // 0 → 1
  const stroke = 1.1 + t * 6.4;
  const strands = weight <= 2 ? 5 : weight <= 4 ? 4 : 3;
  const gap = 24 / (strands + 1);

  return (
    <svg
      viewBox="0 0 88 24"
      className="h-12 w-full text-marigold"
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      {Array.from({ length: strands }, (_, i) => {
        const y = gap * (i + 1);
        const amp = 3 + t * 2.2;
        return (
          <path
            key={i}
            d={`M4 ${y} C 20 ${y - amp}, 30 ${y + amp}, 44 ${y} S 68 ${y - amp}, 84 ${y}`}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            opacity={0.55 + (i % 2) * 0.35}
          />
        );
      })}
    </svg>
  );
}

function WeightTile({
  item,
  index,
  reduced,
}: {
  item: YarnWeight;
  index: number;
  reduced: boolean;
}) {
  return (
    <motion.li
      className="min-w-[13rem] snap-start sm:min-w-0"
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={reduced ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: Math.min(index, 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/search"
        search={{ q: item.query }}
        data-cursor="link"
        aria-label={`Shop ${item.name} weight yarn, hook ${item.hookMm}`}
        className="group block h-full focus-visible:outline-none"
      >
        <Glass
          variant="card"
          refract
          className="sheen flex h-full flex-col items-center gap-4 rounded-[1.5rem] p-5 text-center group-hover:-translate-y-1.5 group-hover:shadow-[0_38px_70px_-40px_color-mix(in_oklab,var(--ink)_45%,transparent)] group-focus-visible:-translate-y-1.5"
        >
          {/* marigold bloom on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-[var(--dur-slow)] group-hover:opacity-100"
            style={{
              backgroundImage:
                "radial-gradient(110% 80% at 50% 0%, color-mix(in oklab, var(--marigold) 24%, transparent), transparent 65%)",
            }}
          />

          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-foreground font-data text-sm text-background transition-transform duration-[var(--dur-base)] ease-[var(--ease-enter)] group-hover:scale-110">
            {item.weight}
          </span>

          <span className="relative block w-full">
            <StrandMark weight={item.weight} />
          </span>

          <span className="relative mt-auto block w-full">
            <span className="block font-display text-base font-normal text-foreground sm:text-lg">
              {item.name}
            </span>
            <span className="mt-1 block font-data text-2xs text-marigold">Hook {item.hookMm}</span>
            <span className="mt-2 block min-h-[2.75rem] text-xs leading-relaxed text-muted-foreground">
              {item.note}
            </span>
          </span>
        </Glass>
      </Link>
    </motion.li>
  );
}

export function YarnWeightRail() {
  const reduced = useReducedMotion();

  return (
    <section
      data-thread-anchor="weights"
      className="mt-24 sm:mt-28"
      aria-labelledby="shop-by-yarn-weight"
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-data text-2xs text-marigold">04 · Yarn weight</p>
            <h2
              id="shop-by-yarn-weight"
              className="mt-3 font-display text-4xl font-light tracking-[-0.02em] text-foreground sm:text-5xl"
            >
              Shop by Yarn Weight
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              The standard 1–7 scale, thinnest to thickest. Pick a weight and see every shade we
              wind at that gauge.
            </p>
          </div>

          <Glass
            variant="pill"
            className="font-data text-2xs text-muted-foreground"
            aria-hidden={false}
          >
            Hook range · 2.25 – 12 mm
          </Glass>
        </div>

        {/* mobile: snap rail with edge fade · sm+: 4 cols · lg: full 7-up */}
        <div className="relative mt-10">
          <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-7">
            {YARN_WEIGHTS.map((item, i) => (
              <WeightTile key={item.id} item={item} index={i} reduced={reduced} />
            ))}
          </ul>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:hidden"
            style={{
              backgroundImage:
                "linear-gradient(to left, var(--background), color-mix(in oklab, var(--background) 0%, transparent))",
            }}
          />
        </div>

        <Link
          to="/collections"
          data-cursor="link"
          className="sheen mt-8 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 font-data text-2xs text-foreground transition-colors hover:border-marigold hover:text-marigold"
        >
          Browse every weight
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
