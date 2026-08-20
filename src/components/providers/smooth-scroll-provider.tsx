import { useEffect } from "react";

import { useReducedMotion } from "@/hooks/use-motion";

/**
 * Lenis inertial smooth scroll, synced with GSAP's ticker + ScrollTrigger.
 * Both libs are loaded dynamically so they stay out of the SSR/first bundle.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
      });

      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Expose so modals/drawers can pause inertial scroll while open —
      // otherwise Lenis keeps hijacking the wheel and the page scrolls
      // behind the overlay instead of the drawer's own list.
      (window as any).__lenis = lenis;

      cleanup = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        if ((window as any).__lenis === lenis) delete (window as any).__lenis;
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [reduced]);

  return <>{children}</>;
}
