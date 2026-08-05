import { useEffect, useMemo, useState } from "react";
import { Loader2, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";

import { useSettings } from "@/hooks/use-settings";
import { ApiError } from "@/lib/api/client";
import { cancelOrder } from "@/lib/api/orders";
import { createReturn } from "@/lib/api/returns";
import { cn } from "@/lib/utils";

/**
 * Self-service actions on one order: cancel while the window is open, or start
 * a return once it is delivered. The window is capped at ten minutes so the
 * countdown never promises longer than the studio can actually hold a parcel.
 */

const CANCEL_MINUTES = 10;
const CANCELLABLE = ["placed", "confirmed"];

interface OrderLike {
  status: string;
  created_at?: string;
  delivered_at?: string;
  items?: Array<{ product_id?: string; title?: string; qty?: number; color?: string; size?: string }>;
}

export function OrderActions({
  orderId,
  order,
  onChanged,
}: {
  orderId: string;
  order: OrderLike;
  onChanged: () => void;
}) {
  const { cancelWindowHours, returnWindowDays } = useSettings();

  // Never offer more time than the admin allows, and never more than ten minutes.
  const windowMs = useMemo(() => {
    const adminMs = (cancelWindowHours ?? 0) * 3600_000;
    if (adminMs <= 0) return 0;
    return Math.min(adminMs, CANCEL_MINUTES * 60_000);
  }, [cancelWindowHours]);

  const placedAt = order.created_at ? new Date(order.created_at).getTime() : 0;
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  const cancellable = CANCELLABLE.includes(order.status) && windowMs > 0 && placedAt > 0;
  const msLeft = cancellable ? Math.max(0, placedAt + windowMs - now) : 0;

  // Tick only while a countdown is actually on screen.
  useEffect(() => {
    if (!cancellable || msLeft <= 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [cancellable, msLeft]);

  const handleCancel = async () => {
    if (!window.confirm("Cancel this order? Any online payment is refunded automatically.")) return;
    setBusy(true);
    try {
      const res = await cancelOrder(orderId);
      toast.success(
        res.refund ? "Order cancelled — refund initiated." : "Order cancelled.",
      );
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't cancel this order.");
    } finally {
      setBusy(false);
    }
  };

  const returnable = order.status === "delivered" && (returnWindowDays ?? 0) > 0;

  if (!cancellable && !returnable) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {cancellable && msLeft > 0 ? (
        <button
          type="button"
          onClick={handleCancel}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-madder/40 px-3 py-1.5 text-xs font-medium text-madder transition-colors hover:bg-madder hover:text-white disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
          Cancel · {formatLeft(msLeft)}
        </button>
      ) : null}

      {returnable ? (
        <button
          type="button"
          onClick={() => setReturnOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-marigold hover:text-marigold"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Return / exchange
        </button>
      ) : null}

      {returnOpen ? (
        <ReturnDialog
          orderId={orderId}
          items={order.items ?? []}
          onClose={() => setReturnOpen(false)}
          onDone={() => {
            setReturnOpen(false);
            onChanged();
          }}
        />
      ) : null}
    </div>
  );
}

function formatLeft(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")} left`;
}

function ReturnDialog({
  orderId,
  items,
  onClose,
  onDone,
}: {
  orderId: string;
  items: OrderLike["items"] & object;
  onClose: () => void;
  onDone: () => void;
}) {
  const [picked, setPicked] = useState<number[]>([0]);
  const [type, setType] = useState<"refund" | "exchange">("refund");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!reason.trim()) {
      toast.error("Please tell us why you're returning this.");
      return;
    }
    if (picked.length === 0) {
      toast.error("Select at least one item.");
      return;
    }
    setBusy(true);
    try {
      await createReturn({
        order_id: orderId,
        type,
        reason: reason.trim(),
        note: note.trim(),
        items: picked.map((i) => ({
          product_id: String(items[i]?.product_id ?? ""),
          qty: Number(items[i]?.qty ?? 1),
          color: items[i]?.color ?? null,
          size: items[i]?.size ?? null,
        })),
      });
      toast.success("Return requested — we'll review it shortly.");
      onDone();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't file that return.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 z-[99994] cursor-default bg-black/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-label="Return or exchange"
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] z-[99995] max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-background p-4 shadow-xl sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[26rem] sm:-translate-x-1/2 sm:-translate-y-1/2"
      >
        <h3 className="font-display text-lg font-light text-foreground">Return or exchange</h3>
        <p className="mt-1 text-2xs text-muted-foreground">
          Pick the items, tell us why, and we'll arrange a pickup.
        </p>

        <ul className="mt-4 space-y-2">
          {items.map((it, i) => (
            <li key={i}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border p-2.5 text-xs">
                <input
                  type="checkbox"
                  checked={picked.includes(i)}
                  onChange={(e) =>
                    setPicked((p) => (e.target.checked ? [...p, i] : p.filter((x) => x !== i)))
                  }
                  className="h-4 w-4 accent-[var(--madder)]"
                />
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {it.title ?? "Item"}{" "}
                  <span className="text-muted-foreground">
                    × {it.qty ?? 1}
                    {it.color ? ` · ${it.color}` : ""}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex gap-2">
          {(["refund", "exchange"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "flex-1 rounded-full border px-3 py-2 text-xs capitalize transition-colors",
                type === t
                  ? "border-madder bg-madder text-white"
                  : "border-border text-muted-foreground hover:border-madder/50",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (e.g. wrong shade)"
          className="mt-3 w-full rounded-xl border border-border bg-transparent px-3.5 py-2.5 text-base text-foreground outline-none focus:border-marigold sm:text-sm"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={type === "exchange" ? "Which shade or size instead?" : "Anything else? (optional)"}
          className="mt-2 w-full rounded-xl border border-border bg-transparent px-3.5 py-2.5 text-base text-foreground outline-none focus:border-marigold sm:text-sm"
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-border px-4 py-2.5 text-xs text-muted-foreground"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="sheen inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-madder px-4 py-2.5 text-xs text-white disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Submit request
          </button>
        </div>
      </div>
    </>
  );
}
