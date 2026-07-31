import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import { useSettings } from "@/hooks/use-settings";
import {
  type Product,
  discountPct,
  displayPrice,
  isInStock,
  primaryImage,
  struckPrice,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";

/**
 * Catalogue card. Price and stock come exclusively from the server-resolved
 * variant fields (see lib/api/types) — never from product.price alone.
 * The wishlist heart is inert until auth lands in Phase 3.
 */
export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { formatMoney } = useSettings();
  const image = primaryImage(product);
  const struck = struckPrice(product);
  const off = discountPct(product);
  const stocked = isInStock(product);
  const swatches = (product.colors ?? []).slice(0, 5);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border transition-transform duration-[var(--dur-standard)] ease-[var(--ease-enter)] hover:-translate-y-1",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(135deg, color-mix(in oklab, var(--ink) 8%, transparent), color-mix(in oklab, var(--ink) 2%, transparent))",
      }}
    >
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        data-cursor="product"
        className="block focus-visible:outline-none"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={product.title}
              loading="lazy"
              decoding="async"
              className={cn(
                "h-full w-full object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-enter)] group-hover:scale-[1.04]",
                !stocked && "opacity-45 saturate-50",
              )}
            />
          ) : (
            <div
              className="h-full w-full"
              style={{ backgroundImage: "var(--dye-flow)", opacity: 0.4 }}
              aria-hidden
            />
          )}

          {off > 0 ? (
            <span className="absolute left-3 top-3 rounded-full bg-madder px-2.5 py-1 font-data text-[10px] leading-none text-primary-foreground">
              {off}% off
            </span>
          ) : null}
          {!stocked ? (
            <span
              className="absolute inset-x-0 bottom-0 py-2 text-center font-data text-2xs text-fleece"
              style={{ backgroundColor: "color-mix(in oklab, var(--ink) 78%, transparent)" }}
            >
              Sold out
            </span>
          ) : null}
        </div>

        <div className="p-4">
          {product.brand ? (
            <p className="font-data text-2xs text-muted-foreground/80">{product.brand}</p>
          ) : null}
          <h3 className="mt-1 truncate font-display text-lg font-light text-foreground">
            {product.title}
          </h3>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-data text-sm text-foreground">
              {product.price_varies ? "From " : ""}
              {formatMoney(displayPrice(product))}
            </span>
            {struck ? (
              <span className="font-data text-2xs text-muted-foreground/70 line-through">
                {formatMoney(struck)}
              </span>
            ) : null}
          </div>

          {swatches.length ? (
            <ul className="mt-3 flex items-center gap-1.5" aria-label="Available colours">
              {swatches.map((c) => (
                <li
                  key={c.name}
                  title={c.name}
                  className="h-3.5 w-3.5 rounded-full border border-border"
                  style={{ backgroundColor: c.hex ?? "transparent" }}
                />
              ))}
              {(product.colors?.length ?? 0) > swatches.length ? (
                <li className="font-data text-[10px] text-muted-foreground/70">
                  +{(product.colors?.length ?? 0) - swatches.length}
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </Link>

      <button
        type="button"
        aria-label={`Save ${product.title} to wishlist`}
        title="Wishlist opens up once you sign in"
        data-cursor="link"
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground backdrop-blur-md transition-colors hover:text-marigold"
      >
        <Heart className="h-4 w-4" />
      </button>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
