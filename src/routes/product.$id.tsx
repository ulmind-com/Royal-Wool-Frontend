import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { DataError } from "@/components/data-state";
import { Glass } from "@/components/ui/glass";
import { useSettings } from "@/hooks/use-settings";
import { productQuery } from "@/lib/api/queries";
import {
  type ProductColor,
  type ProductSize,
  primaryImage,
  variantPrice,
  variantStock,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { waAskAboutProduct } from "@/lib/whatsapp";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Yarn detail — Royal Wool` },
      {
        name: "description",
        content:
          "Colour swatches, weight, gauge, stock and reviews for this Royal Wool yarn, with a 3D yarn-ball viewer.",
      },
      { property: "og:title", content: "Yarn detail — Royal Wool" },
      { property: "og:description", content: "Colour, gauge, stock and reviews for this yarn." },
      { property: "og:url", content: `/product/${params.id}` },
    ],
    links: [{ rel: "canonical", href: `/product/${params.id}` }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { formatMoney, returnWindowDays } = useSettings();
  const { data: product, isPending, isError, error, refetch } = useQuery(productQuery(id));

  const [colorName, setColorName] = useState<string | null>(null);
  const [sizeName, setSizeName] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const colors = product?.colors ?? [];
  const color: ProductColor | undefined =
    colors.find((c) => c.name === colorName) ?? colors[0];
  const sizes = color?.sizes ?? [];
  const size: ProductSize | undefined = sizes.find((s) => s.size === sizeName) ?? sizes[0];

  // Every price on this page comes from the server-resolved variant matrix.
  const price = product ? variantPrice(product, color, size) : 0;
  const stock = variantStock(color, size);
  const gallery = useMemo(() => {
    const fromColor = color?.images ?? [];
    const fromProduct = product?.images ?? [];
    const all = [...fromColor, ...fromProduct].filter(Boolean);
    return all.length ? Array.from(new Set(all)) : [];
  }, [color, product]);

  const hero = gallery[Math.min(activeImage, Math.max(gallery.length - 1, 0))] ?? (product ? primaryImage(product) : null);

  if (isPending) {
    return (
      <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-4 pb-16 pt-10 sm:pb-24 sm:pt-16 sm:px-6 lg:grid-cols-2 lg:px-10">
        <div className="aspect-square animate-pulse rounded-3xl border border-border" aria-hidden />
        <div className="space-y-4" aria-hidden>
          <div className="h-10 w-2/3 animate-pulse rounded-full border border-border" />
          <div className="h-6 w-1/3 animate-pulse rounded-full border border-border" />
          <div className="h-32 animate-pulse rounded-2xl border border-border" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:pb-24 sm:pt-16 sm:px-6 lg:px-10">
        <DataError
          error={error}
          retry={() => void refetch()}
          title="We couldn't load this yarn"
        />
      </div>
    );
  }

  const shareUrl =
    typeof window === "undefined" ? `/product/${id}` : window.location.href;

  return (
    <div className="mx-auto grid w-full max-w-[1600px] gap-12 px-4 pb-16 pt-10 sm:pb-24 sm:pt-16 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:px-10">
      <div>
        <div className="overflow-hidden rounded-3xl border border-border">
          {hero ? (
            <img
              src={hero}
              alt={product.title}
              className="aspect-square w-full object-cover"
              decoding="async"
            />
          ) : (
            <div
              className="aspect-square w-full"
              style={{ backgroundImage: "var(--dye-flow)", opacity: 0.4 }}
              aria-hidden
            />
          )}
        </div>
        <p className="mt-3 font-data text-2xs text-muted-foreground/70">
          The 3D yarn-ball viewer replaces this frame in the 3D phase.
        </p>

        {gallery.length > 1 ? (
          <ul className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {gallery.map((src, i) => (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => setActiveImage(i)}
                  data-cursor="link"
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === activeImage}
                  className={cn(
                    "h-20 w-20 overflow-hidden rounded-xl border transition-colors",
                    i === activeImage ? "border-marigold" : "border-border",
                  )}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        {product.brand ? (
          <p className="font-data text-2xs text-marigold">{product.brand}</p>
        ) : null}
        <h1 className="mt-3 font-display text-3xl sm:text-5xl font-light tracking-[-0.03em] text-foreground">
          {product.title}
        </h1>

        <Glass variant="panel" className="mt-8">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-light text-foreground">
              {formatMoney(price)}
            </span>
            {product.struck_price && product.struck_price > price ? (
              <span className="font-data text-2xs text-muted-foreground/70 line-through">
                {formatMoney(product.struck_price)}
              </span>
            ) : null}
            {product.off_pct ? (
              <span className="rounded-full bg-madder px-2.5 py-1 font-data text-[10px] leading-none text-primary-foreground">
                {product.off_pct}% off
              </span>
            ) : null}
          </div>

          {colors.length ? (
            <fieldset className="mt-8">
              <legend className="font-data text-2xs text-muted-foreground">
                Colour{color ? ` · ${color.name}` : ""}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    aria-pressed={c.name === color?.name}
                    disabled={c.stock === 0 && !c.sizes.length}
                    onClick={() => {
                      setColorName(c.name);
                      setSizeName(null);
                      setActiveImage(0);
                    }}
                    data-cursor="link"
                    className={cn(
                      "h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 disabled:opacity-30",
                      c.name === color?.name ? "border-marigold" : "border-border",
                    )}
                    style={{ backgroundColor: c.hex ?? "transparent" }}
                  />
                ))}
              </div>
            </fieldset>
          ) : null}

          {sizes.length ? (
            <fieldset className="mt-6">
              <legend className="font-data text-2xs text-muted-foreground">Weight / pack</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    aria-pressed={s.size === size?.size}
                    disabled={s.stock === 0}
                    onClick={() => setSizeName(s.size)}
                    data-cursor="link"
                    className={cn(
                      "rounded-full border px-4 py-2 font-data text-2xs transition-colors disabled:line-through disabled:opacity-40",
                      s.size === size?.size
                        ? "border-marigold text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          <p className="mt-6 font-data text-2xs text-muted-foreground">
            {stock === 0
              ? "Sold out in this combination"
              : stock <= (product.low_stock_threshold ?? 5)
                ? `Only ${stock} left`
                : "In stock"}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={stock === 0}
              data-cursor="link"
              title="Cart wiring lands with the commerce phase"
              className="sheen inline-flex min-h-12 w-full items-center justify-center rounded-full bg-madder px-6 py-3 font-data text-2xs text-primary-foreground disabled:opacity-40 sm:w-auto"
            >
              Add to bag
            </button>
            <a
              href={waAskAboutProduct(product.title, shareUrl)}
              target="_blank"
              rel="noopener"
              data-cursor="link"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-border px-6 py-3 font-data text-2xs text-foreground sm:w-auto"
            >
              Ask on WhatsApp
            </a>
          </div>
        </Glass>

        {product.description ? (
          <div className="mt-10">
            <p className="font-data text-2xs text-marigold">Details</p>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{product.description}</p>
          </div>
        ) : null}

        <p className="mt-8 font-data text-2xs text-muted-foreground/70">
          {product.returnable === false
            ? "This item is not returnable."
            : `Returnable within ${product.return_days ?? returnWindowDays ?? 7} days.`}
        </p>
      </div>
    </div>
  );
}
