import { useEffect, useState } from "react";

import { waGeneral } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/**
 * Floating WhatsApp action button.
 * Bottom-right stack reserves space so the AI chat launcher (Phase 7) sits
 * below it and the cart drawer never overlaps either.
 */
export function WhatsAppFab() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bottom-[calc(env(safe-area-inset-bottom,0px)+6.25rem)] md:bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] pointer-events-none fixed right-4 z-40 flex flex-col items-end gap-4 sm:right-6">
      <a
        href={waGeneral()}
        target="_blank"
        rel="noopener"
        aria-label="Chat with Royal Wool on WhatsApp"
        data-cursor="link"
        className={cn(
          "breathe group pointer-events-auto grid h-14 w-14 place-items-center rounded-full transition-all duration-[var(--dur-standard)] ease-[var(--ease-enter)]",
          shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
        )}
        style={{
          // Official WhatsApp brand green — solid, not glass, so the mark stays legible.
          backgroundColor: "#25D366",
          boxShadow: "0 18px 40px -16px rgba(37, 211, 102, 0.65), 0 2px 8px rgba(0, 0, 0, 0.18)",
        }}
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white" aria-hidden>
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m0 1.67c4.55 0 8.24 3.7 8.24 8.24s-3.69 8.24-8.24 8.24c-1.5 0-2.96-.4-4.24-1.17l-.3-.18-3.12.82.83-3.04-.19-.31a8.2 8.2 0 0 1-1.25-4.36c0-4.55 3.7-8.24 8.27-8.24m-3.4 4.2c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.34.99 2.5c.12.16 1.68 2.68 4.15 3.65 2.05.81 2.47.65 2.91.61.44-.04 1.43-.58 1.63-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28-.24-.12-1.43-.7-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.8-.76.96-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.38-.4-.53-.4z" />
        </svg>
        <span
          className="absolute right-16 whitespace-nowrap rounded-full border border-border px-3 py-1.5 font-data text-2xs text-foreground opacity-0 transition-opacity duration-[var(--dur-micro)] group-hover:opacity-100"
          style={{ backgroundColor: "color-mix(in oklab, var(--ink) 80%, transparent)" }}
        >
          Chat with us
        </span>
      </a>
    </div>
  );
}
