import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RotateCcw } from "lucide-react";

import { useSettings } from "@/hooks/use-settings";
import { RETURN_STATUS_COPY, myReturns } from "@/lib/api/returns";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/account/returns")({
  head: () => ({
    meta: [
      { title: "Returns & exchanges — Royal Wool" },
      { name: "description", content: "Track your Royal Wool return and exchange requests." },
      { property: "og:title", content: "Returns & exchanges — Royal Wool" },
      { property: "og:description", content: "Track your returns and exchanges." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReturnsPage,
});

const DONE = ["refunded", "exchanged", "rejected"];

function ReturnsPage() {
  const { isAuthenticated, setLoginModalOpen } = useAuthStore();
  const { formatMoney, returnWindowDays } = useSettings();

  const { data, isPending } = useQuery({
    queryKey: ["returns"],
    queryFn: myReturns,
    enabled: isAuthenticated,
    // Admin moves these along, so keep the list fresh without a reload.
    refetchInterval: 30_000,
    retry: 1,
  });

  const returns = data ?? [];

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 pb-24 pt-8 sm:px-6">
      <header className="border-b border-border pb-5">
        <p className="font-data text-2xs uppercase tracking-[0.2em] text-marigold">Returns</p>
        <h1 className="mt-1.5 font-display text-3xl font-light text-foreground sm:text-4xl">
          Returns & exchanges
        </h1>
        <p className="mt-2 font-data text-2xs text-muted-foreground">
          {returnWindowDays
            ? `Delivered orders can be returned within ${returnWindowDays} days.`
            : "All sales are final — we don't accept returns or exchanges."}
        </p>
      </header>

      {!isAuthenticated ? (
        <Empty
          title="Sign in to see your returns"
          action={
            <button
              type="button"
              onClick={() => setLoginModalOpen(true)}
              className="sheen rounded-full bg-madder px-6 py-3 font-data text-2xs text-primary-foreground"
            >
              Sign in
            </button>
          }
        />
      ) : isPending ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-marigold" />
        </div>
      ) : returns.length === 0 ? (
        <Empty
          title={returnWindowDays ? "No returns yet" : "Returns aren't offered"}
          action={
            <Link
              to="/account/orders"
              className="sheen rounded-full bg-madder px-6 py-3 font-data text-2xs text-primary-foreground"
            >
              Go to my orders
            </Link>
          }
        />
      ) : (
        <ul className="mt-8 space-y-4">
          {returns.map((r, i) => {
            const rid = String(r.id ?? r._id ?? i);
            const done = DONE.includes(r.status);
            return (
              <li key={rid} className="rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="min-w-0">
                    <p className="font-data text-2xs text-muted-foreground">
                      Order #{r.order_id.slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 font-display text-base font-light capitalize text-foreground">
                      {r.type === "exchange" ? "Exchange" : "Refund"} request
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 font-data text-2xs",
                      done
                        ? "bg-indigo/10 text-indigo"
                        : r.status === "rejected"
                          ? "bg-madder/10 text-madder"
                          : "bg-marigold/15 text-marigold",
                    )}
                  >
                    {RETURN_STATUS_COPY[r.status] ?? r.status}
                  </span>
                </div>

                <ul className="mt-3 space-y-2">
                  {(r.items ?? []).map((it, j) => (
                    <li key={j} className="flex items-center justify-between gap-3 text-xs">
                      <span className="min-w-0 truncate text-foreground">
                        {it.title ?? "Item"}{" "}
                        <span className="text-muted-foreground">× {it.qty}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 font-data text-2xs">
                  <span className="text-muted-foreground">Reason: {r.reason || "—"}</span>
                  {r.amount ? (
                    <span className="text-foreground">{formatMoney(r.amount)}</span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Empty({ title, action }: { title: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-border text-marigold">
        <RotateCcw className="h-6 w-6" />
      </div>
      <h2 className="mt-5 font-display text-xl font-light text-foreground">{title}</h2>
      <div className="mt-6">{action}</div>
    </div>
  );
}
