import { useEffect, useState } from "react";

import { useSettings } from "@/hooks/use-settings";
import { Glass } from "@/components/ui/glass";
import { waGeneral } from "@/lib/whatsapp";

/**
 * Cold-start curtain.
 *
 * The store API sleeps when idle, so the very first request of a session can
 * take up to a minute. Rather than let the page look broken, we wait a beat and
 * only then explain what's happening — most warm visits never see this at all.
 */
const REVEAL_AFTER_MS = 2500;

export function WakeGate() {
  const { isPending, isError, refetch } = useSettings();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWaited(true), REVEAL_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  const show = waited && (isPending || isError);
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center px-4"
      style={{ backgroundColor: "color-mix(in oklab, var(--ink) 88%, transparent)" }}
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30 blur-3xl"
        style={{ backgroundImage: "var(--dye-flow)" }}
        aria-hidden
      />
      <Glass variant="panel" refract className="relative w-full max-w-md text-center">
        <p className="font-data text-2xs text-marigold">
          {isError ? "Store server unreachable" : "Warming the dye house"}
        </p>
        <h2 className="mt-4 font-display text-3xl font-light">
          {isError ? "We couldn't reach the store" : "One moment — the vats are heating"}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {isError
            ? "Our store server didn't answer. It sleeps when quiet, so a retry usually fixes it."
            : "Our store server sleeps when it's quiet. The first visit can take up to a minute — after that everything is instant."}
        </p>

        {!isError ? (
          <div
            className="mx-auto mt-8 h-px w-48 overflow-hidden"
            style={{ backgroundColor: "color-mix(in oklab, var(--ink) 14%, transparent)" }}
            aria-hidden
          >
            <div className="h-px w-1/3 animate-[thread-pull_1.6s_var(--ease-enter)_infinite] bg-marigold" />
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => void refetch()}
              data-cursor="link"
              className="sheen inline-flex items-center rounded-full bg-madder px-5 py-2.5 font-data text-2xs text-primary-foreground"
            >
              Try again
            </button>
            <a
              href={waGeneral()}
              target="_blank"
              rel="noopener"
              data-cursor="link"
              className="inline-flex items-center rounded-full border border-border px-5 py-2.5 font-data text-2xs text-foreground"
            >
              Order on WhatsApp
            </a>
          </div>
        )}
      </Glass>
    </div>
  );
}
