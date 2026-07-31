import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { useReducedMotion } from "@/hooks/use-motion";
import { cn } from "@/lib/utils";

/**
 * Liquid glass primitive.
 *
 * Rules (design system §6.3):
 *  - Never nest glass inside glass.
 *  - Never put glass on a flat background — there must be colour or media behind it.
 *  - Keep text contrast >= 4.5:1; use `scrim` when text sits over busy media.
 */
const glassVariants = cva(
  "relative isolate border backdrop-blur-[22px] backdrop-saturate-[1.6] transition-[transform,box-shadow] duration-[var(--dur-standard)] ease-[var(--ease-enter)]",
  {
    variants: {
      variant: {
        panel: "rounded-3xl p-6 sm:p-8",
        card: "rounded-2xl p-4 sm:p-5",
        pill: "rounded-full px-4 py-2",
        sheet: "rounded-l-3xl rounded-r-none p-6",
      },
    },
    defaultVariants: { variant: "panel" },
  },
);

const GLASS_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(135deg, color-mix(in oklab, var(--ink) 10%, transparent), color-mix(in oklab, var(--ink) 3%, transparent))",
  borderColor: "color-mix(in oklab, var(--ink) 14%, transparent)",
  boxShadow:
    "inset 0 1px 0 color-mix(in oklab, var(--ink) 20%, transparent), inset 0 -1px 0 color-mix(in oklab, var(--ink) 35%, transparent), 0 24px 60px -20px color-mix(in oklab, var(--ink) 70%, transparent)",
};

export interface GlassProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassVariants> {
  /** Solid-ish inner scrim behind content, for contrast over media. */
  scrim?: boolean;
  /** Adds a low-opacity SVG refraction layer. Large panels only. */
  refract?: boolean;
  asChild?: boolean;
}

export const Glass = React.forwardRef<HTMLDivElement, GlassProps>(function Glass(
  { className, variant, scrim, refract, children, style, ...props },
  ref,
) {
  const reduced = useReducedMotion();
  const localRef = React.useRef<HTMLDivElement | null>(null);
  const frame = React.useRef<number | null>(null);

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );

  // Cursor-following specular highlight, throttled to one rAF per move.
  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduced) return;
      const node = localRef.current;
      if (!node) return;
      const { clientX, clientY } = event;
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const rect = node.getBoundingClientRect();
        node.style.setProperty("--mx", `${clientX - rect.left}px`);
        node.style.setProperty("--my", `${clientY - rect.top}px`);
      });
    },
    [reduced],
  );

  React.useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return (
    <div
      ref={setRefs}
      onPointerMove={onPointerMove}
      style={{ ...GLASS_STYLE, ...style }}
      className={cn(glassVariants({ variant }), "specular", className)}
      {...props}
    >
      {refract ? <RefractionLayer /> : null}
      {scrim ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit]"
          style={{
            backgroundColor: "color-mix(in oklab, var(--ink) 62%, transparent)",
          }}
        />
      ) : null}
      {children}
    </div>
  );
});

const REFRACT_ID = "rw-glass-refract";

function RefractionLayer() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-[0.06]"
    >
      <svg className="h-full w-full" aria-hidden>
        <filter id={REFRACT_ID}>
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves={2} seed={7} />
          <feDisplacementMap in="SourceGraphic" scale="18" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter={`url(#${REFRACT_ID})`}
          fill="currentColor"
          className="text-foreground"
        />
      </svg>
    </span>
  );
}
