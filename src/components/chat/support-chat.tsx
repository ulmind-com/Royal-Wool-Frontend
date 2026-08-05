import { useEffect, useRef, useState } from "react";
import { Headset, Loader2, Send, Sparkles, X } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { type ChatMessage, chatSuggestions, sendChat } from "@/lib/api/chat";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

/**
 * Cleo — support for ONE order. Every request carries that order's id, so the
 * agent answers about this parcel and its cancel / return tools act on it.
 * Mount it on an order card or the confirmation screen, never globally.
 */
export function OrderSupportChat({
  orderId,
  orderLabel,
  className,
}: {
  orderId: string;
  orderLabel?: string;
  className?: string;
}) {
  const { user, isAuthenticated, setLoginModalOpen } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggestions are order-aware: "Cancel this order" only shows when it can be.
  useEffect(() => {
    if (!open || !isAuthenticated) return;
    chatSuggestions(orderId)
      .then((r) => setPrompts(r.questions ?? []))
      .catch(() => setPrompts([]));
  }, [open, isAuthenticated, orderId]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, open]);

  const ask = async (text: string) => {
    const content = text.trim();
    if (!content || thinking) return;

    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setDraft("");
    setThinking(true);
    try {
      const { reply } = await sendChat(next, orderId);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            err instanceof ApiError && err.isOffline
              ? "I'm having trouble reaching the studio right now — try again in a moment."
              : "Something went wrong on my side. Please try again, or reach us on WhatsApp.",
        },
      ]);
    } finally {
      setThinking(false);
      inputRef.current?.focus();
    }
  };

  const launch = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    setOpen((v) => !v);
  };

  const tag = orderLabel ?? `#${orderId.slice(-8).toUpperCase()}`;

  return (
    <>
      <button
        type="button"
        onClick={launch}
        data-cursor="link"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-madder/40 px-3 py-1.5 text-xs font-medium text-madder transition-colors hover:bg-madder hover:text-white",
          className,
        )}
      >
        <Headset className="h-3.5 w-3.5" />
        Need help with this order?
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close support chat"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[99994] cursor-default bg-black/30 backdrop-blur-[2px] sm:bg-black/10 sm:backdrop-blur-0"
          />

          {/* Mobile: a sheet that clears the floating bottom nav. Desktop: a corner panel. */}
          <div
            role="dialog"
            aria-label={`Support chat for order ${tag}`}
            className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+5.25rem)] z-[99995] flex h-[min(30rem,60vh)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[0_28px_70px_-30px_rgba(13,10,18,0.75)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(32rem,78vh)] sm:w-[23rem]"
          >
            <header className="flex items-start gap-2.5 border-b border-border px-4 py-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-madder/10 text-madder">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Cleo</p>
                <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                  Helping with order {tag}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="rounded-xl border border-border p-3">
                  <p className="text-xs leading-relaxed text-foreground">
                    Hi {user?.name?.split(" ")[0] || "there"} — I'm looking at order {tag}. I can
                    track it, cancel it, or start a return. What do you need?
                  </p>
                </div>
              ) : null}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-madder text-white"
                      : "border border-border text-foreground",
                  )}
                >
                  {m.content}
                </div>
              ))}

              {thinking ? (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-border px-3.5 py-2.5 text-[11px] text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cleo is typing…
                </div>
              ) : null}
            </div>

            {prompts.length > 0 && messages.length === 0 ? (
              <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-2.5">
                {prompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => ask(p)}
                    className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-madder hover:text-madder"
                  >
                    {p}
                  </button>
                ))}
              </div>
            ) : null}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(draft);
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about this order…"
                className="min-w-0 flex-1 rounded-full border border-border bg-transparent px-3.5 py-2 text-base sm:text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-marigold"
              />
              <button
                type="submit"
                disabled={thinking || !draft.trim()}
                aria-label="Send message"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-madder text-white transition-opacity disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      ) : null}
    </>
  );
}
