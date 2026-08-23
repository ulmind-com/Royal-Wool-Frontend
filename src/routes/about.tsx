import { createFileRoute } from "@tanstack/react-router";

import { AboutHero } from "@/components/about/about-hero";
import { AboutStory } from "@/components/about/about-story";
import { AboutValues } from "@/components/about/about-values";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Royaall Wool — India's Premium Small-Batch Yarn Brand" },
      {
        name: "description",
        content:
          "Royaall Wool hand-dyes and winds yarn in small batches in Howrah, West Bengal. Skin-safe, tested dyes for knitters, crocheters & amigurumi lovers across India.",
      },
      { property: "og:title", content: "About Royaall Wool — India's Premium Small-Batch Yarn Brand" },
      {
        property: "og:description",
        content: "Small-batch dyed yarn, wound in Howrah, West Bengal for knitters and crocheters across India.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://royaallwool.com/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://royaallwool.com/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://royaallwool.com/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "About Us",
              item: "https://royaallwool.com/about",
            },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <div className="light-section">
      <AboutHero />
      <AboutValues />
      <AboutStory />
    </div>
  ),
});
