import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/** Five-star row. Half stars are rounded — the API gives integers per review. */
export function RatingStars({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i - 0.25;
        return (
          <Star
            key={i}
            style={{ width: size, height: size }}
            strokeWidth={1.5}
            className={filled ? "fill-marigold text-marigold" : "text-border"}
            aria-hidden
          />
        );
      })}
    </span>
  );
}
