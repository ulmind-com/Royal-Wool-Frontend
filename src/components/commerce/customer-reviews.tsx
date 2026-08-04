import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { RatingStars } from "@/components/commerce/rating-stars";
import { ReviewCard } from "@/components/commerce/review-card";
import { ReviewLightbox } from "@/components/commerce/review-lightbox";
import { CardSkeleton, DataError } from "@/components/data-state";
import { type Review, reviewFeedQuery } from "@/lib/api/reviews";
import { cn } from "@/lib/utils";

const PAGE = 6;

type FilterId = "all" | "photos" | "5" | "4" | "low";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All reviews" },
  { id: "photos", label: "With photos" },
  { id: "5", label: "5 stars" },
  { id: "4", label: "4 stars" },
  { id: "low", label: "3 & below" },
];

function matches(review: Review, filter: FilterId) {
  if (filter === "all") return true;
  if (filter === "photos") return review.photos.length > 0;
  if (filter === "5") return review.rating === 5;
  if (filter === "4") return review.rating === 4;
  return review.rating <= 3;
}

/**
 * Site-wide customer reviews. Fully data-driven: ratings, photos, comments and
 * the product each review belongs to all come from the API (see lib/api/reviews).
 * Cards are content-sized in a masonry column flow — short comments stay short.
 */
export function CustomerReviews() {
  const { data, isPending, isError, error, refetch } = useQuery(reviewFeedQuery);
  const [filter, setFilter] = useState<FilterId>("all");
  const [shown, setShown] = useState(PAGE);
  const [lightbox, setLightbox] = useState<{
    photos: string[];
    index: number;
    caption: string | null;
  } | null>(null);

  const filtered = useMemo(
    () => (data?.reviews ?? []).filter((r) => matches(r, filter)),
    [data?.reviews, filter],
  );

  // Nothing to say yet — don't render an empty testimonial shelf.
  if (!isPending && !isError && !data?.count) return null;

  const visible = filtered.slice(0, shown);
  const remaining = Math.max(0, filtered.length - shown);
  const expanded = remaining === 0 && shown > PAGE;
  const photoCount = (data?.reviews ?? []).filter((r) => r.photos.length).length;

  return (
    <section
      data-thread-anchor="reviews"
      aria-label="Customer reviews"
      className="relative mt-16 overflow-hidden sm:mt-24"
    >
      {/* soft dye bloom behind the glass cards */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-[0.1] blur-3xl"
        style={{ backgroundImage: "var(--dye-flow)" }}
      />

      <div className="relative mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end lg:gap-10">
          <div className="min-w-0">
            <p className="font-data text-2xs text-marigold">Straight from the basket</p>
            <h2 className="mt-2.5 max-w-2xl font-display text-3xl font-light leading-[1.1] text-foreground sm:mt-3 sm:text-5xl">
              What crafters say after
              <br className="hidden sm:block" /> the first skein
            </h2>

            {isPending ? (
              <div className="mt-6 h-10 w-56 animate-pulse rounded-full bg-foreground/5" />
            ) : data ? (
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <span className="flex items-baseline gap-2">
                  <span className="font-display text-5xl font-light text-foreground">
                    {data.average.toFixed(1)}
                  </span>
                  <span className="font-data text-2xs text-muted-foreground">/ 5</span>
                </span>
                <span className="flex flex-col gap-1">
                  <RatingStars value={data.average} size={16} />
                  <span className="font-data text-2xs text-muted-foreground">
                    {data.count} verified review{data.count === 1 ? "" : "s"}
                  </span>
                </span>
                {photoCount ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 font-data text-2xs text-muted-foreground">
                    <Camera className="h-3.5 w-3.5 text-marigold" aria-hidden />
                    {photoCount} with photos
                  </span>
                ) : null}
              </div>
            ) : null}

            {data?.isDemo ? (
              <p className="mt-4 font-data text-2xs text-muted-foreground/70">
                Sample reviews — real customer reviews appear here automatically.
              </p>
            ) : null}
          </div>

          {/* rating breakdown */}
          {data?.count ? (
            <ul className="flex flex-col gap-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const n = data.breakdown[star] ?? 0;
                const pct = data.count ? (n / data.count) * 100 : 0;
                return (
                  <li key={star} className="flex items-center gap-3">
                    <span className="w-8 shrink-0 font-data text-2xs text-muted-foreground">
                      {star}★
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/8">
                      <motion.span
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        className="block h-full rounded-full"
                        style={{ backgroundColor: "var(--marigold)" }}
                      />
                    </span>
                    <span className="w-6 shrink-0 text-right font-data text-2xs text-muted-foreground">
                      {n}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        {/* filters */}
        {data?.count ? (
          <ul className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mt-10 sm:flex-wrap sm:overflow-visible sm:px-0">
            {FILTERS.map(({ id, label }) => {
              const count = (data.reviews ?? []).filter((r) => matches(r, id)).length;
              if (!count) return null;
              const active = filter === id;
              return (
                <li key={id} className="shrink-0">
                  <button
                    type="button"
                    data-cursor="link"
                    onClick={() => {
                      setFilter(id);
                      setShown(PAGE);
                    }}
                    aria-pressed={active}
                    className={cn(
                      "min-h-10 whitespace-nowrap rounded-full border px-4 py-2 font-data text-2xs transition-colors",

                      active
                        ? "border-transparent bg-madder text-primary-foreground"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label} <span className="opacity-60">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="mt-8">
          {isError ? (
            <DataError error={error} retry={() => void refetch()} title="Reviews didn't load" />
          ) : isPending ? (
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3" aria-hidden>
              {["h-56", "h-80", "h-44", "h-72", "h-52", "h-[21rem]"].map((h, i) => (
                <CardSkeleton key={i} className={cn("mb-5 w-full", h)} />
              ))}
            </div>
          ) : (
            <>
              <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
                <AnimatePresence initial={false}>
                  {visible.map((review, i) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      index={i}
                      onOpenPhoto={(photos, index, caption) =>
                        setLightbox({ photos, index, caption })
                      }
                    />
                  ))}
                </AnimatePresence>
              </div>

              {filtered.length > PAGE ? (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    data-cursor="link"
                    onClick={() => setShown(expanded ? PAGE : shown + PAGE)}
                    className="sheen inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-data text-2xs text-foreground transition-colors hover:border-madder/60"
                  >
                    {expanded
                      ? "Show less"
                      : `See ${Math.min(remaining, PAGE)} more review${Math.min(remaining, PAGE) === 1 ? "" : "s"}`}
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
                      aria-hidden
                    />
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      <ReviewLightbox
        photos={lightbox?.photos ?? []}
        index={lightbox ? lightbox.index : null}
        caption={lightbox?.caption ?? null}
        onClose={() => setLightbox(null)}
        onIndexChange={(index) => setLightbox((s) => (s ? { ...s, index } : s))}
      />
    </section>
  );
}
