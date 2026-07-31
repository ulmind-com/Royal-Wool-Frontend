import type { ReactNode } from "react";

import { Glass } from "@/components/ui/glass";

/**
 * Shared page shell for Phase 1 route stubs.
 * Each page keeps exactly one <h1> and a designed (not blank) body.
 */
export function PageShell({
  eyebrow,
  title,
  intro,
  children,
  light = false,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  light?: boolean;
}) {
  return (
    <div className={light ? "light-section" : undefined}>
      <div className="relative mx-auto w-full max-w-[1200px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <p className="font-data text-2xs text-marigold">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-light">{title}</h1>
        {intro ? <p className="mt-6 max-w-xl text-lg text-muted-foreground">{intro}</p> : null}
        <div className="mt-12">{children ?? <ComingInPhase />}</div>
      </div>
    </div>
  );
}

function ComingInPhase() {
  return (
    <Glass variant="panel" className="max-w-xl">
      <p className="font-data text-2xs text-marigold">Phase 1 · shell only</p>
      <p className="mt-3 text-muted-foreground">
        This route exists, is styled and is reachable. Live data, 3D and commerce land in the next
        phases.
      </p>
    </Glass>
  );
}

/** Long-form legal / info copy block on a light section. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-2xl space-y-5 text-base leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-foreground [&_strong]:text-foreground">
      {children}
    </div>
  );
}
