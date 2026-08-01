import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { useReducedMotion } from "@/hooks/use-motion";
import { cn } from "@/lib/utils";

/**
 * Props for the InteractiveTravelCard component.
 */
export interface InteractiveTravelCardProps {
  /** The main title for the card, e.g., "Cotton Delight" */
  title: string;
  /** A subtitle or descriptor, e.g., "100% mercerised cotton" */
  subtitle: string;
  /** The URL for the background image. */
  imageUrl: string;
  /** The text for the primary action button. */
  actionText: string;
  /** The destination URL for the top-right link. */
  href: string;
  /** Callback when the primary action button is clicked. */
  onActionClick?: () => void;
  /** Optional additional class names. */
  className?: string;
}

/**
 * Theme-adaptive media card with a 3D tilt on hover.
 * Tilt is disabled when the visitor prefers reduced motion.
 */
export const InteractiveTravelCard = React.forwardRef<
  HTMLDivElement,
  InteractiveTravelCardProps
>(({ title, subtitle, imageUrl, actionText, href, onActionClick, className }, ref) => {
  const reduced = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], ["10.5deg", "-10.5deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-10.5deg", "10.5deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduced) return;
    const { width, height, left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - left) / width - 0.5);
    mouseY.set((e.clientY - top) / height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div ref={ref} className={cn("[perspective:1200px]", className)}>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={
          reduced ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" as const }
        }
        className="group relative aspect-[4/5] w-full overflow-hidden rounded-[28px] border border-border/70 shadow-[0_30px_80px_-40px_color-mix(in_oklab,var(--foreground)_45%,transparent)]"
      >
        {/* Background image */}
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--dur-cinematic)] ease-[var(--ease-move)] group-hover:scale-[1.06]"
        />

        {/* Readability scrim */}
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "linear-gradient(to top, color-mix(in oklab, black 68%, transparent) 0%, color-mix(in oklab, black 20%, transparent) 42%, color-mix(in oklab, black 26%, transparent) 100%)",
          }}
        />

        {/* Content */}
        <div
          className="relative flex h-full flex-col justify-between p-6 sm:p-8"
          style={reduced ? {} : { transform: "translateZ(50px)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-light text-white sm:text-3xl">
                {title}
              </h3>
              <p className="mt-1 text-sm text-white/75">{subtitle}</p>
            </div>
            <a
              href={href}
              aria-label={`Open ${title}`}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors duration-[var(--dur-micro)] hover:bg-white/20"
            >
              <ArrowUpRight className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </a>
          </div>

          <button
            type="button"
            onClick={onActionClick}
            className="w-full rounded-full border border-white/25 bg-white/12 px-6 py-3.5 font-data text-2xs uppercase tracking-[0.18em] text-white backdrop-blur-md transition-colors duration-[var(--dur-micro)] hover:bg-white hover:text-foreground"
          >
            {actionText}
          </button>
        </div>
      </motion.div>
    </div>
  );
});
InteractiveTravelCard.displayName = "InteractiveTravelCard";
