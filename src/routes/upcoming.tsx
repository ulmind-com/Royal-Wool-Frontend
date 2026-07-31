import { createFileRoute } from "@tanstack/react-router";

import { UpcomingCard } from "@/components/commerce/upcoming-rail";
import { groupUpcomingByCategory } from "@/data/upcoming";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/upcoming" },
    ],
    links: [{ rel: "canonical", href: "/upcoming" }],
  }),
  component: UpcomingPage,
});

function UpcomingPage() {
  const groups = groupUpcomingByCategory();

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <p className="font-data text-2xs text-marigold">Coming soon</p>
      <h1 className="mt-4 max-w-3xl font-display text-5xl font-light">
        Six ranges on the <span className="italic text-marigold">dyeing rack</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-muted-foreground">
        Ask for a WhatsApp ping and we'll message you the day each range goes live — no spam, just
        the drop.
      </p>

      {groups.map((group) => (
        <section key={group.category} className="mt-14" aria-label={`${group.category} ranges`}>
          <div className="flex items-center gap-4">
            <h2 className="font-data text-2xs text-foreground">{group.category}</h2>
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>

          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.ranges.map((range) => (
              <li key={range.name}>
                <UpcomingCard range={range} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
