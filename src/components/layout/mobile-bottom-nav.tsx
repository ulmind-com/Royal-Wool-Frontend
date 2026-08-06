import { useMemo, useState, useEffect } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, type MotionStyle } from "framer-motion";
import { Home, ShoppingBag, ShoppingCart, Search, User } from "lucide-react";

import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

/**
 * Reference-matched mobile bottom navigation.
 * Single 5-item liquid-glass pill: Home / Shop / Cart / Search / Profile.
 * Wide rounded active bubble, filled active icons, solid frosted capsule.
 */

const LIQUID_GLASS_CONTAINER: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.14) 46%, rgba(255, 255, 255, 0.22) 100%)",
  backdropFilter: "blur(28px) saturate(240%) brightness(1.06)",
  border: "1px solid rgba(255, 255, 255, 0.34)",
  boxShadow:
    "0 18px 40px -14px rgba(15, 12, 20, 0.34), 0 6px 14px -8px rgba(15, 12, 20, 0.18), inset 0 1.5px 0 rgba(255, 255, 255, 0.9), inset 0 -1.5px 2px rgba(15, 12, 20, 0.12)",
};

/** Bright top rim fading out toward the bottom — makes the glass read as thick. */
const RIM_HIGHLIGHT: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.18) 24%, rgba(255, 255, 255, 0) 52%, rgba(255, 255, 255, 0.14) 100%)",
  maskImage:
    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  maskComposite: "exclude",
  WebkitMaskComposite: "xor",
  padding: "1.25px",
};

/** Diagonal specular sheen across the upper half. */
const SPECULAR_SHEEN: React.CSSProperties = {
  background:
    "linear-gradient(112deg, rgba(255, 255, 255, 0) 8%, rgba(255, 255, 255, 0.42) 26%, rgba(255, 255, 255, 0.06) 44%, rgba(255, 255, 255, 0) 62%)",
  mixBlendMode: "screen",
};

/** Blurred inner ring so content near the edge looks bent, not cleanly cut. */
const EDGE_REFRACTION: React.CSSProperties = {
  boxShadow:
    "inset 0 0 0 1px rgba(255, 255, 255, 0.45), inset 0 0 10px 3px rgba(255, 255, 255, 0.28), inset 0 0 22px rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(6px) saturate(150%)",
  maskImage:
    "radial-gradient(120% 160% at 50% 50%, transparent 56%, #000 82%)",
};

const LIQUID_GLASS_INDICATOR: MotionStyle = {
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.4) 100%)",
  backdropFilter: "blur(10px) saturate(180%) brightness(1.05)",
  boxShadow:
    "inset 0 1.5px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 1px rgba(15, 12, 20, 0.08), 0 3px 10px -4px rgba(15, 12, 20, 0.22), 0 0 14px rgba(255, 255, 255, 0.35)",
  border: "1px solid rgba(255, 255, 255, 0.55)",
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

  const activeId = useMemo(() => {
    if (isCartOpen || pathname === "/cart" || pathname === "/checkout") {
      return "cart";
    }
    if (pathname.startsWith("/account")) {
      return "profile";
    }
    if (pathname.startsWith("/search")) {
      return "search";
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
    { id: "search", label: "Search", path: "/search" },
    { id: "profile", label: "Profile", path: "/account" },
  ];

  return (
    <div className="fixed bottom-3 sm:bottom-4 inset-x-0 z-[99990] px-3 xs:px-4 sm:px-5 md:hidden pointer-events-none pb-safe flex items-center justify-center max-w-[470px] mx-auto select-none">
      {/* Single 5-Item Liquid Glass Capsule */}
      <div
        className="w-full pointer-events-auto grid grid-cols-5 items-center h-[64px] xs:h-[66px] sm:h-[72px] rounded-[36px] px-1.5 xs:px-2 sm:px-2.5 transition-all duration-[var(--dur-standard)] isolate relative overflow-hidden"
        style={LIQUID_GLASS_CONTAINER}
      >
        {/* Glass material layers */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-[36px] pointer-events-none z-0"
          style={EDGE_REFRACTION}
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-[36px] pointer-events-none z-0"
          style={RIM_HIGHLIGHT}
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-[36px] pointer-events-none z-0"
          style={SPECULAR_SHEEN}
        />

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
              {/* Wide rounded active bubble */}
              {isActive && (
                <motion.div
                  layoutId="mobile-bottom-nav-indicator"
                  className="absolute h-[40px] w-[58px] xs:h-[42px] xs:w-[64px] sm:h-[46px] sm:w-[72px] rounded-[18px] xs:rounded-[20px] sm:rounded-[22px] z-0 pointer-events-none"
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
                      "h-[22px] w-[22px] xs:h-[24px] xs:w-[24px] sm:h-[26px] sm:w-[26px] transition-all duration-300",
                      isActive
                        ? "scale-110 text-ink fill-ink stroke-[2.4px] drop-shadow-xs"
                        : "text-ink/75 stroke-[1.8px] fill-transparent group-hover:text-ink"
                    )}
                  />
                )}

                {item.id === "shop" && (
                  <ShoppingBag
                    className={cn(
                      "h-[22px] w-[22px] xs:h-[24px] xs:w-[24px] sm:h-[26px] sm:w-[26px] transition-all duration-300",
                      isActive
                        ? "scale-110 text-ink fill-ink/15 stroke-[2.4px] drop-shadow-xs"
                        : "text-ink/75 stroke-[1.8px] fill-transparent group-hover:text-ink"
                    )}
                  />
                )}

                {item.id === "cart" && (
                  <div className="relative grid place-items-center">
                    <ShoppingCart
                      className={cn(
                        "h-[22px] w-[22px] xs:h-[24px] xs:w-[24px] sm:h-[26px] sm:w-[26px] transition-all duration-300",
                        isActive
                          ? "scale-110 text-ink fill-ink/15 stroke-[2.4px] drop-shadow-xs"
                          : "text-ink/75 stroke-[1.8px] fill-transparent group-hover:text-ink"
                      )}
                    />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 z-30 grid h-[18px] min-w-[18px] xs:h-5 xs:min-w-[20px] place-items-center rounded-full bg-red-500 px-1 font-data text-[10px] xs:text-[11px] font-extrabold text-white leading-none shadow-[0_2px_6px_rgba(239,68,68,0.45)] ring-2 ring-white animate-in zoom-in-75">
                        {cartCount}
                      </span>
                    )}
                  </div>
                )}

                {item.id === "search" && (
                  <Search
                    className={cn(
                      "h-[22px] w-[22px] xs:h-[24px] xs:w-[24px] sm:h-[26px] sm:w-[26px] transition-all duration-300",
                      isActive
                        ? "scale-110 text-ink fill-ink/15 stroke-[2.4px] drop-shadow-xs"
                        : "text-ink/75 stroke-[1.8px] fill-transparent group-hover:text-ink"
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
                          "h-6 w-6 xs:h-7 xs:w-7 sm:h-[26px] sm:w-[26px] rounded-full object-cover transition-all duration-300",
                          isActive
                            ? "border-[2px] border-ink scale-110 shadow-[0_2px_8px_rgba(15,12,20,0.18)] ring-1 ring-white/90"
                            : "border border-ink/30 opacity-90 group-hover:opacity-100"
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          "grid h-6 w-6 xs:h-7 xs:w-7 sm:h-[26px] sm:w-[26px] place-items-center rounded-full border text-[11px] font-black uppercase tracking-tight transition-all duration-300",
                          isActive
                            ? "bg-ink text-cream border-white scale-110 shadow-[0_2px_8px_rgba(15,12,20,0.18)] ring-1 ring-white/80"
                            : "bg-ink/10 text-ink/90 border-ink/25"
                        )}
                      >
                        {currentUser?.name ? currentUser.name.charAt(0) : <User className="h-3.5 w-3.5 text-ink" />}
                      </div>
                    )
                  ) : (
                    <User
                      className={cn(
                        "h-[22px] w-[22px] xs:h-[24px] xs:w-[24px] sm:h-[26px] sm:w-[26px] transition-all duration-300",
                        isActive
                          ? "scale-110 text-ink fill-ink/15 stroke-[2.4px] drop-shadow-xs"
                          : "text-ink/75 stroke-[1.8px] fill-transparent group-hover:text-ink"
                      )}
                    />
                  )
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
