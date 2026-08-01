import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useMemo } from "react";

import { ProductRail } from "@/components/commerce/product-rail";
import { DataError } from "@/components/data-state";
import { useReducedMotion } from "@/hooks/use-motion";
import { productsQuery } from "@/lib/api/queries";
import { primaryImage } from "@/lib/api/types";
import { NEW_ARRIVAL_FALLBACKS } from "@/data/new-arrival-gallery";

import type { CircularGalleryItem } from "@/components/commerce/circular-gallery";

// ogl touches WebGL at import time, so the gallery only loads in the browser.
const CircularGallery = lazy(() => import("@/components/commerce/circular-gallery"));

/**
 * Backend still holds the old clothing catalogue, so the gallery shows the
 * client's own yarn photos for now. Flip to false once /products returns real
 * wool products and the API images (admin-managed) take over automatically.
 */
const PREFER_LOCAL_IMAGES = true;

export function NewArrivalsGallery() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { data, isPending, isError, error, refetch } = useQuery(
    productsQuery({ sort: "newest", limit: 12 }),
  );

  const items = useMemo<CircularGalleryItem[]>(() => {
    const products = data ?? [];
    if (!PREFER_LOCAL_IMAGES) {
      return products
        .map((p) => ({ image: primaryImage(p) ?? "", text: p.title, href: `/product/${p.id}` }))
        .filter((i) => i.image);
    }
    // Local yarn photos, but titles/links still come from the live catalogue
    // whenever products exist, so a tap opens a real product page.
    return NEW_ARRIVAL_FALLBACKS.map((fallback, i) => {
      const product = products[i % Math.max(products.length, 1)];
      return {
        image: fallback.image,
        text: fallback.text,
        href: product ? `/product/${product.id}` : "/collections",
      };
    });
  }, [data]);

  if (isError) {
    return (
      <section className="mt-20" aria-label="New arrivals">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
          <DataError error={error} retry={() => void refetch()} title="This shelf didn't load" />
        </div>
      </section>
    );
  }

  // Reduced motion: keep the plain rail instead of a WebGL scene.
  if (reduced) {
    return (
      <ProductRail
        anchor="sections"
        eyebrow="03 · Fresh off the winder"
        title="New arrivals"
        note="The latest shades to leave the dye house."
        filters={{ sort: "newest" }}
      />
    );
  }

  return (
    <section data-thread-anchor="sections" className="mt-20" aria-label="New arrivals">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-data text-2xs text-marigold">03 · Fresh off the winder</p>
            <h2 className="mt-3 font-display text-4xl font-light text-foreground">New arrivals</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Drag, scroll or use the arrow keys — tap a skein to open it.
            </p>
          </div>
          <Link
            to="/collections"
            data-cursor="link"
            className="rounded-full border border-border px-5 py-2.5 font-data text-2xs text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>
      </div>

      <div className="relative mt-6 h-[420px] w-full sm:h-[480px] lg:h-[560px]">
        {isPending ? (
          <div
            className="mx-auto h-full w-full max-w-[1600px] animate-pulse rounded-3xl border border-border/60"
            aria-hidden
          />
        ) : (
          <Suspense fallback={<div className="h-full w-full" aria-hidden />}>
            <CircularGallery
              items={items}
              bend={3}
              borderRadius={0.05}
              scrollEase={0.02}
              textColor="#0D0A12"
              font="600 26px Inter, system-ui, sans-serif"
              ariaLabel="New arrivals gallery — drag to browse, tap to open a product"
              onItemClick={(index) => {
                const href = items[index]?.href;
                if (!href) return;
                if (href.startsWith("/product/")) {
                  void navigate({
                    to: "/product/$id",
                    params: { id: href.replace("/product/", "") },
                  });
                } else {
                  void navigate({ to: "/collections" });
                }
              }}
            />
          </Suspense>
        )}
      </div>
    </section>
  );
}
