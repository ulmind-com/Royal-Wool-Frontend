import { useQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { BlogCard } from "@/components/blog/blog-card";
import { BlogFeatured } from "@/components/blog/blog-featured";
import { CardSkeleton } from "@/components/data-state";
import type { BlogPost } from "@/data/blog";
import { blogFeedQuery, splitFeed } from "@/lib/api/blog";

export const Route = createFileRoute("/blog/")({
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
  const [pages, setPages] = useState(1);
  const results = useQueries({
    queries: Array.from({ length: pages }, (_, i) => blogFeedQuery(i + 1)),
  });

  const posts: BlogPost[] = [];
  const seen = new Set<string>();
  for (const result of results) {
    for (const post of result.data?.posts ?? []) {
      if (seen.has(post.slug)) continue;
      seen.add(post.slug);
      posts.push(post);
    }
  }

  const last = results[results.length - 1];
  const isLoading = results.some((r) => r.isPending) && posts.length === 0;
  const isFetchingMore = pages > 1 && Boolean(last?.isFetching);
  const hasMore = Boolean(last?.data?.hasMore);
  const { hero, rest } = splitFeed(posts);

  return (
    <div className="light-section">
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-6 pb-20 sm:px-6 sm:pt-8 lg:px-10 lg:pb-28">
        {isLoading ? (
          <CardSkeleton className="h-[300px] w-full sm:h-[400px] lg:h-[480px]" />
        ) : hero ? (
          <BlogFeatured post={hero} />
        ) : null}

        <section aria-labelledby="recent-posts" className="mt-14 sm:mt-20">
          <h1 id="recent-posts" className="font-display text-2xl font-normal sm:text-[1.75rem]">
            Recent blog posts
          </h1>

          {isLoading ? (
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
              {Array.from({ length: 6 }, (_, i) => (
                <CardSkeleton key={i} className="aspect-[3/2] w-full" />
              ))}
            </div>
          ) : rest.length ? (
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post, i) => (
                <BlogCard key={post.slug} post={post} index={i} />
              ))}
            </div>
          ) : (
            <p className="mt-6 max-w-xl text-muted-foreground">
              No stories published yet. New notes from the dye house will appear here as soon as
              they're posted.
            </p>
          )}

          {hasMore ? (
            <div className="mt-14 flex justify-center">
              <button
                type="button"
                data-cursor="link"
                disabled={isFetchingMore}
                onClick={() => setPages((n) => n + 1)}
                className="inline-flex min-h-[42px] items-center rounded-lg bg-ink px-5 py-2.5 text-sm text-fleece transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isFetchingMore ? "Loading more..." : "Load more stories"}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
