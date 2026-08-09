import { useEffect } from "react";

/** Elfsight app id for the Royaall Wool Google Reviews widget. */
const APP_ID = "84ed925f-7516-418c-8ed9-0eb5878929f7";

/**
 * Google reviews, served by Elfsight — it reads the live Google Business
 * Profile, so new reviews show up without a deploy.
 */
export function ElfsightReviews() {
  useEffect(() => {
    // Inject the script if not already present
    const scriptUrl = "https://static.elfsight.com/platform/platform.js";
    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      document.body.appendChild(script);
    }

    const mount = () => {
      // @ts-ignore
      window.eapps?.platform?.initialize?.();
    };

    mount();
    const t1 = window.setTimeout(mount, 1000);
    const t2 = window.setTimeout(mount, 3000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
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
