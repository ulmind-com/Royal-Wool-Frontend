import { motion } from "framer-motion";

import banner from "@/assets/royal-wool-banner.png.asset.json";
import { useReducedMotion } from "@/hooks/use-motion";

/** Image-only brand banner. No heading, no overlay copy — just the artwork. */
export function BrandBanner() {
  const reduced = useReducedMotion();

  return (
    <section
      data-thread-anchor="banner"
      aria-label="Royal Wool — feel the softness, create with love"
      className="mt-24 sm:mt-28"
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-3xl border border-border/60 shadow-[0_24px_60px_-30px_color-mix(in_oklab,var(--ink)_35%,transparent)]"
        >
          <img
            src={banner.url}
            alt="Royal Wool — baskets of soft wool skeins with knitting needles, and a knitter holding a green yarn ball"
            width={1656}
            height={931}
            loading="lazy"
            decoding="async"
            className="block aspect-[1656/931] h-auto w-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
