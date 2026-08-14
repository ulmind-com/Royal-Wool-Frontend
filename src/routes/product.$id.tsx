import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, Grid3x3, Minus, Plus, ShoppingBag, TableProperties, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AssuranceBand } from "@/components/commerce/assurance-band";
import { CertificationStrip } from "@/components/commerce/certification-strip";
import { Provenance } from "@/components/commerce/provenance";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductGallery } from "@/components/commerce/product-gallery";
import { RatingStars } from "@/components/commerce/rating-stars";
import { ReviewCard } from "@/components/commerce/review-card";
import { ShadeGrid, shadeOptionLabel, type ShadeOption } from "@/components/commerce/shade-grid";
import { ShadeTable } from "@/components/commerce/shade-table";
import { SpecTiles } from "@/components/commerce/spec-tiles";
import { DataError } from "@/components/data-state";
import { Glass } from "@/components/ui/glass";
import { useSettings } from "@/hooks/use-settings";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { storeAssurances } from "@/lib/api/assurance";
import { productQuery, productsQuery } from "@/lib/api/queries";
import { productReviewsQuery } from "@/lib/api/reviews";
import { similarProductsQuery } from "@/lib/api/catalog-extras";
import { RestockNotify } from "@/components/commerce/restock-notify";
import { WriteReview } from "@/components/commerce/write-review";
import { productSpecs, washCare } from "@/lib/api/specs";

import {
  type Product,
  type ProductColor,
  discountPct,
  displayPrice,
  isInStock,
  primaryImage,
  struckPrice,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { waAskAboutProduct } from "@/lib/whatsapp";

/** A product-as-shade for the grid — every shade is its own product. */
function toShadeOption(p: Product): ShadeOption {
  return {
    id: p.id,
    name: p.primary_color_name || p.title,
    code: p.primary_shade_code ?? null,
    hex: p.primary_color_hex ?? null,
    image: primaryImage(p),
    inStock: isInStock(p),
  };
}

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
  const { formatMoney, shop, settings } = useSettings();
  const { isAuthenticated, setLoginModalOpen } = useAuthStore();
  const { data: product, isPending, isError, error, refetch } = useQuery(productQuery(id));
  const queryClient = useQueryClient();

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [colorIdx, setColorIdx] = useState(0);
  const [shadeView, setShadeView] = useState<"swatch" | "table">("swatch");

  const addItem = useCartStore((s) => s.addItem);

  // A new product id means a clean slate for the gallery, quantity and colour.
  useEffect(() => {
    setActiveImage(0);
    setQty(1);
    setColorIdx(0);
  }, [id]);

  // Colour variants (one product, many shades). When present, the selected
  // colour drives the price, gallery, stock and shade label.
  const colors = useMemo(
    () => (product?.colors ?? []).filter((c) => c && c.name),
    [product],
  );
  const hasColors = colors.length > 0;
  const activeColor = hasColors ? colors[Math.min(colorIdx, colors.length - 1)] : null;

  // Auto-suggest table view for large palettes
  useEffect(() => {
    if (colors.length >= 10) setShadeView("table");
    else setShadeView("swatch");
  }, [colors.length]);

  // Server pricing (whole product) is the fallback; a selected colour resolves
  // its own price locally with the same rules the backend uses.
  const colorPricing = activeColor ? resolveColorPricing(product!, activeColor) : null;
  const price = colorPricing ? colorPricing.price : product ? displayPrice(product) : 0;
  const mrp = colorPricing ? colorPricing.mrp : product ? struckPrice(product) : null;
  const off = colorPricing ? colorPricing.off : product ? discountPct(product) : 0;
  const stock = activeColor ? activeColor.stock ?? 0 : product?.total_stock ?? 0;
  const soldOut = hasColors ? stock <= 0 : product ? !isInStock(product) : true;

  const gallery = useMemo(() => {
    const imgs = activeColor?.images?.length ? activeColor.images : product?.images ?? [];
    return Array.from(new Set(imgs.filter(Boolean)));
  }, [activeColor, product]);

  // Reset the visible image whenever the shopper switches colour.
  useEffect(() => { setActiveImage(0); }, [colorIdx]);

  // Sibling shades: same brand + product line + ball weight, so switching
  // shade never silently changes pack size. Only fetched once we know both.
  const siblings = useQuery({
    ...productsQuery({
      limit: 200,
      ...(product?.brand ? { brand: product.brand } : {}),
      ...(product?.product_line ? { product_line: product.product_line } : {}),
      ...(product?.skein_weight != null ? { skein_weight: product.skein_weight } : {}),
    }),
    enabled: Boolean(product?.brand && product?.product_line),
  });

  // Seed each sibling into the cache so clicking a shade swatch renders
  // instantly instead of flashing a loading skeleton.
  useEffect(() => {
    if (!siblings.data) return;
    for (const sibling of siblings.data) {
      queryClient.setQueryData(productQuery(sibling.id).queryKey, sibling);
    }
  }, [siblings.data, queryClient]);

  const selfShade = product ? toShadeOption(product) : null;
  const shades: ShadeOption[] = useMemo(() => {
    const list = siblings.data?.length ? siblings.data.map(toShadeOption) : [];
    return list.sort((a, b) => (a.code ?? a.name).localeCompare(b.code ?? b.name));
  }, [siblings.data]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    if (product) {
      // The backend matches a colour by its exact name to resolve price & stock,
      // so send activeColor.name verbatim (never the shade code).
      addItem({
        productId: product.id,
        title: product.title,
        color: activeColor ? activeColor.name : product.primary_color_name ?? undefined,
        price,
        qty,
        image: gallery[0] || product.images?.[0],
      });
    }
    const shadeNote = activeColor ? ` — ${activeColor.name}` : "";
    toast.success(`${qty} item(s) of ${product?.title || "Yarn"}${shadeNote} added to your cart!`);
  };

  /** Bulk add from the Shade Table — one cart item per selected shade. */
  const handleBulkAddShades = (items: { color: ProductColor; qty: number }[]) => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    if (!product) return;
    for (const { color: c, qty: q } of items) {
      const cPrice = c.price ?? product.price;
      addItem({
        productId: product.id,
        title: product.title,
        color: c.name,
        price: cPrice,
        qty: q,
        image: c.swatch_image || c.images?.[0] || gallery[0] || product.images?.[0],
      });
    }
    const totalBalls = items.reduce((s, i) => s + i.qty, 0);
    toast.success(`${items.length} shade(s) · ${totalBalls} ball(s) added to your cart!`);
  };

  const specs = product ? productSpecs(product) : [];
  const care = product ? washCare(product) : null;

  const reviews = useQuery({ ...productReviewsQuery(id), enabled: Boolean(product) });
  const similar = useQuery({ ...similarProductsQuery(id, 8), enabled: Boolean(product) });
  const related = useQuery({
    ...productsQuery({
      limit: 8,
      ...(product?.category_id ? { category_id: product.category_id } : {}),
    }),
    enabled: Boolean(product) && !similar.data?.length,
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
  const relatedItems = (similar.data?.length ? similar.data : (related.data ?? []))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);
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
    <div className="pb-[calc(env(safe-area-inset-bottom,0px)+13rem)] lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full max-w-[1600px] px-4 pt-5 sm:px-6 sm:pt-7 lg:px-10">
        <nav aria-label="Breadcrumb" className="font-data text-2xs text-muted-foreground/70">
          <Link to="/collections" data-cursor="link" className="hover:text-foreground">
            Shop
          </Link>
          <span aria-hidden> / </span>
          <span className="text-muted-foreground">{product.title}</span>
        </nav>
      </div>

      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-8 px-4 pt-5 sm:px-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-10 md:px-10">
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
                isAuthenticated={isAuthenticated}
                handleAddToCart={handleAddToCart}
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

          {product.short_description ? (
            <p className="mt-2 max-w-[48ch] text-sm text-muted-foreground">
              {product.short_description}
            </p>
          ) : null}

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

          {hasColors ? (
            <div className="mt-6 border-t border-border pt-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <p className="font-data text-2xs uppercase tracking-[0.16em] text-muted-foreground">
                    Colour
                  </p>
                  {shadeView === "swatch" ? (
                    <p className="font-data text-2xs text-foreground">
                      {activeColor?.name}
                      {activeColor?.shade_code ? ` · ${activeColor.shade_code}` : ""}
                    </p>
                  ) : null}
                  <p className="font-data text-2xs text-muted-foreground/70">
                    {colors.length} shade{colors.length > 1 ? "s" : ""}
                  </p>
                </div>

                {/* View toggle */}
                <div className="inline-flex rounded-lg border border-border p-0.5">
                  <button
                    type="button"
                    onClick={() => setShadeView("swatch")}
                    data-cursor="link"
                    title="Swatch view"
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-md transition-colors",
                      shadeView === "swatch"
                        ? "bg-madder text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Grid3x3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShadeView("table")}
                    data-cursor="link"
                    title="Shade card — select many shades at once"
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-md transition-colors",
                      shadeView === "table"
                        ? "bg-madder text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <TableProperties className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {shadeView === "swatch" ? (
                <ColorSwatches colors={colors} activeIdx={colorIdx} onSelect={setColorIdx} />
              ) : (
                <ShadeTable
                  colors={colors}
                  onBulkAdd={handleBulkAddShades}
                  formatMoney={formatMoney}
                  basePrice={product.price}
                  baseMrp={product.mrp ?? null}
                />
              )}
            </div>
          ) : selfShade && (selfShade.name || selfShade.code) ? (
            <div className="mt-6 border-t border-border pt-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <p className="font-data text-2xs uppercase tracking-[0.16em] text-muted-foreground">
                    Shade
                  </p>
                  <p className="font-data text-2xs text-foreground">{shadeOptionLabel(selfShade)}</p>
                  {shades.length > 1 ? (
                    <p className="font-data text-2xs text-muted-foreground/70">
                      {shades.length} shades
                    </p>
                  ) : null}
                </div>

                {shades.length > 1 ? (
                  <div className="inline-flex rounded-lg border border-border p-0.5">
                    <button
                      type="button"
                      onClick={() => setShadeView("swatch")}
                      data-cursor="link"
                      title="Swatch view"
                      className={cn(
                        "grid h-7 w-7 place-items-center rounded-md transition-colors",
                        shadeView === "swatch"
                          ? "bg-madder text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Grid3x3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShadeView("table")}
                      data-cursor="link"
                      title="Table view"
                      className={cn(
                        "grid h-7 w-7 place-items-center rounded-md transition-colors",
                        shadeView === "table"
                          ? "bg-madder text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <TableProperties className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : null}
              </div>
              {shades.length > 1 ? (
                <ShadeGrid
                  shades={shades}
                  activeId={product.id}
                  viewMode={shadeView === "table" ? "table" : "grid"}
                />
              ) : null}
            </div>
          ) : null}

          {soldOut ? (
            <RestockNotify productId={product.id} colorName={activeColor?.name ?? product.primary_color_name ?? null} />
          ) : (
            <p className="mt-6 font-data text-2xs text-muted-foreground">
              {stock <= (product.low_stock_threshold ?? 5) ? `Only ${stock} left` : "In stock"}
            </p>
          )}

          <SpecTiles specs={specs} />

          <AssuranceBand rows={storeAssurances(product, settings)} />

          <Provenance product={product} />

          <CertificationStrip />

          <div className="mt-8 divide-y divide-border border-y border-border">
            {product.description ? (
              <Accordion title="Description">
                <p className="whitespace-pre-line">{product.description}</p>
              </Accordion>
            ) : null}
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
                "All sales are final — this item can't be returned or exchanged."
              </p>
            </Accordion>
          </div>

          <p className="mt-6 text-xs text-muted-foreground/80">
            <span className="font-data text-2xs text-foreground">NOTE:</span> Actual yarn colour may
            vary from the images due to monitor/mobile display differences, individual perception
            and lighting during photography.
          </p>
        </div>
      </div>

      <WriteReview productId={product.id} title={product.title} />

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

      {/* Mobile sticky action bar — sits ABOVE the floating liquid nav */}
      <div
        className="fixed inset-x-2 z-40 rounded-2xl border border-border px-4 py-3 shadow-lg backdrop-blur-xl md:hidden"
        style={{
          backgroundColor: "color-mix(in oklab, var(--fleece) 92%, transparent)",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 108px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate font-data text-2xs text-muted-foreground">{shadeOptionLabel(selfShade)}</p>
            <p className="font-display text-lg font-light text-foreground">
              {formatMoney(price * qty)}
            </p>
          </div>
          <button
            type="button"
            disabled={soldOut}
            onClick={handleAddToCart}
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
  isAuthenticated,
  handleAddToCart,
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
  isAuthenticated: boolean;
  handleAddToCart: () => void;
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
          onClick={handleAddToCart}
          data-cursor="link"
          title={isAuthenticated ? "Add to your cart" : "Login to add to cart"}
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

/** Resolve a single colour's display price with the same rules as the backend
 * (colour value falls back to the product's base value for every field). */
function resolveColorPricing(product: Product, color: ProductColor): { price: number; mrp: number | null; off: number } {
  const price = color.price ?? product.price ?? 0;
  const mrp = color.mrp ?? product.mrp ?? 0;
  const disc = color.discount_pct ?? product.discount_pct ?? 0;
  const on = color.discount_on ?? product.discount_on ?? "price";
  let final = price;
  if (disc && disc > 0) {
    const base = on === "mrp" && mrp ? mrp : price;
    final = Math.round(base * (1 - disc / 100) * 100) / 100;
  }
  const struck = mrp && mrp > final ? mrp : null;
  const off = struck ? Math.round(((struck - final) / struck) * 100) : 0;
  return { price: final, mrp: struck, off };
}

/** Swatch grid for a product's colours — each swatch shows that shade's own
 * yarn image (like a colour picker); click to select. */
function ColorSwatches({
  colors,
  activeIdx,
  onSelect,
}: {
  colors: ProductColor[];
  activeIdx: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {colors.map((c, i) => {
        const active = i === activeIdx;
        const out = (c.stock ?? 0) <= 0;
        const thumb = c.swatch_image || c.images?.[0] || null;
        return (
          <button
            key={(c.shade_code || c.name) + i}
            type="button"
            onClick={() => onSelect(i)}
            title={c.shade_code ? `${c.name} · ${c.shade_code}` : c.name}
            data-cursor="link"
            aria-pressed={active}
            className={cn(
              "relative h-14 w-14 overflow-hidden rounded-xl border bg-fleece transition-transform sm:h-16 sm:w-16",
              active
                ? "border-madder ring-2 ring-madder ring-offset-2 ring-offset-background"
                : "border-border hover:scale-105",
              out && "opacity-45",
            )}
            style={thumb ? undefined : { backgroundColor: c.hex || "#ccc" }}
          >
            {thumb ? (
              <img src={thumb} alt={c.name} className="h-full w-full object-cover" loading="lazy" />
            ) : null}
            {out ? (
              <span className="absolute inset-x-0 bottom-0 bg-background/80 py-0.5 text-center font-data text-[8px] uppercase tracking-wide text-muted-foreground">
                Sold out
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
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
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? <div className="pb-4 text-sm text-muted-foreground">{children}</div> : null}
    </div>
  );
}
