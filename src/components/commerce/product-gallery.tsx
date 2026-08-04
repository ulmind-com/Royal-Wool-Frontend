import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { resolveMedia } from "@/components/commerce/review-card";
import { cn } from "@/lib/utils";

/**
 * Product gallery: vertical thumbnail rail plus a large sticky frame on desktop,
 * swipeable single-image carousel on mobile. Images are whatever the admin
 * uploaded for the product or the selected shade.
 */
export function ProductGallery({
  images,
  title,
  index,
  onIndex,
  footer,
}: {
  images: string[];
  title: string;
  index: number;
  onIndex: (i: number) => void;
  /** Rendered directly under the main image frame, matching its width (md+). */
  footer?: React.ReactNode;
}) {
  const scroller = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const safe = images.length ? Math.min(index, images.length - 1) : 0;
  const hero = resolveMedia(images[safe] ?? null);

  // Keep the mobile scroller in sync when a shade swap resets the index.
  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    node.scrollTo({ left: node.clientWidth * safe, behavior: "smooth" });
  }, [safe]);

  const step = (delta: number) => {
    if (!images.length) return;
    onIndex((safe + delta + images.length) % images.length);
  };

  return (
    <div
      className={cn(
        "md:grid md:gap-4",
        images.length > 1 ? "md:grid-cols-[76px_minmax(0,1fr)]" : "md:grid-cols-1",
      )}
    >
      {/* Desktop thumbnail rail */}
      {images.length > 1 ? (
        <ul className="hidden max-h-[380px] flex-col gap-2.5 overflow-y-auto pr-1 md:flex">
          {images.map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type="button"
                onClick={() => onIndex(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === safe}
                data-cursor="link"
                className={cn(
                  "h-[68px] w-[68px] overflow-hidden rounded-lg border bg-card transition-all",
                  i === safe
                    ? "border-foreground ring-1 ring-foreground"
                    : "border-border/70 hover:border-foreground/60",
                )}
              >
                <img
                  src={resolveMedia(src) ?? src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="md:mx-auto md:w-full md:max-w-[400px]">
        {/* Desktop frame with cursor zoom */}
        <div className="group relative mx-auto hidden md:block">
          <div
            className="relative aspect-square max-h-[380px] overflow-hidden rounded-2xl"
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
            onPointerLeave={() => setZoom(null)}
          >
            {hero ? (
              <img
                src={hero}
                alt={title}
                decoding="async"
                className="aspect-square w-full object-contain transition-transform duration-[var(--dur-slow)] ease-[var(--ease-enter)]"
                style={
                  zoom
                    ? { transform: "scale(1.7)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                    : undefined
                }
              />
            ) : (
              <div
                className="aspect-square w-full"
                style={{ backgroundImage: "var(--dye-flow)", opacity: 0.35 }}
                aria-hidden
              />
            )}
          </div>

          {images.length > 1 ? (
            <>
              <GalleryArrow side="left" onClick={() => step(-1)} />
              <GalleryArrow side="right" onClick={() => step(1)} />
            </>
          ) : null}
        </div>

        {/* Mobile swipe carousel */}
        <div className="md:hidden">
          <div
            ref={scroller}
            className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl border border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onScroll={(e) => {
              const el = e.currentTarget;
              const next = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
              if (next !== safe) onIndex(next);
            }}
          >
            {(images.length ? images : [""]).map((src, i) => (
              <div key={`${src}-${i}`} className="w-full shrink-0 snap-center">
                {src ? (
                  <img
                    src={resolveMedia(src) ?? src}
                    alt={title}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div
                    className="aspect-square w-full"
                    style={{ backgroundImage: "var(--dye-flow)", opacity: 0.35 }}
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>

          {images.length > 1 ? (
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {images.map((src, i) => (
                <span
                  key={`${src}-dot-${i}`}
                  aria-hidden
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === safe ? "w-5 bg-madder" : "w-1.5 bg-border",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>

        {footer ? <div className="hidden md:block">{footer}</div> : null}
      </div>
    </div>
  );
}

function GalleryArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      data-cursor="link"
      className={cn(
        "absolute top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center text-foreground/50 transition-colors hover:text-foreground",
        side === "left" ? "-left-14" : "-right-14",
      )}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}
