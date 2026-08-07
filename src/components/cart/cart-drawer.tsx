import { useMemo, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();

  const totalQty = useMemo(() => items.reduce((acc, i) => acc + i.qty, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((acc, i) => acc + (i.price * i.qty), 0), [items]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs z-[99998]"
          />

          {/* Slide-over Drawer Panel with 100% Solid Opaque Background */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="relative flex h-full w-full max-w-[440px] flex-col bg-[#F7F3EA] dark:bg-[#1A1816] text-foreground shadow-[0_0_80px_rgba(0,0,0,0.65)] border-l border-stone-300 dark:border-stone-800 z-[99999]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-marigold border border-amber-500/20">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-medium text-foreground">Shopping Bag</h2>
                    {totalQty > 0 && (
                      <span className="rounded-full bg-marigold px-2.5 py-0.5 text-[11px] font-bold text-black">
                        {totalQty}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Handcrafted luxury yarns</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={() => {
                      clearCart();
                      toast.success("Bag cleared.");
                    }}
                    className="text-2xs text-muted-foreground hover:text-red-500 underline mr-2 transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={closeCart}
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Close cart drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Items Container */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5 divide-y divide-border/40 space-y-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center px-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/50 border border-border/50 text-muted-foreground/30 mb-4">
                    <ShoppingBag className="h-10 w-10" />
                  </div>
                  <h3 className="font-display text-lg font-medium text-foreground">Your bag feels light</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground max-w-[260px] leading-relaxed">
                    Explore our small-batch merino and artisan silk collections to fill your shopping bag.
                  </p>
                  <button
                    onClick={() => {
                      closeCart();
                      navigate({ to: "/collections" });
                    }}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-marigold px-7 py-2.5 text-xs font-semibold text-black shadow-sm transition-transform hover:scale-102 active:scale-95"
                  >
                    Explore Yarns <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={item.id} className={cn("flex gap-4", index > 0 && "pt-4")}>
                    {/* Image */}
                    <div className="relative flex-none">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-20 w-20 rounded-xl object-cover border border-border shadow-2xs"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-xl bg-secondary flex items-center justify-center text-2xl border border-border">
                          🧶
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to="/product/$id"
                            params={{ id: item.productId }}
                            onClick={closeCart}
                            className="font-display text-sm font-semibold text-foreground hover:text-marigold transition-colors truncate"
                          >
                            {item.title}
                          </Link>
                          <button
                            onClick={() => {
                              removeItem(item.id);
                              toast.success("Removed from bag");
                            }}
                            className="text-muted-foreground/60 hover:text-red-500 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-2xs text-muted-foreground">
                          {item.color && (
                            <span className="rounded bg-secondary px-1.5 py-0.5 font-medium">
                              Shade: {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span className="rounded bg-secondary px-1.5 py-0.5 font-medium">
                              Size: {item.size}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-border bg-secondary/30 p-0.5">
                          <button
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="mx-2 text-xs font-semibold text-foreground min-w-[1.25rem] text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-foreground font-mono">
                            ₹{(item.price * item.qty).toFixed(2)}
                          </div>
                          {item.qty > 1 && (
                            <div className="text-[10px] text-muted-foreground">
                              ₹{item.price.toFixed(2)} each
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sticky Footer */}
            {items.length > 0 && (
              <div className="border-t border-border bg-card/60 p-6 space-y-4 shadow-lg backdrop-blur-sm">
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal ({totalQty} items)</span>
                    <span className="font-semibold text-foreground font-mono">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-sm">
                    <span className="font-bold text-foreground">Estimated Total</span>
                    <span className="font-bold text-lg text-foreground font-mono">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 pt-0.5">
                    Taxes and discount coupons are verified during checkout.
                  </p>
                </div>

                <div className="grid gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      closeCart();
                      navigate({ to: "/checkout" });
                    }}
                    className="w-full rounded-full bg-marigold py-3.5 text-xs font-bold text-black shadow-md transition-all hover:bg-marigold/90 hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 uppercase tracking-wide"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      closeCart();
                      navigate({ to: "/cart" });
                    }}
                    className="w-full rounded-full border border-border bg-background py-2.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors text-center"
                  >
                    Review Bag in Full Page
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>256-bit encrypted checkout</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
