import { createFileRoute } from "@tanstack/react-router";

import { Glass } from "@/components/ui/glass";
import { UPCOMING_FALLBACK } from "@/data/upcoming";
import { waNotifyMe } from "@/lib/whatsapp";

export const Route = createFileRoute("/upcoming")({
  head: () => ({
    meta: [
      { title: "Upcoming Yarn Ranges — Royal Wool" },
      {
        name: "description",
        content:
          "Six new Royal Wool ranges landing soon: Acrylic Rainbow, MultiTone Acrylic, CloudCotton, Aroma Cotton, TwistTone Cotton and Exclusive Acrylic.",
      },
      { property: "og:title", content: "Upcoming Yarn Ranges — Royal Wool" },
      {
        property: "og:description",
        content: "Six new ranges landing soon. Get a WhatsApp ping when they drop.",
      },
      { property: "og:url", content: "/upcoming" },
    ],
    links: [{ rel: "canonical", href: "/upcoming" }],
  }),
  component: UpcomingPage,
});

function UpcomingPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <p className="font-data text-2xs text-marigold">Coming soon</p>
      <h1 className="mt-4 max-w-3xl font-display text-5xl font-light">
        Six ranges on the <span className="italic text-marigold">dyeing rack</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-fleece-dim">
        Ask for a WhatsApp ping and we'll message you the day each range goes live. In Phase 7 this
        becomes a pinned horizontal rail with a 3D yarn ball per range.
      </p>

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {UPCOMING_FALLBACK.map((range) => (
          <li key={range.name}>
            <Glass variant="card" className="flex h-full flex-col gap-5" data-cursor="product">
              <div className="flex items-start justify-between gap-3">
                <p className="font-data text-2xs text-marigold">Coming soon</p>
                <div className="flex shrink-0 gap-1" aria-hidden>
                  {range.palette.map((hex) => (
                    <span
                      key={hex}
                      className="h-4 w-4 rounded-full border border-border"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>

              <div
                className="mx-auto h-28 w-28 rounded-full"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${range.palette.join(", ")})`,
                  boxShadow: `0 30px 60px -28px ${range.palette[0]}`,
                }}
                aria-hidden
              />

              <div className="min-w-0">
                <h2 className="font-display text-2xl font-light text-fleece">{range.name}</h2>
                <p className="mt-2 text-sm text-fleece-dim">{range.blurb}</p>
              </div>

              <a
                href={waNotifyMe(range.name)}
                target="_blank"
                rel="noopener"
                aria-label={`Notify me on WhatsApp when ${range.name} is available`}
                data-cursor="link"
                className="sheen mt-auto inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 font-data text-2xs text-fleece transition-colors hover:border-marigold hover:text-marigold"
              >
                Notify me on WhatsApp
              </a>
            </Glass>
          </li>
        ))}
      </ul>
    </div>
  );
}
