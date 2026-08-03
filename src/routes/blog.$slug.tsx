import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { BlogArticle, readTime } from "@/components/blog/blog-article";
import { BlogCard } from "@/components/blog/blog-card";
import { Avatar } from "@/components/blog/blog-featured";
import { useReducedMotion } from "@/hooks/use-motion";
import { blogPostsQuery, fetchBlogPost } from "@/lib/api/blog";
import { whatsappLink } from "@/lib/whatsapp";

const SITE = "https://royal-yarn-threads.lovable.app";
const EASE = [0.16, 1, 0.3, 1] as const;

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await fetchBlogPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },

  head: ({ params, loaderData }) => {
    const url = `${SITE}/blog/${params.slug}`;
    if (!loaderData) {
      return {
        meta: [{ title: "Story unavailable — Royal Wool" }, { name: "robots", content: "noindex" }],
      };
    }
    const { post } = loaderData;
    const description = post.excerpt || `A story from the Royal Wool dye house: ${post.title}.`;
    const image = post.image.startsWith("http") ? post.image : `${SITE}${post.image}`;
    return {
      meta: [
        { title: `${post.title} — Royal Wool Journal` },
        { name: "description", content: description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description,
            image,
            author: { "@type": "Person", name: post.author },
            publisher: { "@type": "Organization", name: "Royal Wool" },
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  component: BlogPostPage,
  errorComponent: () => <Fallback title="This story could not be loaded" />,
  notFoundComponent: () => <Fallback title="We couldn't find that story" />,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const reduced = useReducedMotion();
  const { data } = useQuery(blogPostsQuery);
  const more = (data ?? []).filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="light-section">
      <article className="mx-auto w-full max-w-[1200px] px-4 pt-6 pb-20 sm:px-6 sm:pt-8 lg:px-10 lg:pb-28">
        <Link
          to="/blog"
          data-cursor="link"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          All stories
        </Link>

        {post.image ? (
          <motion.figure
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, y: 24 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.8, ease: EASE },
                })}
            className="mt-6 overflow-hidden rounded-[18px] border border-border bg-card sm:mt-8 sm:rounded-[24px]"
          >
            <img
              src={post.image}
              alt={post.title}
              width={1200}
              height={800}
              decoding="async"
              className="block h-[240px] w-full object-cover object-center sm:h-[400px] lg:h-[520px]"
            />
          </motion.figure>
        ) : null}


        <motion.header
          {...(reduced
            ? {}
            : {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.7, delay: 0.12, ease: EASE },
              })}
          className="mt-10 max-w-3xl sm:mt-12"
        >
          <p className="font-data text-2xs text-marigold">
            {[post.tag, post.date, readTime(post.body, post.excerpt)].filter(Boolean).join(" · ")}
          </p>
          <h1 className="mt-4 font-display text-3xl font-light leading-[1.1] sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
          ) : null}
          <div className="mt-7 flex items-center gap-2">
            <Avatar name={post.author} />
            <span className="text-sm text-muted-foreground">{post.author}</span>
          </div>
        </motion.header>


        {post.body?.length ? (
          <BlogArticle blocks={post.body} />
        ) : (
          <p className="mt-12 max-w-[68ch] text-base leading-[1.85] text-muted-foreground">
            The full story is being written up in the dye house. Check back shortly — or ask us on
            WhatsApp and we'll tell you about it directly.
          </p>
        )}

        <div className="mt-14 border-t border-border pt-8">
          <a
            href={whatsappLink(`Hi Royal Wool, I just read "${post.title}" on your journal.`)}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="link"
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm text-fleece transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            Share on WhatsApp
          </a>
        </div>

        {more.length ? (
          <section aria-labelledby="more-journal" className="mt-16 sm:mt-20">
            <h2
              id="more-journal"
              className="font-display text-2xl font-normal sm:text-[1.75rem]"
            >
              More from the journal
            </h2>
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p, i) => (
                <BlogCard key={p.id} post={p} index={i} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </div>
  );
}

function Fallback({ title }: { title: string }) {
  return (
    <div className="light-section">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-24 sm:px-6 lg:px-10">
        <h1 className="font-display text-3xl font-light sm:text-4xl">{title}</h1>
        <p className="mt-4 text-muted-foreground">
          It may have been moved or renamed. Browse the journal for the latest stories.
        </p>
        <Link
          to="/blog"
          data-cursor="link"
          className="mt-8 inline-flex min-h-[42px] items-center rounded-lg bg-ink px-5 py-2.5 text-sm text-fleece transition-opacity hover:opacity-90"
        >
          Back to the journal
        </Link>
      </div>
    </div>
  );
}
