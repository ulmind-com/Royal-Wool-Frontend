import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";

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
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

/**
 * Catalogue card. Price and stock come exclusively from the server-resolved
 * variant fields (see lib/api/types) — never from product.price alone.
 */
export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const { formatMoney } = useSettings();
  const navigate = useNavigate();
  const { isAuthenticated, setLoginModalOpen } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const wishlisted = useWishlistStore((s) => s.ids.includes(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const image = primaryImage(product);
  const struck = struckPrice(product);
  const off = discountPct(product);
  const stocked = isInStock(product);
  const swatches = (product.colors ?? []).slice(0, 5);

  // Cards buy the default variant — the first colour/size the server resolved.
  const color = product.colors?.[0];
  const size = color?.sizes?.[0];

  // Returns false when the shopper still has to sign in, so Buy Now can bail out.
  const pushToCart = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return false;
    }
    addItem({
      productId: product.id,
      title: product.title,
      color: color?.name,
      size: size?.size,
      price: displayPrice(product),
      qty: 1,
      image: image ?? undefined,
    });
    return true;
  };

  const handleAddToCart = () => {
    if (!pushToCart()) return;
    toast.success(`${product.title} added to your cart!`);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    try {
      const added = await toggleWishlist(product.id);
      toast.success(added ? "Saved to your wishlist" : "Removed from your wishlist");
    } catch {
      toast.error("Couldn't update your wishlist — try again.");
    }
  };

  const handleBuyNow = () => {
    if (!pushToCart()) return;
    navigate({ to: "/checkout" });
  };

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

        <div className="px-3 pb-3 pt-3 sm:px-4 sm:pt-4">
          {product.brand ? (
            <p className="truncate font-data text-2xs text-muted-foreground/80">{product.brand}</p>
          ) : null}
          <h3 className="mt-1 truncate font-display text-[0.95rem] font-light text-foreground sm:text-lg">
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

      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!stocked}
            onClick={handleAddToCart}
            data-cursor="link"
            title={isAuthenticated ? "Add to your cart" : "Login to add to cart"}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-madder px-2.5 py-2 font-data text-[10px] leading-none text-madder transition-colors hover:bg-madder hover:text-primary-foreground disabled:opacity-40 sm:text-2xs"
          >
            <ShoppingBag className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">Add to cart</span>
          </button>
          <button
            type="button"
            disabled={!stocked}
            onClick={handleBuyNow}
            data-cursor="link"
            title={isAuthenticated ? "Straight to checkout" : "Login to buy"}
            className="sheen inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-madder px-2.5 py-2 font-data text-[10px] leading-none text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40 sm:text-2xs"
          >
            <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">Buy Now</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleWishlist}
        aria-pressed={wishlisted}
        aria-label={
          wishlisted ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`
        }
        title={isAuthenticated ? "Save to wishlist" : "Sign in to save this"}
        data-cursor="link"
        className={cn(
          "absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full border backdrop-blur-md transition-colors sm:right-3 sm:top-3",
          wishlisted
            ? "border-madder/50 bg-madder/10 text-madder"
            : "border-border text-muted-foreground hover:text-marigold",
        )}
      >
        <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
      </button>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
