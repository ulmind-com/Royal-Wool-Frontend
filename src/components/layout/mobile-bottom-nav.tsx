import { useMemo, useState, useEffect } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Home, ShoppingBag, ShoppingCart, Heart, User, Search } from "lucide-react";

import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

/**
 * Ultra-premium Thick Liquid Glass bottom navigation bar designed specifically for mobile view.
 * Engineered with 3D refractive optics, deep internal shadowing, heavy specular rim lighting,
 * and bold, high-volume pill proportions matching modern iOS / VisionOS glass aesthetics.
 */

const LIQUID_GLASS_CONTAINER: React.CSSProperties = {
  background:
    "linear-gradient(160deg, color-mix(in oklab, #ffffff 82%, var(--fleece)) 0%, color-mix(in oklab, #ffffff 45%, var(--fleece)) 100%)",
  backdropFilter: "blur(36px) saturate(220%) contrast(105%)",
  WebkitBackdropFilter: "blur(36px) saturate(220%) contrast(105%)",
  border: "1.5px solid rgba(255, 255, 255, 0.88)",
  boxShadow:
    "0 24px 55px -12px rgba(13, 10, 18, 0.32), 0 10px 24px -8px rgba(13, 10, 18, 0.16), inset 0 3.5px 5px -1px rgba(255, 255, 255, 0.98), inset 0 -4px 8px -2px rgba(13, 10, 18, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.35)",
};

const LIQUID_GLASS_INDICATOR: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.72) 100%)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  boxShadow:
    "0 8px 22px -4px rgba(13, 10, 18, 0.26), 0 4px 10px -2px rgba(13, 10, 18, 0.15), inset 0 2.5px 3px rgba(255, 255, 255, 1), inset 0 -2px 5px rgba(13, 10, 18, 0.12)",
  border: "1px solid rgba(255, 255, 255, 0.95)",
};

export function MobileBottomNav() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = useCartStore((s) => s.items);
  const isCartOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rawCartCount = useMemo(() => items.reduce((acc, item) => acc + item.qty, 0), [items]);
  const cartCount = mounted ? rawCartCount : 0;
  const isUserAuthenticated = mounted ? isAuthenticated : false;
  const currentUser = mounted ? user : null;

  // Determine active item inside the main liquid glass pill
  const activeId = useMemo(() => {
    if (isCartOpen || pathname === "/cart" || pathname === "/checkout") {
      return "cart";
    }
    if (pathname.startsWith("/account/wishlist")) {
      return "wishlist";
    }
    if (pathname.startsWith("/account")) {
      return "profile";
    }
    if (pathname.startsWith("/collections") || pathname.startsWith("/product") || pathname === "/upcoming" || pathname === "/offers") {
      return "shop";
    }
    if (pathname === "/" || pathname === "") {
      return "home";
    }
    return null;
  }, [pathname, isCartOpen]);

  const isSearchActive = pathname.startsWith("/search") && !isCartOpen;

  const triggerHaptic = () => {
    try {
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(12);
      }
    } catch {
      /* noop */
    }
  };

  const navItems = [
    { id: "home", label: "Home", path: "/" },
    { id: "shop", label: "Shop", path: "/collections" },
    { id: "cart", label: "Cart", isCart: true },
    { id: "wishlist", label: "Wishlist", path: "/account/wishlist" },
    { id: "profile", label: "Profile", path: "/account" },
  ];

  return (
    <div className="fixed bottom-3.5 inset-x-0 z-[99990] px-3 sm:px-4 md:hidden pointer-events-none pb-safe flex items-center justify-center gap-2.5 sm:gap-3 max-w-[480px] mx-auto select-none">
      {/* Main Liquid Glass Capsule - Extra Thick & Bold (72px to 76px height) */}
      <div
        className="flex-1 min-w-0 h-[72px] sm:h-[76px] pointer-events-auto flex items-center justify-between rounded-full px-2 sm:px-2.5 transition-all duration-[var(--dur-standard)] isolate relative"
        style={LIQUID_GLASS_CONTAINER}
      >
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                triggerHaptic();
                if (item.isCart) {
                  toggleCart();
                } else {
                  closeCart();
                  if (item.path) {
                    navigate({ to: item.path });
                  }
                }
              }}
              className="relative flex-1 h-[58px] sm:h-[62px] min-w-[50px] flex flex-col items-center justify-center rounded-full text-foreground/75 hover:text-foreground active:scale-95 transition-all duration-200 outline-none"
              aria-label={item.label}
              data-cursor="link"
            >
              {/* Sliding Liquid Glass Indicator (Instagram Reels Style) */}
              {isActive && (
                <motion.div
                  layoutId="liquid-glass-tab-indicator"
                  className="absolute inset-y-[2px] inset-x-[3px] rounded-full z-0"
                  style={LIQUID_GLASS_INDICATOR}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 30,
                    mass: 0.85,
                  }}
                />
              )}

              {/* Icon / Profile Content */}
              <div className="relative z-10 grid place-items-center">
                {item.id === "home" && (
                  <Home
                    className={cn(
                      "h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300",
                      isActive
                        ? "scale-110 text-ink fill-ink/15 stroke-[2.75px] drop-shadow-xs"
                        : "text-ink/75 stroke-[2px] hover:text-ink"
                    )}
                  />
                )}

                {item.id === "shop" && (
                  <ShoppingBag
                    className={cn(
                      "h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300",
                      isActive
                        ? "scale-110 text-ink fill-ink/15 stroke-[2.75px] drop-shadow-xs"
                        : "text-ink/75 stroke-[2px] hover:text-ink"
                    )}
                  />
                )}

                {item.id === "cart" && (
                  <div className="relative">
                    <ShoppingCart
                      className={cn(
                        "h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300",
                        isActive
                          ? "scale-110 text-ink fill-ink/15 stroke-[2.75px] drop-shadow-xs"
                          : "text-ink/75 stroke-[2px] hover:text-ink"
                      )}
                    />
                    <span
                      className={cn(
                        "absolute -top-2 -right-3 z-30 grid h-5 min-w-[20px] sm:h-[22px] sm:min-w-[22px] place-items-center rounded-full px-1.5 font-data text-[10px] sm:text-[11px] leading-none transition-all duration-300 shadow-md",
                        cartCount > 0
                          ? "bg-marigold text-black font-extrabold scale-110 shadow-[0_4px_10px_rgba(255,178,0,0.4)] animate-in zoom-in-75 ring-2 ring-white/80"
                          : "bg-ink text-primary-foreground font-semibold opacity-90"
                      )}
                    >
                      {cartCount}
                    </span>
                  </div>
                )}

                {item.id === "wishlist" && (
                  <Heart
                    className={cn(
                      "h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300",
                      isActive
                        ? "scale-115 text-madder fill-madder stroke-[2.75px] drop-shadow-[0_4px_12px_rgba(225,53,53,0.35)]"
                        : "text-ink/75 stroke-[2px] hover:text-ink"
                    )}
                  />
                )}

                {item.id === "profile" && (
                  isUserAuthenticated ? (
                    currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name || "User profile"}
                        className={cn(
                          "h-7 w-7 sm:h-[30px] sm:w-[30px] rounded-full object-cover transition-all duration-300 shadow-xs",
                          isActive
                            ? "border-[2.5px] border-marigold scale-110 shadow-[0_4px_12px_rgba(255,178,0,0.45)] ring-2 ring-white/90"
                            : "border-[2px] border-ink/40 opacity-90 hover:opacity-100"
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          "grid h-7 w-7 sm:h-[30px] sm:w-[30px] place-items-center rounded-full border-[2px] text-xs font-black uppercase tracking-tight transition-all duration-300",
                          isActive
                            ? "bg-marigold text-black border-white scale-110 shadow-[0_4px_12px_rgba(255,178,0,0.4)] ring-2 ring-white/80"
                            : "bg-marigold/30 text-ink/90 border-ink/30"
                        )}
                      >
                        {currentUser?.name ? currentUser.name.charAt(0) : <User className="h-4 w-4 text-ink" />}
                      </div>
                    )
                  ) : (
                    <User
                      className={cn(
                        "h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300",
                        isActive
                          ? "scale-110 text-ink fill-ink/15 stroke-[2.75px] drop-shadow-xs"
                          : "text-ink/75 stroke-[2px] hover:text-ink"
                      )}
                    />
                  )
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Separate Circular Liquid Glass Search Button (Beside main pill) - Thick 72px/76px Circle */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic();
          closeCart();
          navigate({ to: "/search" });
        }}
        className={cn(
          "h-[72px] w-[72px] sm:h-[76px] sm:w-[76px] shrink-0 pointer-events-auto grid place-items-center rounded-full transition-all duration-[var(--dur-standard)] isolate relative outline-none active:scale-95",
          isSearchActive && "ring-2 ring-marigold/60 shadow-[0_12px_30px_rgba(255,178,0,0.35)]"
        )}
        style={LIQUID_GLASS_CONTAINER}
        aria-label="Search yarns"
        data-cursor="link"
      >
        {isSearchActive && (
          <div
            className="absolute inset-[6px] rounded-full z-0 pointer-events-none animate-in fade-in duration-300"
            style={LIQUID_GLASS_INDICATOR}
          />
        )}
        <Search
          className={cn(
            "relative z-10 h-6 w-6 sm:h-7 sm:w-7 transition-all duration-300",
            isSearchActive ? "scale-110 text-ink stroke-[2.75px] drop-shadow-xs" : "text-ink/80 stroke-[2px] hover:text-ink"
          )}
        />
      </button>
    </div>
  );
}
