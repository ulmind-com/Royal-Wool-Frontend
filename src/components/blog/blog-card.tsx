import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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
      <Link
        to="/blog/$slug"
        params={{ slug: post.slug }}
        data-cursor="link"
        className="flex flex-col"
        aria-label={post.title}
      >
        <div className="overflow-hidden rounded-[14px] border border-border bg-card">
          {post.image ? (
            <img
              src={post.image}
              alt={post.title}
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
              className="block aspect-[3/2] w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="aspect-[3/2] w-full bg-muted" aria-hidden />
          )}
        </div>

        <h2 className="mt-4 font-display text-lg font-normal leading-snug text-foreground transition-colors group-hover:text-marigold">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
        ) : null}
      </Link>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar name={post.author} />
          <span className="text-xs text-muted-foreground">
            {[post.author, post.date].filter(Boolean).join(" • ")}
          </span>
        </div>

        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          data-cursor="link"
          className="inline-flex shrink-0 items-center gap-1 text-xs text-foreground transition-colors hover:text-marigold"
        >
          See more
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-[var(--dur-micro)] group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        </Link>
      </div>
    </motion.article>
  );
}
