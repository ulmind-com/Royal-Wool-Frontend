import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BadgeCheck, Quote, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { RatingStars } from "@/components/commerce/rating-stars";
import { type Review, relativeDate, voteReview } from "@/lib/api/reviews";
import { API_BASE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Backend may return relative upload paths; make them absolute. */
export function resolveMedia(url: string | null): string | null {
  if (!url) return null;
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  // Locally bundled/served files (placeholder photography) stay on this origin.
  if (/^\/(?:__l5e|assets)\//.test(url)) return url;
  return new URL(url.startsWith("/") ? url : `/${url}`, API_BASE_URL).toString();
}

/**
 * One customer review. Height is content-driven (no clamping, no fixed ratio)
 * so a two-word review stays tiny and a long one grows — the masonry column
 * layout in customer-reviews.tsx does the packing.
 */
export function ReviewCard({
  review,
  index,
  onOpenPhoto,
}: {
  review: Review;
  index: number;
  onOpenPhoto: (photos: string[], start: number, caption: string | null) => void;
}) {
  const when = relativeDate(review.createdAt);
  const photos = review.photos.map((p) => resolveMedia(p)).filter((p): p is string => !!p);
  const productImage = resolveMedia(review.product.image);
  const long = review.text.length > 220;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative mb-5 break-inside-avoid overflow-hidden rounded-[1.25rem] border p-5 backdrop-blur-[18px] transition-[transform,box-shadow,border-color] duration-[var(--dur-standard)] ease-[var(--ease-enter)] hover:-translate-y-1 sm:p-6",
      )}
      style={{
        backgroundImage:
          "linear-gradient(150deg, color-mix(in oklab, var(--fleece) 88%, transparent), color-mix(in oklab, var(--fleece) 52%, transparent))",
        borderColor: "color-mix(in oklab, var(--ink) 9%, transparent)",
        boxShadow:
          "inset 0 1px 0 color-mix(in oklab, var(--fleece) 90%, transparent), 0 18px 44px -30px color-mix(in oklab, var(--ink) 30%, transparent)",
      }}
    >
      {/* Marigold hairline that wakes up on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-5 top-0 h-px opacity-0 transition-opacity duration-[var(--dur-standard)] group-hover:opacity-100"
        style={{
          backgroundImage: "linear-gradient(90deg, transparent, var(--marigold), transparent)",
        }}
      />

      <header className="flex items-start justify-between gap-3">
        <RatingStars value={review.rating} size={15} />
        {when ? <span className="font-data text-2xs text-muted-foreground">{when}</span> : null}
      </header>

      <div className="mt-4 flex items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-data text-2xs text-foreground"
          style={{ backgroundColor: "color-mix(in oklab, var(--marigold) 26%, transparent)" }}
          aria-hidden
        >
          {review.author.trim().charAt(0).toUpperCase() || "R"}
        </span>
        <p className="font-display text-base font-normal text-foreground">{review.author}</p>
        {review.verified ? (
          <BadgeCheck className="h-4 w-4 text-madder" aria-label="Verified buyer" />
        ) : null}
      </div>

      {review.title ? (
        <p className="mt-4 font-display text-lg font-normal leading-snug text-foreground">
          {review.title}
        </p>
      ) : null}

      {review.text ? (
        <div className="relative mt-3">
          {long ? (
            <Quote
              className="absolute -left-1 -top-1 h-5 w-5 text-marigold/50"
              strokeWidth={1.5}
              aria-hidden
            />
          ) : null}
          <p
            className={cn(
              "whitespace-pre-line text-muted-foreground",
              long ? "pl-6 text-[0.95rem] leading-relaxed" : "text-base leading-relaxed",
            )}
          >
            {review.text}
          </p>
        </div>
      ) : null}

      {photos.length ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {photos.slice(0, 4).map((src, i) => (
            <li key={src}>
              <button
                type="button"
                data-cursor="link"
                onClick={() =>
                  onOpenPhoto(photos, i, `${review.author} · ${review.product.title ?? ""}`.trim())
                }
                aria-label={`Open photo ${i + 1} from ${review.author}`}
                className="block h-16 w-16 overflow-hidden rounded-xl border border-border transition-transform duration-[var(--dur-micro)] hover:scale-[1.06] sm:h-20 sm:w-20"
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
          {photos.length > 4 ? (
            <li className="flex h-16 w-16 items-center justify-center rounded-xl border border-border font-data text-2xs text-muted-foreground sm:h-20 sm:w-20">
              +{photos.length - 4}
            </li>
          ) : null}
        </ul>
      ) : null}

      {review.tags.length ? (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {review.tags.slice(0, 3).map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border px-2.5 py-1 font-data text-2xs text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      {review.product.title ? (
        review.product.id ? (
          <Link
            to="/product/$id"
            params={{ id: review.product.id }}
            data-cursor="link"
            className="mt-5 flex items-center gap-2.5 rounded-xl border border-border/70 p-2 transition-colors hover:border-madder/50"
          >
            <ProductChip image={productImage} title={review.product.title} />
          </Link>
        ) : (
          <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-border/70 p-2">
            <ProductChip image={productImage} title={review.product.title} />
          </div>
        )
      ) : null}

      <HelpfulVote reviewId={review.id} />
    </motion.article>
  );
}

/** "Was this helpful?" — the counter the admin panel reads back. */
function HelpfulVote({ reviewId }: { reviewId: string }) {
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);

  const vote = async () => {
    if (voted || busy) return;
    setBusy(true);
    try {
      await voteReview(reviewId, true);
      setVoted(true);
      toast.success("Thanks for the signal");
    } catch {
      toast.error("Couldn't record that vote.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={vote}
      disabled={voted || busy}
      className="mt-4 inline-flex items-center gap-1.5 font-data text-2xs text-muted-foreground transition-colors hover:text-marigold disabled:opacity-60"
    >
      <ThumbsUp className={cn("h-3.5 w-3.5", voted && "fill-current text-marigold")} />
      {voted ? "Marked helpful" : "Helpful"}
    </button>
  );
}

function ProductChip({ image, title }: { image: string | null; title: string }) {
  return (
    <>
      {image ? (
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-9 w-9 shrink-0 rounded-lg object-cover"
        />
      ) : null}
      <span className="min-w-0">
        <span className="block font-data text-2xs text-marigold">Reviewed</span>
        <span className="block truncate text-sm text-foreground">{title}</span>
      </span>
    </>
  );
}
