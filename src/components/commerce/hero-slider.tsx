import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { resolveHeroSlides } from "@/data/hero-slides";
import { useReducedMotion } from "@/hooks/use-motion";
import { siteMediaQuery } from "@/lib/api/queries";

const INTERVAL = 6000;
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Home hero: compact, framed auto-slider. Images, copy and CTA all come from
 * /site-media (`hero` section) so the admin panel drives every slide; a curated
 * fallback keeps the hero premium until those rows exist.
 */
export function HeroSlider() {
  const reduced = useReducedMotion();
  const { data } = useQuery(siteMediaQuery);
  const slides = resolveHeroSlides(data);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const count = slides.length;
  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (reduced || paused || count < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => window.clearInterval(id);
  }, [reduced, paused, count]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const slide = slides[Math.min(index, count - 1)]!;
  const href = slide.cta_href ?? "/collections";
  const isInternal = href.startsWith("/");

  const rise = (delay: number) =>
    reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
      : {
          initial: { opacity: 0, x: 56 },
          animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE, delay } },
          exit: { opacity: 0, x: -36, transition: { duration: 0.35, ease: EASE } },
        };

  return (
    <section className="relative" data-thread-anchor="hero" aria-label="Featured">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-10">
        <div
          className="group relative isolate overflow-hidden rounded-[32px] border border-border"
          style={{
            height: "clamp(420px, 62vh, 600px)",
            boxShadow: "0 40px 90px -50px color-mix(in oklab, var(--ink) 45%, transparent)",
          }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          onTouchStart={(e) => {
            touchStart.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const start = touchStart.current;
            const end = e.changedTouches[0]?.clientX ?? null;
            if (start != null && end != null && Math.abs(end - start) > 48)
              go(index + (end < start ? 1 : -1));
            touchStart.current = null;
          }}
        >
          {/* Image layer */}
          <AnimatePresence initial={false}>
            <motion.img
              key={slide.id}
              src={slide.url}
              alt={slide.title || "Royal Wool yarn"}
              loading={index === 0 ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-cover object-[78%_center]"
              initial={{ opacity: 0, scale: reduced ? 1 : 1.06 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { opacity: { duration: 0.9 }, scale: { duration: 9, ease: "linear" } },
              }}
              exit={{ opacity: 0, transition: { duration: 0.9 } }}
            />
          </AnimatePresence>

          {/* Readability scrim, left-weighted */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(90deg, color-mix(in oklab, var(--fleece) 94%, transparent) 0%, color-mix(in oklab, var(--fleece) 78%, transparent) 38%, transparent 72%)",
            }}
            aria-hidden
          />

          {/* Copy layer */}
          <div className="relative flex h-full items-center px-6 sm:px-10 lg:px-16">
            <AnimatePresence mode="wait">
              <div key={slide.id} className="max-w-[34rem] min-w-0">
                <motion.p {...rise(0)} className="font-data text-2xs text-marigold">
                  {slide.eyebrow ?? "Royal Wool"}
                </motion.p>
                <motion.h1
                  {...rise(0.08)}
                  className="mt-4 font-display text-4xl font-light leading-[1.05] sm:text-5xl lg:text-6xl"
                >
                  {slide.title || "Premium knitting & crochet yarn"}
                </motion.h1>
                {slide.subtitle ? (
                  <motion.p
                    {...rise(0.16)}
                    className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg"
                  >
                    {slide.subtitle}
                  </motion.p>
                ) : null}
                <motion.div {...rise(0.24)} className="mt-8 flex flex-wrap items-center gap-4">
                  {isInternal ? (
                    <Link
                      to={href}
                      data-cursor="link"
                      className="sheen inline-flex items-center gap-2 rounded-full bg-madder px-7 py-3.5 font-data text-2xs text-primary-foreground transition-transform duration-[var(--dur-micro)] hover:-translate-y-0.5"
                    >
                      {slide.cta_label ?? "Shop all yarns"}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  ) : (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener"
                      data-cursor="link"
                      className="sheen inline-flex items-center gap-2 rounded-full bg-madder px-7 py-3.5 font-data text-2xs text-primary-foreground transition-transform duration-[var(--dur-micro)] hover:-translate-y-0.5"
                    >
                      {slide.cta_label ?? "Shop all yarns"}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  )}
                </motion.div>
              </div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          {count > 1 ? (
            <>
              <div className="absolute bottom-6 left-6 flex items-center gap-3 sm:left-10 lg:left-16">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === index}
                    data-cursor="link"
                    className="h-1 overflow-hidden rounded-full bg-foreground/20 transition-all duration-500"
                    style={{ width: i === index ? 56 : 20 }}
                  >
                    <span
                      className="block h-full rounded-full bg-madder"
                      style={{
                        width: i === index ? "100%" : "0%",
                        transition: `width ${i === index && !reduced && !paused ? INTERVAL : 300}ms linear`,
                      }}
                    />
                  </button>
                ))}
              </div>

              <div className="absolute bottom-5 right-5 flex gap-2 sm:bottom-6 sm:right-6">
                {[
                  { dir: -1, Icon: ChevronLeft, label: "Previous slide" },
                  { dir: 1, Icon: ChevronRight, label: "Next slide" },
                ].map(({ dir, Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(index + dir)}
                    aria-label={label}
                    data-cursor="link"
                    className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background/70 text-foreground backdrop-blur-md transition-colors hover:border-marigold hover:text-marigold"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
