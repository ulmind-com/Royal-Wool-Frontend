import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

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
      { property: "og:url", content: "https://royal-yarn-threads.lovable.app/blog" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://royal-yarn-threads.lovable.app/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { data } = useQuery(blogPostsQuery);
  const { hero, rest } = splitFeed(data ?? []);

  return (
    <div className="light-section">
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-6 pb-20 sm:px-6 sm:pt-8 lg:px-10 lg:pb-28">
        {hero ? <BlogFeatured post={hero} /> : null}

        <section aria-labelledby="recent-posts" className="mt-14 sm:mt-20">
          <h1 id="recent-posts" className="font-display text-2xl font-normal sm:text-[1.75rem]">
            Recent blog posts
          </h1>

          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <button
              type="button"
              data-cursor="link"
              className="inline-flex min-h-[42px] items-center rounded-lg bg-ink px-5 py-2.5 text-sm text-fleece transition-opacity hover:opacity-90"
            >
              Loading more...
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
