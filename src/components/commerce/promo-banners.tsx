import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { bannersQuery } from "@/lib/api/catalog-extras";

/**
 * The promotional banners the admin uploads. Horizontally scrollable so a row
 * of 2.4:1 artwork works on a phone without squashing anything.
 */
export function PromoBanners() {
  const { data } = useQuery(bannersQuery);
  const banners = data ?? [];
  if (banners.length === 0) return null;

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast.success(`Code ${code} copied`);
  };

  return (
    <section aria-label="Offers" className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-10">
      <ul className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {banners.map((b) => (
          <li
            key={b.id}
            className="relative w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl border border-border sm:w-[48%] lg:w-[32%]"
          >
            <img
              src={b.image}
              alt={b.title || "Offer"}
              loading="lazy"
              className="aspect-[2.4/1] w-full object-cover"
            />
            {b.title || b.subtitle || b.code ? (
              <div
                className="absolute inset-x-0 bottom-0 p-3 sm:p-4"
                style={{
                  backgroundImage:
                    "linear-gradient(to top, color-mix(in oklab, var(--ink) 88%, transparent), transparent)",
                }}
              >
                {b.title ? (
                  <p className="truncate font-display text-base font-light text-fleece">{b.title}</p>
                ) : null}
                {b.subtitle ? (
                  <p className="truncate font-data text-2xs text-fleece/70">{b.subtitle}</p>
                ) : null}
                {b.code ? (
                  <button
                    type="button"
                    onClick={() => copy(b.code!)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-fleece/30 bg-fleece/10 px-2.5 py-1 font-data text-2xs uppercase tracking-wider text-fleece backdrop-blur-sm"
                  >
                    {b.code} <Copy className="h-3 w-3" />
                  </button>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
