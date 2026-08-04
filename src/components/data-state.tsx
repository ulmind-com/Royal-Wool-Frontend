import { AlertTriangle } from "lucide-react";

import { Glass } from "@/components/ui/glass";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { waGeneral } from "@/lib/whatsapp";

/** Human-readable reason for a failed read, without leaking server internals. */
export function describeApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isOffline) return "Our store server is waking up and didn't answer in time.";
    if (error.isNotFound) return "We couldn't find that.";
    if (error.status === 401 || error.status === 403) return "Please sign in to see this.";
    return "Our store server returned an error.";
  }
  return "Something went wrong loading this.";
}

export function DataError({
  error,
  retry,
  className,
  title = "Couldn't load this",
}: {
  error?: unknown;
  retry?: () => void;
  className?: string;
  title?: string;
}) {
  return (
    <Glass variant="panel" className={cn("max-w-xl", className)} role="alert">
      <AlertTriangle className="h-5 w-5 text-marigold" aria-hidden />
      <p className="mt-3 font-display text-2xl font-light">{title}</p>
      <p className="mt-2 text-muted-foreground">{describeApiError(error)}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {retry ? (
          <button
            type="button"
            onClick={retry}
            data-cursor="link"
            className="sheen inline-flex items-center rounded-full bg-madder px-5 py-2.5 font-data text-2xs text-primary-foreground"
          >
            Try again
          </button>
        ) : null}
        <a
          href={waGeneral()}
          target="_blank"
          rel="noopener"
          data-cursor="link"
          className="inline-flex items-center rounded-full border border-border px-5 py-2.5 font-data text-2xs"
        >
          Ask us on WhatsApp
        </a>
      </div>
    </Glass>
  );
}

/** Product-card sized skeleton; matches the real card box so nothing shifts. */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl border border-border", className)}
      style={{
        backgroundImage:
          "linear-gradient(135deg, color-mix(in oklab, var(--foreground) 7%, transparent), color-mix(in oklab, var(--foreground) 2%, transparent))",
      }}
      aria-hidden
    />
  );
}

export function GridSkeleton({
  count = 4,
  ratio = "aspect-[3/4]",
}: {
  count?: number;
  ratio?: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} className={ratio} />
      ))}
    </div>
  );
}

export function EmptyState({ title, note }: { title: string; note: string }) {
  return (
    <Glass variant="panel" className="max-w-xl">
      <p className="font-display text-2xl font-light">{title}</p>
      <p className="mt-2 text-muted-foreground">{note}</p>
    </Glass>
  );
}
