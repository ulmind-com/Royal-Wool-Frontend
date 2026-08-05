import { useState } from "react";
import { BellRing, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import { joinWaitlist } from "@/lib/api/catalog-extras";
import { useAuthStore } from "@/store/auth-store";

/**
 * Sold-out shade → restock waitlist. This is what fills the admin's
 * Restock Waitlist screen, so it has to be the sold-out call to action.
 */
export function RestockNotify({
  productId,
  colorName,
}: {
  productId: string;
  colorName?: string | null;
}) {
  const { isAuthenticated, setLoginModalOpen } = useAuthStore();
  const [state, setState] = useState<"idle" | "busy" | "joined">("idle");

  const join = async () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    setState("busy");
    try {
      const res = await joinWaitlist(productId, colorName);
      setState("joined");
      toast.success(
        res.message === "Already on waitlist"
          ? "You're already on the list for this shade."
          : "We'll message you the moment it's back 🔔",
      );
    } catch (err) {
      setState("idle");
      toast.error(err instanceof ApiError ? err.message : "Couldn't add you to the list.");
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-border p-4">
      <p className="font-data text-2xs uppercase tracking-wider text-madder">
        Sold out in this combination
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {colorName ? `${colorName} is` : "This shade is"} between dye lots. Join the restock list
        and we'll tell you first.
      </p>
      <button
        type="button"
        onClick={join}
        disabled={state !== "idle"}
        className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-madder px-4 py-2 font-data text-2xs text-madder transition-colors hover:bg-madder hover:text-primary-foreground disabled:opacity-60"
      >
        {state === "busy" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : state === "joined" ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <BellRing className="h-3.5 w-3.5" />
        )}
        {state === "joined" ? "You're on the list" : "Notify me when it's back"}
      </button>
    </div>
  );
}
