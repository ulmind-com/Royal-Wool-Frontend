import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useCartStore } from "@/store/cart-store";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/commerce/product-card";
import { cartRecommendationsQuery } from "@/lib/api/catalog-extras";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Shopping Bag — Royal Wool" },
      { name: "description", content: "Review your artisan yarn bag and proceed to checkout." },
      { property: "og:title", content: "Your Shopping Bag — Royal Wool" },
      { property: "og:description", content: "Review your bag and check out." },
      { property: "og:url", content: "/cart" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, updateQty, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();

  const totalQty = useMemo(() => items.reduce((acc, idx) => acc + idx.qty, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((acc, idx) => acc + (idx.price * idx.qty), 0), [items]);

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-light text-foreground sm:text-3xl">
            Shopping Bag
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Review your selected yarns before continuing to checkout.
          </p>
        </div>
        <Link
          to="/collections"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-marigold hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="my-12 rounded-2xl border border-dashed border-border/70 bg-card p-12 text-center max-w-xl mx-auto shadow-xs">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground/40">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="font-display text-lg font-medium text-foreground">Your shopping bag is currently empty</h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Our master craftspeople have wound fresh merino and alpaca blends. Add your favorite colors from the catalogue.
          </p>
          <Link
            to="/collections"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-marigold px-8 py-3 text-xs font-bold text-black shadow-sm transition-transform hover:scale-102 active:scale-95"
          >
            Explore Collections <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Item List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground pb-2 border-b border-border/50">
              <span>{totalQty} Item(s) Selected</span>
              <button
                onClick={() => {
                  clearCart();
                  toast.success("Shopping bag cleared.");
                }}
                className="text-red-500 hover:underline inline-flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear Bag
              </button>
            </div>

            <div className="divide-y divide-border/60 space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-2xs", index > 0 && "mt-4")}>
                  <div className="flex items-center gap-4 min-w-0">
                    {item.image ? (
                      <img src={item.image} className="h-20 w-20 rounded-xl object-cover border border-border shadow-xs flex-none" alt={item.title} />
                    ) : (
                      <div className="h-20 w-20 rounded-xl bg-secondary flex items-center justify-center border border-border flex-none">
                        <ShoppingBag className="w-8 h-8 opacity-40 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <Link to="/product/$id" params={{ id: item.productId }} className="font-display text-base font-bold text-foreground hover:text-marigold transition-colors block truncate">
                        {item.title}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                        {item.color ? <span className="rounded bg-secondary/80 px-2 py-0.5 font-medium">Shade: {item.color}</span> : null}
                        {item.size ? <span className="rounded bg-secondary/80 px-2 py-0.5 font-medium">Size: {item.size}</span> : null}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground mt-1.5 sm:hidden">
                        ₹{item.price.toFixed(2)} each
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-border/40 pt-3 sm:pt-0">
                    <div className="flex items-center rounded-xl border border-border bg-secondary/30 p-1">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Decrease quantity">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="mx-3 text-xs font-bold text-foreground min-w-[1.5rem] text-center">
                        {item.qty}
                      </span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Increase quantity">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground hidden sm:block">Total</div>
                        <div className="text-base font-bold text-foreground font-mono">₹{(item.price * item.qty).toFixed(2)}</div>
                      </div>
                      <button
                        onClick={() => {
                          removeItem(item.id);
                          toast.success("Item removed from bag.");
                        }}
                        className="rounded-lg p-2 text-muted-foreground/70 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Order Summary Card */}
          <div className="lg:col-span-4 rounded-2xl border border-stone-800 bg-[#1c1917] p-6 text-stone-100 shadow-xl lg:sticky lg:top-24 space-y-5">
            <h2 className="font-display text-lg font-medium text-white pb-3 border-b border-stone-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-marigold" /> Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-stone-300">
                <span>Items Subtotal ({totalQty})</span>
                <span className="font-mono font-semibold text-white">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-stone-300">
                <span>VIP Signature Packaging</span>
                <span className="font-semibold text-emerald-400">FREE</span>
              </div>
              <div className="flex items-center justify-between text-stone-300">
                <span>Doorstep Courier Delivery</span>
                <span className="font-semibold text-emerald-400">FREE</span>
              </div>

              <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-base font-bold text-white">
                <span>Grand Total</span>
                <span className="text-2xl font-mono text-marigold">₹{totalPrice.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-stone-400 font-normal">
                Taxes included. Discounts applied at next checkout step.
              </p>
            </div>

            <button
              onClick={() => navigate({ to: "/checkout" })}
              className="w-full rounded-full bg-marigold py-3.5 text-xs font-bold text-black shadow-lg transition-transform hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-stone-400 border-t border-stone-800/60">
              <ShieldCheck className="h-4 w-4 text-emerald-500 flex-none" />
              <span>Secure 256-bit payment checkout guarantee</span>
            </div>
          </div>
        </div>
      )}

      {items.length ? <CartRecommendations items={items} /> : null}
    </div>
  );
}

/** "Goes well with" — the recommender scores these against the bag's contents. */
function CartRecommendations({ items }: { items: { productId: string }[] }) {
  const ids = items.map((i) => i.productId);
  const { data } = useQuery(cartRecommendationsQuery(ids, 8));
  const picks = (data ?? []).filter((p) => !ids.includes(p.id)).slice(0, 4);
  if (picks.length === 0) return null;

  return (
    <section aria-label="Goes well with your bag" className="mt-14">
      <h2 className="font-display text-xl font-light text-foreground sm:text-2xl">
        Goes well with your bag
      </h2>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {picks.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} className="h-full" />
          </li>
        ))}
      </ul>
    </section>
  );
}
