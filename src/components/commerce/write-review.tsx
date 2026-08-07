import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, PenLine, Star } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import { canReviewQuery, postReview } from "@/lib/api/reviews";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

/**
 * Review composer. The backend only accepts a review from someone whose order
 * for this product was delivered, so the form appears only when it will be
 * accepted — /reviews/can-review is the gate.
 */
export function WriteReview({ productId, title }: { productId: string; title: string }) {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data } = useQuery({ ...canReviewQuery(productId), enabled: isAuthenticated });

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [heading, setHeading] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isAuthenticated || !data?.can) return null;

  const submit = async () => {
    if (rating < 1) {
      toast.error("Pick a star rating first.");
      return;
    }
    setBusy(true);
    try {
      await postReview({
        product_id: productId,
        rating,
        title: heading.trim(),
        text: text.trim(),
      });
      toast.success("Thanks — your review is live");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't post that review.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto mt-16 w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
      <div className="rounded-2xl border border-border p-4 sm:p-5">
        {!open ? (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-light text-foreground">
                You've knitted with this one
              </h2>
              <p className="mt-1 font-data text-2xs text-muted-foreground">
                Tell other crafters how {title} behaved on your needles.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="sheen inline-flex w-full items-center justify-center gap-2 rounded-full bg-madder px-5 py-2.5 font-data text-2xs text-primary-foreground sm:w-auto"
            >
              <PenLine className="h-3.5 w-3.5" /> Write a review
            </button>
          </div>
        ) : (
          <div>
            <h2 className="font-display text-lg font-light text-foreground">Write a review</h2>

            <div className="mt-3 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      (hover || rating) >= n
                        ? "fill-marigold text-marigold"
                        : "text-muted-foreground/40",
                    )}
                  />
                </button>
              ))}
            </div>

            <input
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="A short headline"
              maxLength={80}
              className="mt-3 w-full rounded-xl border border-border bg-transparent px-3.5 py-2.5 text-base text-foreground outline-none focus:border-marigold sm:text-sm"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Stitch definition, softness, how it washed…"
              className="mt-2 w-full resize-y rounded-xl border border-border bg-transparent px-3.5 py-2.5 text-base text-foreground outline-none focus:border-marigold sm:text-sm"
            />

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border px-5 py-2.5 font-data text-2xs text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="sheen inline-flex items-center gap-2 rounded-full bg-madder px-5 py-2.5 font-data text-2xs text-primary-foreground disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Post review
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
