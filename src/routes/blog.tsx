import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";
import { Glass } from "@/components/ui/glass";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "From the Dye House — Royal Wool Blog" },
      {
        name: "description",
        content:
          "Stories, tutorials and colour notes from Royal Wool's small-batch dye house in West Bengal.",
      },
      { property: "og:title", content: "From the Dye House — Royal Wool Blog" },
      {
        property: "og:description",
        content: "Stories, tutorials and colour notes from Royal Wool.",
      },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

const PLACEHOLDER_POSTS = [
  {
    title: "How to read a yarn label",
    date: "Coming soon",
  },
  {
    title: "Why dye lots matter in crochet",
    date: "Coming soon",
  },
  {
    title: "Cotton vs acrylic: when to choose which",
    date: "Coming soon",
  },
];

function BlogPage() {
  return (
    <PageShell
      light
      eyebrow="Blog"
      title="From the dye house"
      intro="Notes on colour, technique and small-batch yarn making."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER_POSTS.map((post) => (
          <Glass key={post.title} variant="card" className="flex flex-col justify-between p-6">
            <div>
              <p className="font-data text-2xs text-marigold">{post.date}</p>
              <h2 className="mt-3 font-display text-xl text-foreground">{post.title}</h2>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Full article coming once the CMS is wired.</p>
          </Glass>
        ))}
      </div>
    </PageShell>
  );
}
