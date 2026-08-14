import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { type MotionStyle, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";

import { Glass } from "@/components/ui/glass";
import { type StackCardData, YARN_STACK_CARDS } from "@/data/yarn-stack";
import { useReducedMotion } from "@/hooks/use-motion";
import { siteMediaQuery } from "@/lib/api/queries";

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
  const { data: media } = useQuery(siteMediaQuery);

  // Merge admin-managed range_cards media over the static fallback cards.
  // Admin images override the static ones by order (0→card 1, 1→card 2, 2→card 3).
  const cards = useMemo(() => {
    const rangeMedia = media?.["range_cards"]?.filter((m) => m.active !== false)
      ?.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) ?? [];
    if (rangeMedia.length === 0) return YARN_STACK_CARDS;
    return YARN_STACK_CARDS.map((card, i) => {
      const m = rangeMedia[i];
      if (!m) return card;
      return {
        ...card,
        ...(m.url ? { image: m.url } : {}),
        ...(m.title ? { title: m.title, imageAlt: m.title } : {}),
        ...(m.subtitle ? { copy: m.subtitle } : {}),
      };
    });
  }, [media]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Use direct scroll progress instead of spring to prevent lag when scrolling up.
  // This ensures the outgoing cards scale back and fade perfectly in sync with the sticky scroll.
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

function RangeCard({ card, index }: { card: StackCardData; index: number }) {
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
        {/* Left (top on mobile): image */}
        <div className="relative h-[150px] shrink-0 overflow-hidden xs:h-[170px] sm:h-[240px] lg:h-auto lg:min-h-full">
          <img
            src={card.image}
            alt={card.imageAlt}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--dur-cinematic)] ease-[var(--ease-enter)] group-hover:scale-[1.04]"
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
