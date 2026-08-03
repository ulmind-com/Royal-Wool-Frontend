import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import heroImage from "@/assets/about/about-hero.jpg.asset.json";
import { ABOUT_STATS } from "@/data/about";
import { useReducedMotion } from "@/hooks/use-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** About hero — framed image left, story copy right. */
export function AboutHero() {
  const reduced = useReducedMotion();

  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease: EASE, delay },
        };

  return (
    <section className="relative" aria-label="About Royal Wool" data-thread-anchor="about-hero">
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-8 px-4 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 lg:px-10 lg:pt-16">
        <motion.div
          {...(reduced
            ? {}
            : {
                initial: { opacity: 0, y: 28 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.8, ease: EASE },
              })}
          className="relative overflow-hidden rounded-[22px] border border-border bg-card sm:rounded-[32px]"
          style={{
            boxShadow: "0 40px 90px -50px color-mix(in oklab, var(--ink) 45%, transparent)",
          }}
        >
          <img
            src={heroImage.url}
            alt="Skeins of small-batch dyed wool and cotton yarn on a worktable in daylight"
            width={1280}
            height={1600}
            decoding="async"
            className="block h-[300px] w-full object-cover object-center sm:h-[380px] lg:h-[520px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(180deg, transparent 55%, color-mix(in oklab, var(--fleece) 35%, transparent))",
            }}
          />
        </motion.div>

        <div className="min-w-0">
          <motion.p {...rise(0.05)} className="font-data text-2xs text-marigold">
            Our story · West Bengal, India
          </motion.p>
          <motion.h1
            {...rise(0.12)}
            className="mt-3 font-display text-3xl font-light leading-[1.08] sm:text-4xl lg:text-5xl"
          >
            We dye small, so your project matches
          </motion.h1>
          <motion.p
            {...rise(0.2)}
            className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Royal Wool started with a simple complaint: you buy five skeins, and the sixth one —
            bought two weeks later — is a shade off. So we work in small lots, log every dye batch,
            and keep skeins from the same lot together.
          </motion.p>

          <motion.dl {...rise(0.28)} className="mt-7 flex flex-wrap gap-3">
            {ABOUT_STATS.map((stat) => (
              <div
                key={stat.value}
                className="rounded-full border border-border/70 bg-card/70 px-4 py-2"
              >
                <dt className="font-display text-sm text-foreground">{stat.value}</dt>
                <dd className="font-data text-2xs text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </motion.dl>

          <motion.div {...rise(0.34)} className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/collections"
              data-cursor="link"
              className="sheen inline-flex min-h-[46px] items-center gap-2 rounded-full bg-madder px-6 py-3 font-data text-2xs text-primary-foreground transition-transform duration-[var(--dur-micro)] hover:-translate-y-0.5 sm:px-7"
            >
              Shop all yarns
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <Link
              to="/contact"
              data-cursor="link"
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-border px-6 py-3 font-data text-2xs text-foreground transition-colors hover:border-marigold hover:text-marigold"
            >
              Talk to us
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
