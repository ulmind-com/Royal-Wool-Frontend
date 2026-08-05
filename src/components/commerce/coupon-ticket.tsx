import { Check, Copy, Lock, Tag } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Compact ticket-style coupon card — a stub on the left carrying the saving,
 * a perforation, then the code and terms. Deliberately small: it reads as a
 * real tear-off voucher without taking over the layout.
 */
export function CouponTicket({
  code,
  headline,
  description,
  terms,
  locked = false,
  applied = false,
  actionLabel,
  onAction,
  copyable = false,
  className,
}: {
  code: string;
  headline: string;
  description?: string | undefined;
  terms?: string | undefined;
  locked?: boolean | undefined;
  applied?: boolean | undefined;
  actionLabel?: string | undefined;
  onAction?: () => void | undefined;
  copyable?: boolean | undefined;
  className?: string | undefined;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-stretch overflow-hidden rounded-xl border transition-colors",
        applied
          ? "border-marigold bg-marigold/[0.07]"
          : locked
            ? "border-border/70 bg-transparent"
            : "border-border bg-transparent hover:border-marigold",
        className,
      )}
    >
      {/* stub */}
      <div
        className={cn(
          "flex w-[4.75rem] shrink-0 flex-col items-center justify-center gap-0.5 px-2 py-2.5",
          locked ? "text-muted-foreground/70" : "text-marigold",
        )}
        style={{ background: "color-mix(in oklab, var(--ink) 4%, transparent)" }}
      >
        {locked ? <Lock className="h-3 w-3" aria-hidden /> : <Tag className="h-3 w-3" aria-hidden />}
        <span className="font-display text-sm leading-none tracking-tight">{headline}</span>
      </div>

      {/* perforation */}
      <div className="relative w-px shrink-0" aria-hidden>
        <div
          className="absolute inset-y-1.5 left-0 w-px border-l border-dashed"
          style={{ borderColor: "color-mix(in oklab, var(--ink) 24%, transparent)" }}
        />
        <span className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full bg-background" />
        <span className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full bg-background" />
      </div>

      {/* body */}
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate font-data text-2xs uppercase tracking-[0.14em] text-foreground">
            {code}
          </p>
          {description ? (
            <p className="mt-0.5 truncate text-2xs text-muted-foreground">{description}</p>
          ) : null}
          {terms ? (
            <p className="mt-0.5 truncate font-data text-2xs text-muted-foreground/70">{terms}</p>
          ) : null}
        </div>

        {copyable ? (
          <button
            type="button"
            onClick={() => void copy()}
            data-cursor="link"
            aria-label={`Copy coupon code ${code}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-data text-2xs text-foreground transition-colors hover:border-marigold hover:text-marigold"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        ) : actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            disabled={locked}
            data-cursor="link"
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 font-data text-2xs transition-colors",
              applied
                ? "text-marigold"
                : locked
                  ? "text-muted-foreground/60"
                  : "border border-marigold text-marigold hover:bg-marigold hover:text-ink",
            )}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
