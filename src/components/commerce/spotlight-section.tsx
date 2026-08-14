import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import delightPink from "@/assets/yarn/delight-pink.jpg.asset.json";
import { InteractiveTravelCard } from "@/components/ui/3d-card";
import { siteMediaQuery } from "@/lib/api/queries";

/**
 * Editorial spotlight: one hero range presented as a 3D tilt card beside
 * magazine-style copy. Everything is prop-driven so the admin panel can feed
 * it once the backend exposes a "spotlight" slot.
 */
export type SpotlightSpec = { label: string; value: string };

export type SpotlightContent = {
  eyebrow: string;
  titleTop: string;
  titleBottom: string;
  body: string;
  specs: SpotlightSpec[];
  cardTitle: string;
  cardSubtitle: string;
  cardAction: string;
  image: string;
  href: string;
};

const DEFAULT_CONTENT: SpotlightContent = {
  eyebrow: "Spotlight · Cotton Delight",
  titleTop: "Spun for softness.",
  titleBottom: "Made to last.",
  body: "Mercerised cotton, dyed in small batches and wound by hand. Even gauge from the first stitch to the last, with a quiet sheen that holds its colour through wash after wash — made for amigurumi, summer tops and heirloom baby knits.",
  specs: [
    { label: "Composition", value: "100% mercerised cotton" },
    { label: "Gauge", value: "3.0 – 3.5 mm hook" },
    { label: "Care", value: "Machine wash cold" },
  ],
  cardTitle: "Cotton Delight",
  cardSubtitle: "Small-batch dyed · 50 g skein",
  cardAction: "Shop the range",
  image: delightPink.url,
  href: "/search?q=Cotton%20Delight",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function SpotlightSection({ content: propContent }: { content?: SpotlightContent }) {
  const { data: media } = useQuery(siteMediaQuery);
  const spotlightMedia = media?.["spotlight"]?.filter((m) => m.active !== false)?.[0];

  // Merge admin-managed media over the defaults — admin wins for any field it provides.
  const content: SpotlightContent = propContent ?? (spotlightMedia
    ? {
        ...DEFAULT_CONTENT,
        ...(spotlightMedia.url ? { image: spotlightMedia.url } : {}),
        ...(spotlightMedia.title ? { titleTop: spotlightMedia.title } : {}),
        ...(spotlightMedia.subtitle ? { titleBottom: spotlightMedia.subtitle } : {}),
        ...(spotlightMedia.eyebrow ? { eyebrow: spotlightMedia.eyebrow } : {}),
        ...(spotlightMedia.cta_href ? { href: spotlightMedia.cta_href } : {}),
      }
    : DEFAULT_CONTENT);

  return (
    <section
      data-thread-anchor="spotlight"
      aria-label={`${content.cardTitle} spotlight`}
      className="mx-auto mt-20 w-full max-w-[1600px] px-4 sm:px-6 lg:px-10"
    >
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
          custom={0}
          className="mx-auto w-full max-w-[520px]"
        >
          <InteractiveTravelCard
            title={content.cardTitle}
            subtitle={content.cardSubtitle}
            imageUrl={content.image}
            actionText={content.cardAction}
            href={content.href}
            onActionClick={() => {
              window.location.assign(content.href);
            }}
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="lg:pl-4"
        >
          <motion.p variants={fadeUp} custom={1} className="font-data text-2xs text-marigold">
            {content.eyebrow.toUpperCase()}
          </motion.p>

          <motion.h2
            variants={fadeUp}
            custom={2}
            className="mt-5 font-display text-4xl leading-[1.1] font-light text-foreground sm:text-5xl"
          >
            {content.titleTop}
            <br />
            <span className="font-normal">{content.titleBottom}</span>
          </motion.h2>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-6 h-px w-14 bg-marigold"
            aria-hidden
          />

          <motion.p
            variants={fadeUp}
            custom={4}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground"
          >
            {content.body}
          </motion.p>

          <motion.dl
            variants={fadeUp}
            custom={5}
            className="mt-10 grid grid-cols-1 gap-6 border-t border-border/60 pt-8 sm:grid-cols-3"
          >
            {content.specs.map((spec) => (
              <div key={spec.label}>
                <dt className="font-data text-2xs text-muted-foreground">
                  {spec.label.toUpperCase()}
                </dt>
                <dd className="mt-2 text-sm text-foreground">{spec.value}</dd>
              </div>
            ))}
          </motion.dl>

          <motion.div variants={fadeUp} custom={6} className="mt-10">
            <Link
              to={content.href}
              className="group inline-flex items-center gap-3 border-b border-marigold pb-1 font-data text-2xs uppercase tracking-[0.18em] text-foreground transition-colors duration-[var(--dur-micro)] hover:text-marigold"
            >
              Learn more
              <ArrowRight
                className="h-4 w-4 transition-transform duration-[var(--dur-micro)] group-hover:translate-x-1"
                strokeWidth={1.5}
                aria-hidden
              />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
