import { motion } from "framer-motion";

import storyImage from "@/assets/about/about-story.jpg.asset.json";
import { ABOUT_STORY } from "@/data/about";
import { useReducedMotion } from "@/hooks/use-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Editorial story rows: image on one side, three copy blocks on the other. */
export function AboutStory() {
  const reduced = useReducedMotion();

  return (
    <section
      aria-label="Inside the dye house"
      className="mx-auto w-full max-w-[1200px] px-4 pt-16 pb-20 sm:px-6 sm:pt-24 lg:px-10 lg:pb-28"
    >
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24 }}
          {...(reduced ? {} : { whileInView: { opacity: 1, y: 0 } })}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="overflow-hidden rounded-[22px] border border-border bg-card lg:sticky lg:top-24 sm:rounded-[28px]"
        >
          <img
            src={storyImage.url}
            alt="Hands winding cotton yarn into a ball beside a basket of coloured skeins"
            width={1408}
            height={1056}
            loading="lazy"
            decoding="async"
            className="block h-[240px] w-full object-cover sm:h-[320px] lg:h-[420px]"
          />
        </motion.div>

        <div className="divide-y divide-border/60">
          {ABOUT_STORY.map((block, i) => (
            <motion.article
              key={block.id}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              {...(reduced ? {} : { whileInView: { opacity: 1, y: 0 } })}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}
              className="py-7 first:pt-0"
            >
              <p className="font-data text-2xs text-marigold">{`0${i + 1}`}</p>
              <h2 className="mt-2 font-display text-2xl font-light text-foreground sm:text-[1.75rem]">
                {block.title}
              </h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                {block.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
