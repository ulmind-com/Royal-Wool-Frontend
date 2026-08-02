import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ProductCard } from "@/components/commerce/product-card";
import { ProductGallery } from "@/components/commerce/product-gallery";
import { RatingStars } from "@/components/commerce/rating-stars";
import { ReviewCard } from "@/components/commerce/review-card";
import { ShadeGrid, shadeLabel } from "@/components/commerce/shade-grid";
import {
  AwardIcon,
  BabyIcon,
  ShieldIcon,
  TruckIcon,
} from "@/components/commerce/spec-icons";
import { SpecTiles } from "@/components/commerce/spec-tiles";
import { DataError } from "@/components/data-state";
import { Glass } from "@/components/ui/glass";
import { useSettings } from "@/hooks/use-settings";
import { productQuery, productsQuery } from "@/lib/api/queries";
import { productReviewsQuery } from "@/lib/api/reviews";
import { productSpecs, washCare } from "@/lib/api/specs";
import {
  type Product,
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
          "Every shade, weight, gauge and stock level for this Royal Wool yarn, with fast Pan-India delivery.",
      },
      { property: "og:title", content: "Yarn detail — Royal Wool" },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "Shades, gauge, stock and reviews for this yarn." },
      { property: "og:url", content: `/product/${params.id}` },
    ],
    links: [{ rel: "canonical", href: `/product/${params.id}` }],
  }),
  component: ProductPage,
});


function ProductPage() {
  const { id } = Route.useParams();
  const { formatMoney, returnWindowDays, shop } = useSettings();
  const { data: product, isPending, isError, error, refetch } = useQuery(productQuery(id));

  const [colorName, setColorName] = useState<string | null>(null);
  const [sizeName, setSizeName] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  // A new product id means a clean slate for every selection.
  useEffect(() => {
    setColorName(null);
    setSizeName(null);
    setActiveImage(0);
    setQty(1);
  }, [id]);

  const colors = product?.colors ?? [];
  const color: ProductColor | undefined = colors.find((c) => c.name === colorName) ?? colors[0];
  const sizes = color?.sizes ?? [];
  const size: ProductSize | undefined = sizes.find((s) => s.size === sizeName) ?? sizes[0];

  // Every price here comes from the server-resolved variant matrix.
  const price = product ? variantPrice(product, color, size) : 0;
  const stock = variantStock(color, size) || (product?.total_stock ?? 0);
  const mrp = size?.mrp ?? color?.mrp ?? product?.struck_price ?? product?.mrp ?? null;
  const off = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const gallery = useMemo(() => {
    const all = [...(color?.images ?? []), ...(product?.images ?? [])].filter(Boolean);
    return Array.from(new Set(all));
  }, [color, product]);

  const specs = product ? productSpecs(product) : [];
  const care = product ? washCare(product) : null;

  const reviews = useQuery({ ...productReviewsQuery(id), enabled: Boolean(product) });
  const related = useQuery({
    ...productsQuery({
      limit: 8,
      ...(product?.category_id ? { category_id: product.category_id } : {}),
    }),
    enabled: Boolean(product),
  });

  if (isPending) {
    return (
      <div className="mx-auto grid w-full max-w-[1600px] gap-10 px-4 pb-16 pt-8 sm:px-6 sm:pb-24 lg:grid-cols-2 lg:px-10">
        <div className="aspect-square animate-pulse rounded-3xl border border-border" aria-hidden />
        <div className="space-y-4" aria-hidden>
          <div className="h-10 w-2/3 animate-pulse rounded-full border border-border" />
          <div className="h-6 w-1/3 animate-pulse rounded-full border border-border" />
          <div className="h-40 animate-pulse rounded-2xl border border-border" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 sm:pb-24 lg:px-10">
        <DataError error={error} retry={() => void refetch()} title="We couldn't load this yarn" />
      </div>
    );
  }

  const shareUrl = typeof window === "undefined" ? `/product/${id}` : window.location.href;
  const soldOut = stock === 0;
  const relatedItems = (related.data ?? []).filter((p) => p.id !== product.id).slice(0, 4);
  const feed = reviews.data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.description ? { description: product.description } : {}),
    ...(primaryImage(product) ? { image: [primaryImage(product)] } : {}),
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "INR",
      availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
    ...(feed?.count && !feed.isDemo
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Math.round(feed.average * 10) / 10,
            reviewCount: feed.count,
          },
        }
      : {}),
  };

  return (
    <div className="pb-28 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto w-full max-w-[1600px] px-4 pt-5 sm:px-6 sm:pt-7 lg:px-10">
        <nav aria-label="Breadcrumb" className="font-data text-2xs text-muted-foreground/70">
          <Link to="/collections" data-cursor="link" className="hover:text-foreground">
            Shop
          </Link>
          <span aria-hidden> / </span>
          <span className="text-muted-foreground">{product.title}</span>
        </nav>
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] gap-8 px-4 pt-5 sm:px-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-10 md:px-10">
        <div className="md:sticky md:top-14 md:self-start">
          <ProductGallery
            images={gallery}
            title={product.title}
            index={activeImage}
            onIndex={setActiveImage}
            footer={
              <ProductActions
                product={product}
                qty={qty}
                setQty={setQty}
                price={price}
                stock={stock}
                soldOut={soldOut}
                formatMoney={formatMoney}
                shareUrl={shareUrl}
              />
            }
          />
        </div>

        <div>
          {product.brand ? (
            <p className="font-data text-2xs uppercase tracking-[0.18em] text-marigold">
              {product.brand}
            </p>
          ) : null}
          <h1 className="mt-2 max-w-[24ch] text-balance font-display text-xl font-light leading-[1.15] tracking-[-0.02em] text-foreground sm:text-2xl lg:text-3xl">
            {product.title}
          </h1>

          {feed?.count ? (
            <div className="mt-3 flex items-center gap-2">
              <RatingStars value={feed.average} />
              <span className="font-data text-2xs text-muted-foreground">
                {feed.average.toFixed(1)} · {feed.count} review{feed.count > 1 ? "s" : ""}
              </span>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-light text-foreground sm:text-4xl">
              {formatMoney(price)}
            </span>
            {mrp && mrp > price ? (
              <span className="font-data text-2xs text-muted-foreground/70 line-through">
                {formatMoney(mrp)}
              </span>
            ) : null}
            {off > 0 ? (
              <span className="rounded-full bg-madder px-2.5 py-1 font-data text-[10px] leading-none text-primary-foreground">
                {off}% off
              </span>
            ) : null}
            <span
              className="rounded-full px-2.5 py-1 font-data text-[10px] leading-none text-madder"
              style={{ backgroundColor: "color-mix(in oklab, var(--madder) 10%, transparent)" }}
            >
              Incl. of all taxes
            </span>
          </div>

          {colors.length ? (
            <div className="mt-6 border-t border-border pt-6">

              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="font-data text-2xs uppercase tracking-[0.16em] text-muted-foreground">
                  Shade
                </p>
                <p className="font-data text-2xs text-foreground">{shadeLabel(color)}</p>
                <p className="font-data text-2xs text-muted-foreground/70">
                  {colors.length} shade{colors.length > 1 ? "s" : ""}
                </p>
              </div>
              <ShadeGrid
                colors={colors}
                activeName={color?.name ?? null}
                onSelect={(c) => {
                  setColorName(c.name);
                  setSizeName(null);
                  setActiveImage(0);
                  setQty(1);
                }}
              />
            </div>
          ) : null}

          {sizes.length ? (
            <fieldset className="mt-8">
              <legend className="font-data text-2xs uppercase tracking-[0.16em] text-muted-foreground">
                Weight / pack
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    aria-pressed={s.size === size?.size}
                    disabled={s.stock === 0}
                    onClick={() => {
                      setSizeName(s.size);
                      setQty(1);
                    }}
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
            {soldOut
              ? "Sold out in this combination"
              : stock <= (product.low_stock_threshold ?? 5)
                ? `Only ${stock} left`
                : "In stock"}
          </p>

          <SpecTiles specs={specs} />

          <AssuranceBand rows={storeAssurances(product, settings)} />


          {product.description ? (
            <div className="mt-10">
              <p className="font-data text-2xs uppercase tracking-[0.16em] text-marigold">Details</p>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{product.description}</p>
            </div>
          ) : null}

          <div className="mt-8 divide-y divide-border border-y border-border">
            <Accordion title="Name & Address of Manufacturer">
              <p className="whitespace-pre-line">
                {shop
                  ? `${shop.name}\n${shop.address}${shop.phone ? `\n${shop.phone}` : ""}`
                  : "Contact us for manufacturer details."}
              </p>
            </Accordion>
            <Accordion title="Wash Care">
              <p className="whitespace-pre-line">
                {care ??
                  "Hand wash in cold water with a mild detergent. Do not wring or bleach. Dry flat in shade."}
              </p>
            </Accordion>
            <Accordion title="Returns">
              <p>
                {product.returnable === false
                  ? "This item is not returnable."
                  : `Returnable within ${product.return_days ?? returnWindowDays ?? 7} days of delivery.`}
              </p>
            </Accordion>
          </div>

          <p className="mt-6 text-xs text-muted-foreground/80">
            <span className="font-data text-2xs text-foreground">NOTE:</span> Actual yarn colour may
            vary from the images due to monitor/mobile display differences, individual perception and
            lighting during photography.
          </p>
        </div>
      </div>

      {feed?.reviews.length ? (
        <section
          aria-label="Customer reviews"
          className="mx-auto mt-20 w-full max-w-[1600px] px-4 sm:px-6 lg:px-10"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-data text-2xs uppercase tracking-[0.16em] text-marigold">
                From the makers
              </p>
              <h2 className="mt-2 font-display text-2xl font-light tracking-[-0.02em] text-foreground sm:text-3xl">
                What crafters say about this yarn
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <RatingStars value={feed.average} size={16} />
              <span className="font-data text-2xs text-muted-foreground">
                {feed.average.toFixed(1)} / 5
              </span>
            </div>
          </div>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {feed.reviews.slice(0, 4).map((review, i) => (
              <li key={review.id}>
                <ReviewCard review={review} index={i} onOpenPhoto={() => {}} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {relatedItems.length ? (
        <section
          aria-label="You may also like"
          className="mt-20 py-14"
          style={{ backgroundColor: "color-mix(in oklab, var(--madder) 5%, transparent)" }}
        >
          <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10">
            <h2 className="font-display text-2xl font-light tracking-[-0.02em] text-foreground sm:text-3xl">
              You may also like
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {relatedItems.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} className="h-full" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Mobile sticky action bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border px-4 py-3 backdrop-blur-xl md:hidden"
        style={{ backgroundColor: "color-mix(in oklab, var(--fleece) 88%, transparent)" }}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate font-data text-2xs text-muted-foreground">{shadeLabel(color)}</p>
            <p className="font-display text-lg font-light text-foreground">
              {formatMoney(price * qty)}
            </p>
          </div>
          <button
            type="button"
            disabled={soldOut}
            data-cursor="link"
            className="ml-auto inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-madder px-4 font-data text-2xs text-madder disabled:opacity-40"
          >
            Add
          </button>
          <button
            type="button"
            disabled={soldOut}
            data-cursor="link"
            className="sheen inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-madder px-5 font-data text-2xs text-primary-foreground disabled:opacity-40"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductActions({
  product,
  qty,
  setQty,
  price,
  stock,
  soldOut,
  formatMoney,
  shareUrl,
  variant = "default",
}: {
  product: Product;
  qty: number;
  setQty: (fn: (q: number) => number) => void;
  price: number;
  stock: number;
  soldOut: boolean;
  formatMoney: (n: number) => string;
  shareUrl: string;
  variant?: "default" | "compact";
}) {
  const compact = variant === "compact";
  return (
    <Glass variant="card" className={cn(compact ? "mt-3" : "mt-4", "p-3 sm:p-4")}>
      <div className="flex items-center gap-4">
        <div className="inline-flex items-center rounded-full border border-border">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            data-cursor="link"
            className="grid h-9 w-9 place-items-center text-foreground disabled:opacity-35"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-8 text-center font-data text-sm text-foreground">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => Math.min(Math.max(stock, 1), q + 1))}
            disabled={soldOut || qty >= Math.max(stock, 1)}
            data-cursor="link"
            className="grid h-9 w-9 place-items-center text-foreground disabled:opacity-35"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="font-data text-2xs text-muted-foreground">
          Subtotal {formatMoney(price * qty)}
        </p>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={soldOut}
          data-cursor="link"
          title="Cart wiring lands with the commerce phase"
          className="sheen inline-flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-madder px-3 py-2 font-data text-2xs text-primary-foreground disabled:opacity-40"
        >
          <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
          Add to cart
        </button>
        <button
          type="button"
          disabled={soldOut}
          data-cursor="link"
          title="Instant checkout lands with the commerce phase"
          className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-madder px-3 py-2 font-data text-2xs text-madder transition-colors hover:bg-madder hover:text-primary-foreground disabled:opacity-40"
        >
          Buy Now
        </button>
      </div>


      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-data text-2xs text-muted-foreground/80">
        <span className="inline-flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5" aria-hidden /> Ships Pan India
        </span>
        <a
          href={waAskAboutProduct(product.title, shareUrl)}
          target="_blank"
          rel="noopener"
          data-cursor="link"
          className="underline decoration-border underline-offset-4 hover:text-foreground"
        >
          Ask on WhatsApp
        </a>
      </div>
    </Glass>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        data-cursor="link"
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <span className="font-data text-2xs text-foreground">{title}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? <div className="pb-4 text-sm text-muted-foreground">{children}</div> : null}
    </div>
  );
}
