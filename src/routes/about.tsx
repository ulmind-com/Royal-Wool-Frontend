import { createFileRoute } from "@tanstack/react-router";

import { AboutHero } from "@/components/about/about-hero";
import { AboutStory } from "@/components/about/about-story";
import { AboutValues } from "@/components/about/about-values";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Royal Wool — small-batch yarn from India" },
      {
        name: "description",
        content:
          "Royal Wool dyes and winds yarn in small lots in West Bengal, for knitters and crocheters who care about gauge and colour consistency.",
      },
      { property: "og:title", content: "About Royal Wool" },
      {
        property: "og:description",
        content: "Small-batch dyed yarn, wound in West Bengal for knitters and crocheters.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: () => (
    <div className="light-section">
      <AboutHero />
      <AboutValues />
      <AboutStory />
    </div>
  ),
});
