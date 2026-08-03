import { motion } from "framer-motion";

import { Avatar } from "@/components/blog/blog-featured";
import type { BlogPost } from "@/data/blog";
import { useReducedMotion } from "@/hooks/use-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** One post in the recent-posts grid. */
export function BlogCard({ post, index = 0 }: { post: BlogPost; index?: number }) {
  const reduced = useReducedMotion();

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 22 }}
      {...(reduced ? {} : { whileInView: { opacity: 1, y: 0 } })}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: EASE, delay: (index % 3) * 0.06 }}
      className="group flex flex-col"
    >
      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <img
          src={post.image}
          alt={post.title}
          width={1200}
          height={800}
          loading="lazy"
          decoding="async"
          className="block aspect-[3/2] w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
        />
      </div>

      <h2 className="mt-4 font-display text-lg font-normal leading-snug text-foreground transition-colors group-hover:text-marigold">
        {post.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>

      <div className="mt-4 flex items-center gap-2">
        <Avatar name={post.author} />
        <span className="text-xs text-muted-foreground">
          {post.author} • {post.date}
        </span>
      </div>
    </motion.article>
  );
}
