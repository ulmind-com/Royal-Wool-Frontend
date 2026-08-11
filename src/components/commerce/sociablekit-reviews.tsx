import { useEffect } from "react";

/** SociableKIT app id for the Royaall Wool Google Reviews widget. */
const APP_ID = "25704433";

/**
 * Google reviews, served by SociableKIT — it reads the live Google Business
 * Profile, so new reviews show up without a deploy.
 */
export function SociableKitReviews() {
  useEffect(() => {
    // Inject the script if not already present
    const scriptUrl = "https://widgets.sociablekit.com/google-reviews/widget.js";
    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
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
          <div className="sk-ww-google-reviews" data-embed-id={APP_ID} />
        </div>
      </div>
    </section>
  );
}
