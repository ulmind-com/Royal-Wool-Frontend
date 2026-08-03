import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

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
      <div className="overflow-hidden rounded-[18px] border border-border bg-card sm:rounded-[22px]">
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

      <p className="mt-4 font-data text-2xs text-marigold">
        {post.tag} · {post.date}
      </p>
      <h3 className="mt-2 flex items-start justify-between gap-3 font-display text-xl font-light leading-snug text-foreground">
        <span className="transition-colors group-hover:text-marigold">{post.title}</span>
        <ArrowUpRight
          className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-[var(--dur-micro)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-marigold"
          aria-hidden
        />
      </h3>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>

      <div className="mt-5 flex items-center gap-3 border-t border-border/60 pt-4">
        <Avatar name={post.author} />
        <span className="font-data text-2xs text-muted-foreground">{post.author}</span>
      </div>
    </motion.article>
  );
}
