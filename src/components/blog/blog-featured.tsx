import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

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
      className="group relative overflow-hidden rounded-[22px] border border-border bg-card sm:rounded-[32px]"
      style={{
        boxShadow: "0 40px 90px -55px color-mix(in oklab, var(--ink) 45%, transparent)",
      }}
    >
      <img
        src={post.image}
        alt={post.title}
        width={1200}
        height={800}
        decoding="async"
        className="block h-[320px] w-full object-cover object-center transition-transform duration-[900ms] ease-out group-hover:scale-[1.03] sm:h-[420px] lg:h-[520px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, transparent 30%, color-mix(in oklab, var(--ink) 78%, transparent))",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
        <p className="font-data text-2xs text-marigold">
          {post.tag} · {post.date}
        </p>
        <h2 className="mt-3 max-w-3xl font-display text-2xl font-light leading-[1.12] text-fleece sm:text-3xl lg:text-4xl">
          {post.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fleece/80 sm:text-base">
          {post.excerpt}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Avatar name={post.author} onDark />
          <span className="font-data text-2xs text-fleece/70">{post.author}</span>
          <span className="inline-flex items-center gap-1.5 font-data text-2xs text-marigold">
            Read story
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </div>
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
          ? "grid h-8 w-8 place-items-center rounded-full border border-fleece/30 bg-fleece/10 font-data text-2xs text-fleece"
          : "grid h-8 w-8 place-items-center rounded-full border border-border bg-card font-data text-2xs text-muted-foreground"
      }
    >
      {initials}
    </span>
  );
}
