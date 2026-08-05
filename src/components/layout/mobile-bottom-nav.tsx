import { useMemo, useState, useEffect } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Home, ShoppingBag, ShoppingCart, Heart, User, Search } from "lucide-react";

import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

/**
 * Ultra-premium Adaptive Liquid Glass bottom navigation bar designed specifically for mobile view.
 * Features an architecturally balanced 5-item main capsule paired with a separate circular Search button beside it.
 * Precision-engineered to resize and look luxurious on ANY phone screen size (320px to 450px+).
 */

const LIQUID_GLASS_CONTAINER: React.CSSProperties = {
  background:
    "linear-gradient(150deg, rgba(255, 255, 255, 0.99) 0%, rgba(252, 251, 249, 0.96) 100%)",
  backdropFilter: "blur(34px) saturate(200%)",
  border: "1px solid rgba(255, 255, 255, 1)",
  boxShadow:
    "0 24px 55px -12px rgba(15, 12, 20, 0.30), 0 10px 24px -6px rgba(15, 12, 20, 0.18), inset 0 2.5px 3px -1px rgba(255, 255, 255, 1), inset 0 -4px 8px -2px rgba(15, 12, 20, 0.10)",
};

const LIQUID_GLASS_INDICATOR = {
  background:
    "linear-gradient(135deg, rgba(233, 231, 228, 0.95) 0%, rgba(216, 213, 209, 0.92) 100%)",
  boxShadow:
    "inset 0 2px 4px rgba(15, 12, 20, 0.10), inset 0 -1.5px 2px rgba(255, 255, 255, 0.9), 0 1px 2px rgba(15, 12, 20, 0.06)",
  border: "1px solid rgba(255, 255, 255, 0.85)",
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
    if (
      pathname.startsWith("/collections") ||
      pathname.startsWith("/product") ||
      pathname === "/upcoming" ||
      pathname === "/offers"
    ) {
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
        window.navigator.vibrate(10);
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
    <div className="fixed bottom-3 sm:bottom-4 inset-x-0 z-[99990] px-3 sm:px-5 md:hidden pointer-events-none pb-safe flex items-center justify-center gap-2 sm:gap-2.5 max-w-[460px] mx-auto select-none">
      {/* Main 5-Item Liquid Glass Capsule - Perfectly sized (58px/62px) to prevent squashing on any phone */}
      <div
        className="flex-1 min-w-0 h-[58px] sm:h-[62px] pointer-events-auto grid grid-cols-5 items-center rounded-full px-1 sm:px-1.5 transition-all duration-[var(--dur-standard)] isolate relative shadow-2xl"
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
              className="relative w-full h-full flex flex-col items-center justify-center rounded-full text-foreground/70 hover:text-foreground active:scale-95 transition-all duration-200 outline-none select-none group"
              aria-label={item.label}
              data-cursor="link"
            >
              {/* Perfectly round sliding liquid bubble indicator */}
              {isActive && (
                <motion.div
                  layoutId="liquid-glass-tab-indicator"
                  className="absolute h-[44px] w-[44px] sm:h-[48px] sm:w-[48px] rounded-full z-0 pointer-events-none"
                  style={LIQUID_GLASS_INDICATOR}
                  transition={{
                    type: "spring",
                    stiffness: 450,
                    damping: 32,
                    mass: 0.8,
                  }}
                />
              )}

              {/* Icon / Profile Content */}
              <div className="relative z-10 grid place-items-center">
                {item.id === "home" && (
                  <Home
                    className={cn(
                      "h-[22px] w-[22px] sm:h-6 sm:w-6 transition-all duration-300",
                      isActive
                        ? "scale-110 text-ink fill-ink/10 stroke-[2.5px] drop-shadow-xs"
                        : "text-ink/75 stroke-[1.8px] group-hover:text-ink"
                    )}
                  />
                )}

                {item.id === "shop" && (
                  <ShoppingBag
                    className={cn(
                      "h-[22px] w-[22px] sm:h-6 sm:w-6 transition-all duration-300",
                      isActive
                        ? "scale-110 text-ink fill-ink/10 stroke-[2.5px] drop-shadow-xs"
                        : "text-ink/75 stroke-[1.8px] group-hover:text-ink"
                    )}
                  />
                )}

                {item.id === "cart" && (
                  <div className="relative grid place-items-center">
                    <ShoppingCart
                      className={cn(
                        "h-[22px] w-[22px] sm:h-6 sm:w-6 transition-all duration-300",
                        isActive
                          ? "scale-110 text-ink fill-ink/10 stroke-[2.5px] drop-shadow-xs"
                          : "text-ink/75 stroke-[1.8px] group-hover:text-ink"
                      )}
                    />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 z-30 grid h-4 min-w-[16px] sm:h-[18px] sm:min-w-[18px] place-items-center rounded-full bg-marigold px-1 font-data text-[10px] sm:text-[11px] font-extrabold text-black leading-none shadow-[0_2px_6px_rgba(255,178,0,0.5)] ring-1 ring-white/90 animate-in zoom-in-75">
                        {cartCount}
                      </span>
                    )}
                  </div>
                )}

                {item.id === "wishlist" && (
                  <Heart
                    className={cn(
                      "h-[22px] w-[22px] sm:h-6 sm:w-6 transition-all duration-300",
                      isActive
                        ? "scale-110 text-madder fill-madder stroke-[2.5px] drop-shadow-[0_2px_8px_rgba(225,53,53,0.35)]"
                        : "text-ink/75 stroke-[1.8px] group-hover:text-ink"
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
                          "h-6 w-6 sm:h-[26px] sm:w-[26px] rounded-full object-cover transition-all duration-300",
                          isActive
                            ? "border-[2px] border-marigold scale-110 shadow-[0_2px_8px_rgba(255,178,0,0.45)] ring-1 ring-white/90"
                            : "border border-ink/30 opacity-90 group-hover:opacity-100"
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          "grid h-6 w-6 sm:h-[26px] sm:w-[26px] place-items-center rounded-full border text-[11px] font-black uppercase tracking-tight transition-all duration-300",
                          isActive
                            ? "bg-marigold text-black border-white scale-110 shadow-[0_2px_8px_rgba(255,178,0,0.4)] ring-1 ring-white/80"
                            : "bg-marigold/25 text-ink/90 border-ink/25"
                        )}
                      >
                        {currentUser?.name ? currentUser.name.charAt(0) : <User className="h-3.5 w-3.5 text-ink" />}
                      </div>
                    )
                  ) : (
                    <User
                      className={cn(
                        "h-[22px] w-[22px] sm:h-6 sm:w-6 transition-all duration-300",
                        isActive
                          ? "scale-110 text-ink fill-ink/10 stroke-[2.5px] drop-shadow-xs"
                          : "text-ink/75 stroke-[1.8px] group-hover:text-ink"
                      )}
                    />
                  )
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Separate Circular Liquid Glass Search Button - Perfectly sized (58px/62px) */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic();
          closeCart();
          navigate({ to: "/search" });
        }}
        className={cn(
          "h-[58px] w-[58px] sm:h-[62px] sm:w-[62px] shrink-0 pointer-events-auto grid place-items-center rounded-full transition-all duration-[var(--dur-standard)] isolate relative outline-none active:scale-95 shadow-2xl group",
          isSearchActive && "ring-1 ring-white shadow-[0_8px_25px_rgba(255,178,0,0.25)]"
        )}
        style={LIQUID_GLASS_CONTAINER}
        aria-label="Search yarns"
        data-cursor="link"
      >
        {isSearchActive && (
          <div
            className="absolute h-[44px] w-[44px] sm:h-[48px] sm:w-[48px] rounded-full z-0 pointer-events-none animate-in fade-in duration-300"
            style={LIQUID_GLASS_INDICATOR}
          />
        )}
        <Search
          className={cn(
            "relative z-10 h-[22px] w-[22px] sm:h-6 sm:w-6 transition-all duration-300",
            isSearchActive ? "scale-110 text-ink stroke-[2.5px] drop-shadow-xs" : "text-ink/75 stroke-[1.8px] group-hover:text-ink"
          )}
        />
      </button>
    </div>
  );
}
