import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import type { BlogPost } from "@/data/blog";
import { useReducedMotion } from "@/hooks/use-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Large featured banner: image with a gradient veil and copy overlaid. */
export function BlogFeatured({ post }: { post: BlogPost }) {
  const reduced = useReducedMotion();

  return (
    <motion.article
      {...(reduced
        ? {}
        : {
            initial: { opacity: 0, y: 26 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.8, ease: EASE },
          })}
      className="group relative overflow-hidden rounded-[18px] border border-border bg-card sm:rounded-[24px]"
    >
      {post.image ? (
        <img
          src={post.image}
          alt={post.title}
          width={1200}
          height={800}
          decoding="async"
          className="block h-[300px] w-full object-cover object-center transition-transform duration-[900ms] ease-out group-hover:scale-[1.03] sm:h-[400px] lg:h-[480px]"
        />
      ) : (
        <div className="h-[300px] w-full bg-muted sm:h-[400px] lg:h-[480px]" aria-hidden />
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, transparent 8%, color-mix(in oklab, var(--ink) 45%, transparent) 42%, color-mix(in oklab, var(--ink) 88%, transparent))",
        }}
      />
      <Link
        to="/blog/$slug"
        params={{ slug: post.slug }}
        data-cursor="link"
        className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-5 sm:p-8 lg:p-10"
      >
        <div>
          <p className="text-sm text-fleece/80">Featured</p>
          <h2 className="mt-3 max-w-3xl font-display text-2xl font-light leading-[1.12] text-fleece sm:text-3xl lg:text-4xl">
            {post.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fleece/75">{post.excerpt}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-fleece sm:hidden">
            See more
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </span>
        </div>
        <span
          aria-hidden
          className="hidden shrink-0 pb-14 text-fleece transition-transform duration-[var(--dur-micro)] group-hover:translate-x-1 sm:block"
        >
          <ArrowRight className="h-8 w-8" strokeWidth={1.5} />
        </span>
      </Link>

    </motion.article>
  );
}

/** Initials avatar — no author photos needed until the admin panel sends them. */
export function Avatar({ name, onDark = false }: { name: string; onDark?: boolean }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      aria-hidden
      className={
        onDark
          ? "grid h-6 w-6 place-items-center rounded-full border border-fleece/30 bg-fleece/10 font-data text-[0.55rem] text-fleece"
          : "grid h-6 w-6 place-items-center rounded-full border border-border bg-card font-data text-[0.55rem] text-muted-foreground"
      }
    >
      {initials}
    </span>
  );
}
