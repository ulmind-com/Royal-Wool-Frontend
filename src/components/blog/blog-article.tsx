import { motion } from "framer-motion";

import type { BlogBlock } from "@/data/blog";
import { useReducedMotion } from "@/hooks/use-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Renders long-form article blocks with editorial typography. */
export function BlogArticle({ blocks }: { blocks: BlogBlock[] }) {
  const reduced = useReducedMotion();

  return (
    <div className="mt-10 max-w-[68ch] sm:mt-14">
      {blocks.map((block, i) => (
        <motion.div
          key={`${block.type}-${i}`}
          initial={reduced ? false : { opacity: 0, y: 16 }}
          {...(reduced ? {} : { whileInView: { opacity: 1, y: 0 } })}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Block block={block} />
        </motion.div>
      ))}
    </div>
  );
}

function Block({ block }: { block: BlogBlock }) {
  if (block.type === "h2") {
    return (
      <h2 className="mt-12 font-display text-xl font-normal leading-snug text-foreground sm:text-2xl">
        {block.text}
      </h2>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote className="my-10 border-l-2 border-marigold pl-5 sm:pl-6">
        <p className="font-display text-lg font-light italic leading-relaxed text-foreground sm:text-xl">
          {block.text}
        </p>
      </blockquote>
    );
  }

  if (block.type === "link") {
    return (
      <p className="mt-6">
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="link"
          className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm text-foreground transition-colors hover:border-marigold hover:text-marigold"
        >
          {block.text}
        </a>
      </p>
    );
  }

  return (
    <p className="mt-5 text-base leading-[1.85] text-muted-foreground sm:text-[1.0625rem]">
      {block.text}
    </p>
  );
}

/** Rough read-time estimate from the body copy. */
export function readTime(blocks: BlogBlock[] | undefined, excerpt: string): string {
  const words = [excerpt, ...(blocks ?? []).map((b) => b.text)]
    .join(" ")
    .trim()
    .split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}
