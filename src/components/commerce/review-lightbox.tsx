import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect } from "react";

/** Minimal photo viewer for customer review images. Esc / arrows supported. */
export function ReviewLightbox({
  photos,
  index,
  onClose,
  onIndexChange,
  caption,
}: {
  photos: string[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
  caption?: string | null;
}) {
  const open = index !== null && photos.length > 0;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + photos.length) % photos.length);
    },
    [index, onIndexChange, photos.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, step]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ backgroundColor: "color-mix(in oklab, var(--ink) 78%, transparent)" }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Customer photo"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-cursor="link"
            className="absolute right-5 top-5 rounded-full border border-border/40 bg-background/90 p-2 text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          {photos.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                data-cursor="link"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-3 rounded-full border border-border/40 bg-background/90 p-2 text-foreground sm:left-8"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                data-cursor="link"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-3 rounded-full border border-border/40 bg-background/90 p-2 text-foreground sm:right-8"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
              </button>
            </>
          ) : null}

          <motion.figure
            key={index}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[86vh] max-w-[92vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[index!]}
              alt={caption ?? "Customer review photo"}
              className="max-h-[78vh] rounded-2xl object-contain"
            />
            {caption ? (
              <figcaption className="mt-3 text-center font-data text-2xs text-primary-foreground">
                {caption}
              </figcaption>
            ) : null}
          </motion.figure>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
