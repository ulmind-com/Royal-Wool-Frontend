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
      className="mt-16 w-full sm:mt-20"
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        {...(reduced ? {} : { whileInView: { opacity: 1, y: 0 } })}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full overflow-hidden bg-[#F6F1E7]"
      >
        <img
          src={banner.url}
          alt="Royal Wool — baskets of soft wool skeins with knitting needles, and a knitter holding a green yarn ball"
          width={1656}
          height={931}
          loading="lazy"
          decoding="async"
          className="mx-auto block h-auto w-full max-w-[1400px] object-contain object-center"
        />

      </motion.div>

    </section>
  );
}
