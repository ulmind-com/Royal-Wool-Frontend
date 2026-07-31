import { useEffect, useRef, useState } from "react";

import { useIsTouch, useReducedMotion } from "@/hooks/use-motion";

type CursorState = "default" | "link" | "product" | "drag" | "image";

const LABELS: Record<CursorState, string> = {
  default: "",
  link: "",
  product: "View",
  drag: "Drag",
  image: "Zoom",
};

/**
 * Crochet-hook cursor with a spring-lagged trailing dot.
 * Elements opt into states with data-cursor="link|product|drag|image".
 */
export function CustomCursor() {
  const reduced = useReducedMotion();
  const touch = useIsTouch();
  const hookRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<CursorState>("default");
  const [visible, setVisible] = useState(false);

  const enabled = !reduced && !touch;

  useEffect(() => {
    if (!enabled) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dot = { ...target };
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      setVisible(true);
      const el = (event.target as HTMLElement | null)?.closest?.("[data-cursor]");
      const next = el?.getAttribute("data-cursor") as CursorState | undefined;
      setState(next ?? "default");
      document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
      document.documentElement.style.setProperty("--my", `${event.clientY}px`);
    };

    const onLeave = () => setVisible(false);

    const loop = () => {
      // spring-ish lag for the trailing dot
      dot.x += (target.x - dot.x) * 0.14;
      dot.y += (target.y - dot.y) * 0.14;
      if (hookRef.current) {
        hookRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(loop);

    document.body.style.cursor = "none";
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      document.body.style.cursor = "";
    };
  }, [enabled]);

  if (!enabled) return null;

  const ringSize = state === "default" ? 10 : state === "link" ? 34 : 58;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] hidden md:block"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 240ms var(--ease-enter)" }}
    >
      {/* trailing ring / label */}
      <div ref={dotRef} className="absolute left-0 top-0 will-change-transform">
        <div
          className="flex items-center justify-center rounded-full border font-data text-2xs"
          style={{
            width: ringSize,
            height: ringSize,
            marginLeft: -ringSize / 2,
            marginTop: -ringSize / 2,
            borderColor: "color-mix(in oklab, var(--marigold) 70%, transparent)",
            backgroundColor:
              state === "default"
                ? "var(--marigold)"
                : "color-mix(in oklab, var(--ink) 82%, transparent)",
            backdropFilter: state === "default" ? "none" : "blur(6px)",
            color: "var(--fleece)",
            transition:
              "width 320ms var(--ease-enter), height 320ms var(--ease-enter), margin 320ms var(--ease-enter), background-color 320ms var(--ease-enter)",
          }}
        >
          {LABELS[state]}
        </div>
      </div>

      {/* crochet hook glyph, leads the ring */}
      <div ref={hookRef} className="absolute left-0 top-0 will-change-transform">
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          style={{ marginLeft: -5, marginTop: -5 }}
        >
          <path
            d="M6 3.5 L16.5 15.5 a4 4 0 1 1-6 2.4"
            stroke="var(--ink)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
