import { useEffect, useState } from "react";

/** Elfsight app id for the Royaall Wool Google Reviews widget. */
const APP_ID = "84ed925f-7516-418c-8ed9-0eb5878929f7";

/**
 * Google reviews, served by Elfsight — it reads the live Google Business
 * Profile, so new reviews show up without a deploy.
 *
 * `platform.js` is loaded from the document head (see routes/__root.tsx). It
 * scans for `.elfsight-app-<id>` on load; because Elfsight injects its own DOM
 * into that container, the container is only rendered after hydration so the
 * server and client markup stay identical.
 */
export function ElfsightReviews() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mount = () => window.eapps?.platform?.initialize?.();
    mount();
    const t = window.setTimeout(mount, 1200);
    return () => window.clearTimeout(t);
  }, []);


  return (
    <section
      data-thread-anchor="reviews"
      aria-label="Customer reviews"
      className="relative mt-16 overflow-hidden sm:mt-24"
    >
      {/* soft dye bloom behind the widget */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-[0.1] blur-3xl"
        style={{ backgroundImage: "var(--dye-flow)" }}
      />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <p className="font-data text-2xs text-marigold">Straight from the basket</p>
        <h2 className="mt-2.5 max-w-2xl font-display text-3xl font-light leading-[1.1] text-foreground sm:mt-3 sm:text-5xl">
          What crafters say after
          <br className="hidden sm:block" /> the first skein
        </h2>

        <div className="mt-10">
          <div className={`elfsight-app-${APP_ID}`} data-elfsight-app-lazy />
        </div>
      </div>
    </section>
  );
}
