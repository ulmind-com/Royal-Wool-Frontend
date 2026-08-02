import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { type MotionStyle, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

import { Glass } from "@/components/ui/glass";
import { type StackCardData, YARN_STACK_CARDS } from "@/data/yarn-stack";
import { useReducedMotion } from "@/hooks/use-motion";

/**
 * Scroll-stacking range cards. Each card sticks to the top of the viewport while
 * the next one climbs over it; the outgoing card fades and scales back so the
 * stack reads like a deck of pages. Image sits left, copy + CTA right.
 *
 * Mobile gets the same swap motion with phone-tuned geometry (shorter sticky
 * height, image strip on top). Only reduced-motion falls back to a flat list.
 */
export function YarnStackCards() {
  const reduced = useReducedMotion();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 30,
    damping: 40,
    restDelta: 0.001,
  });

  const opacity1 = useTransform(smooth, [0, 0.33], [1, 0]);
  const scale1 = useTransform(smooth, [0, 0.33], [1, 0.9]);
  const opacity2 = useTransform(smooth, [0.33, 0.66], [1, 0]);
  const scale2 = useTransform(smooth, [0.33, 0.66], [1, 0.9]);

  const stackStyles: MotionStyle[] = [
    { opacity: opacity1, scale: scale1 },
    { opacity: opacity2, scale: scale2 },
    {},
  ];

  const flat = reduced;

  return (
    <section
      data-thread-anchor="ranges"
      className="mt-24 sm:mt-28"
      aria-labelledby="yarn-stack-heading"
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-14">
        <p className="font-data text-2xs text-marigold">04b · The ranges</p>
        <h2
          id="yarn-stack-heading"
          className="mt-3 font-display text-3xl font-light tracking-[-0.02em] text-foreground sm:text-4xl"
        >
          Three ranges, one dye house
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Scroll through the house ranges — each one stacks over the last.
        </p>
      </div>

      <div ref={containerRef} className="relative mt-10">
        {YARN_STACK_CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            style={flat ? {} : (stackStyles[i] ?? {})}
            className={
              flat
                ? "mx-auto w-full max-w-[1200px] px-5 pb-8 sm:px-8 lg:px-14"
                : "sticky top-0 mx-auto flex h-svh w-full max-w-[1200px] items-center px-5 sm:px-8 lg:px-14"
            }
          >
            <RangeCard card={card} index={i} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function RangeCard({ card, index }: { card: StackCardData; index: number }) {
  return (
    <article
      className="group relative w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_50px_110px_-60px_color-mix(in_oklab,var(--ink)_60%,transparent)]"
      style={{ minHeight: "clamp(420px, 74vh, 580px)" }}
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
        {/* Left: image */}
        <div className="relative min-h-[240px] overflow-hidden lg:min-h-full">
          <img
            src={card.image}
            alt={card.imageAlt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--dur-cinematic)] ease-[var(--ease-enter)] group-hover:scale-[1.04]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, transparent 55%, color-mix(in oklab, var(--card) 85%, transparent) 100%)",
            }}
          />
        </div>

        {/* Right: copy */}
        <div className="flex flex-col justify-center gap-6 px-7 py-10 sm:px-10 sm:py-12 lg:px-14">
          <Glass
            variant="pill"
            className="w-fit whitespace-nowrap font-data text-2xs uppercase tracking-[0.18em] text-ink"
          >
            {card.eyebrow}
          </Glass>

          <h3 className="font-display text-3xl font-light leading-[1.05] tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
            {card.title}
          </h3>

          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {card.copy}
          </p>

          <dl className="grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
            {card.specs.map((spec) => (
              <div key={spec.label}>
                <dt className="font-data text-2xs text-marigold">{spec.label}</dt>
                <dd className="mt-1 text-xs leading-snug text-foreground">{spec.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-center gap-5 pt-1">
            <Link
              to="/search"
              search={{ q: card.query }}
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
