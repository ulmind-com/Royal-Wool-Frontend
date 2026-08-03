import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { BlogCard } from "@/components/blog/blog-card";
import { BlogFeatured } from "@/components/blog/blog-featured";
import { blogPostsQuery, splitFeed } from "@/lib/api/blog";

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
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/blog" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

const PAGE_SIZE = 6;

function BlogPage() {
  const { data } = useQuery(blogPostsQuery);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const { hero, rest } = splitFeed(data ?? []);

  return (
    <div className="light-section">
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-10 pb-20 sm:px-6 sm:pt-14 lg:px-10 lg:pb-28">
        <header className="max-w-2xl">
          <p className="font-data text-2xs text-marigold">Journal · Royal Wool</p>
          <h1 className="mt-3 font-display text-3xl font-light leading-[1.08] sm:text-4xl lg:text-5xl">
            From the dye house
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Notes on colour, fibre and technique — written beside the vats, for people who read a
            gauge swatch.
          </p>
        </header>

        {hero ? (
          <div className="mt-9 sm:mt-12">
            <BlogFeatured post={hero} />
          </div>
        ) : null}

        <section aria-labelledby="recent-posts" className="mt-14 sm:mt-20">
          <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-5">
            <h2 id="recent-posts" className="font-display text-2xl font-light sm:text-3xl">
              Recent blog posts
            </h2>
            <p className="font-data text-2xs text-muted-foreground">
              {rest.length} {rest.length === 1 ? "story" : "stories"}
            </p>
          </div>

          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(0, visible).map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>

          {visible < rest.length ? (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                data-cursor="link"
                onClick={() => setVisible((n) => n + PAGE_SIZE)}
                className="sheen inline-flex min-h-[46px] items-center gap-2 rounded-full border border-border px-7 py-3 font-data text-2xs text-foreground transition-colors hover:border-marigold hover:text-marigold"
              >
                Load more stories
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
