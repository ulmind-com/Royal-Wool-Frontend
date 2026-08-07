import { useMemo, useState, useEffect, useRef } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, type MotionStyle } from "framer-motion";
import { Home, ShoppingBag, ShoppingCart, Search, User } from "lucide-react";

import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

/**
 * App Store style liquid-glass bottom nav.
 * 4-item frosted pill (Home / Shop / Cart / Profile) + separate circular Search button.
 * Active state is a raised glass blob that bulges past the pill and smears icons it passes.
 */

/** Near-clear lens: background reads straight through, only a faint tint. */
const LIQUID_GLASS_CONTAINER: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.04) 100%)",
  backdropFilter: "blur(18px) saturate(150%) brightness(1.04)",
  boxShadow:
    "0 10px 30px -14px rgba(15, 12, 20, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.45)",
};

/** Outer bright hairline — the crisp glass edge. */
const RIM_HIGHLIGHT: React.CSSProperties = {
  background:
    "linear-gradient(150deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.35) 26%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.45) 74%, rgba(255, 255, 255, 0.8) 100%)",
  maskImage: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  maskComposite: "exclude",
  WebkitMaskComposite: "xor",
  padding: "1.5px",
};

/** Inner ring with its own blur — reads as glass wall thickness at the ends. */
const EDGE_REFRACTION: React.CSSProperties = {
  background:
    "linear-gradient(120deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.05) 30%, rgba(255, 255, 255, 0) 55%, rgba(255, 255, 255, 0.1) 78%, rgba(255, 255, 255, 0.4) 100%)",
  backdropFilter: "blur(6px) brightness(1.08)",
  maskImage: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  maskComposite: "exclude",
  WebkitMaskComposite: "xor",
  padding: "5px",
};

/** Narrow diagonal specular streak. */
const SPECULAR_SHEEN: React.CSSProperties = {
  background:
    "linear-gradient(112deg, rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.2) 29%, rgba(255, 255, 255, 0.02) 39%, rgba(255, 255, 255, 0) 52%)",
  mixBlendMode: "screen",
};

/** Smoked glass tile behind the active item. */
const LIQUID_GLASS_BLOB: MotionStyle = {
  background:
    "linear-gradient(180deg, rgba(20, 16, 24, 0.18) 0%, rgba(20, 16, 24, 0.1) 100%)",
  backdropFilter: "blur(10px) saturate(130%)",
  border: "1px solid rgba(255, 255, 255, 0.28)",
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.4)",
};




const NAV_ITEMS = [
  { id: "home", label: "Home", path: "/" },
  { id: "shop", label: "Shop", path: "/collections" },
  { id: "cart", label: "Cart", isCart: true as const },
  { id: "profile", label: "Profile", path: "/account" },
];

export function MobileBottomNav() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = useCartStore((s) => s.items);
  const isCartOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isSmearing, setIsSmearing] = useState(false);
  const smearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (smearTimer.current) clearTimeout(smearTimer.current);
    };
  }, []);

  const rawCartCount = useMemo(() => items.reduce((acc, item) => acc + item.qty, 0), [items]);
  const cartCount = mounted ? rawCartCount : 0;
  const isUserAuthenticated = mounted ? isAuthenticated : false;
  const currentUser = mounted ? user : null;

  const activeId = useMemo(() => {
    if (isCartOpen || pathname === "/cart" || pathname === "/checkout") return "cart";
    if (pathname.startsWith("/account")) return "profile";
    if (pathname.startsWith("/search")) return "search";
    if (
      pathname.startsWith("/collections") ||
      pathname.startsWith("/product") ||
      pathname === "/upcoming" ||
      pathname === "/offers"
    ) {
      return "shop";
    }
    if (pathname === "/" || pathname === "") return "home";
    return null;
  }, [pathname, isCartOpen]);

  const activeIndex = NAV_ITEMS.findIndex((i) => i.id === activeId);
  const isSearchActive = activeId === "search";

  const triggerHaptic = () => {
    try {
      if (typeof window !== "undefined" && window.navigator?.vibrate) {
        window.navigator.vibrate(10);
      }
    } catch {
      /* noop */
    }
  };

  const startSmear = () => {
    setIsSmearing(true);
    if (smearTimer.current) clearTimeout(smearTimer.current);
    smearTimer.current = setTimeout(() => setIsSmearing(false), 460);
  };

  const iconClass = (isActive: boolean) =>
    cn(
      "h-[22px] w-[22px] xs:h-[24px] xs:w-[24px] transition-all duration-300 text-white fill-white stroke-white drop-shadow-[0_1px_3px_rgba(15,12,20,0.55)]",
      isActive ? "scale-[1.06] stroke-[1.6px]" : "stroke-[1.6px] opacity-95"
    );

  const labelClass = (isActive: boolean) =>
    cn(
      "mt-1 text-[9.5px] xs:text-[10px] font-semibold leading-none tracking-tight text-white transition-opacity duration-300 drop-shadow-[0_1px_3px_rgba(15,12,20,0.6)]",
      isActive ? "opacity-100" : "opacity-90"
    );



  /** Distortion applied to items the travelling blob passes over. */
  const smearStyle = (index: number): React.CSSProperties => {
    if (!isSmearing || activeIndex < 0) return {};
    const distance = Math.abs(index - activeIndex);
    if (distance === 0 || distance > 2) return {};
    const strength = distance === 1 ? 1 : 0.55;
    return {
      filter: `blur(${(0.6 * strength).toFixed(2)}px) hue-rotate(${(10 * strength).toFixed(1)}deg)`,
      transform: `scaleX(${1 + 0.07 * strength}) scaleY(${1 - 0.02 * strength})`,
      transition: "filter 220ms ease-out, transform 220ms ease-out",
    };
  };

  return (
    <div className="fixed bottom-3 sm:bottom-4 inset-x-0 z-[99990] px-3 xs:px-4 sm:px-5 md:hidden pointer-events-none pb-safe flex items-center justify-center gap-2 xs:gap-2.5 max-w-[470px] mx-auto select-none">
      {/* 4-item liquid glass pill */}
      <div
        className="flex-1 min-w-0 pointer-events-auto grid grid-cols-4 items-center h-[62px] xs:h-[66px] sm:h-[70px] rounded-[34px] px-1 xs:px-1.5 transition-all duration-[var(--dur-standard)] isolate relative overflow-visible"
        style={LIQUID_GLASS_CONTAINER}
      >
        {/* Clipped decorative glass layers */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-[34px] pointer-events-none z-0 overflow-hidden"
        >
          <span className="absolute inset-0 rounded-[34px]" style={RIM_HIGHLIGHT} />
          <span className="absolute inset-0 rounded-[34px]" style={EDGE_REFRACTION} />
          <span className="absolute inset-0 rounded-[34px]" style={SPECULAR_SHEEN} />
        </span>


        {NAV_ITEMS.map((item, index) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                triggerHaptic();
                startSmear();
                if (item.isCart) {
                  toggleCart();
                } else {
                  closeCart();
                  if (item.path) navigate({ to: item.path });
                }
              }}
              className="relative w-full h-full flex flex-col items-center justify-center rounded-full active:scale-95 transition-transform duration-200 outline-none select-none group"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              data-cursor="link"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-bottom-nav-indicator"
                  className="absolute left-1/2 -translate-x-1/2 h-[52px] w-[68px] xs:h-[56px] xs:w-[74px] sm:h-[60px] sm:w-[78px] rounded-[22px] xs:rounded-[24px] z-0 pointer-events-none overflow-hidden"
                  style={LIQUID_GLASS_BLOB}
                  animate={{ scaleX: [1.08, 0.99, 1], scaleY: [0.94, 1.01, 1] }}
                  transition={{
                    layout: { type: "spring", stiffness: 320, damping: 30, mass: 0.85 },
                    scaleX: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                    scaleY: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-[22px] xs:rounded-[24px]"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0) 62%, rgba(255,255,255,0.14) 100%)",
                      maskImage:
                        "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                      maskComposite: "exclude",
                      WebkitMaskComposite: "xor",
                      padding: "1px",
                    }}
                  />
                </motion.div>
              )}



              <div
                className="relative z-10 flex flex-col items-center justify-center"
                style={smearStyle(index)}
              >
                {item.id === "home" && <Home className={iconClass(isActive)} />}
                {item.id === "shop" && <ShoppingBag className={iconClass(isActive)} />}
                {item.id === "cart" && (
                  <div className="relative grid place-items-center">
                    <ShoppingCart className={iconClass(isActive)} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 z-30 grid h-[18px] min-w-[18px] xs:h-5 xs:min-w-[20px] place-items-center rounded-full bg-red-500 px-1 font-data text-[10px] xs:text-[11px] font-extrabold text-white leading-none shadow-[0_2px_6px_rgba(239,68,68,0.45)] ring-2 ring-white animate-in zoom-in-75">
                        {cartCount}
                      </span>
                    )}
                  </div>
                )}
                {item.id === "profile" &&
                  (isUserAuthenticated ? (
                    currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name || "User profile"}
                        className={cn(
                          "h-6 w-6 xs:h-[26px] xs:w-[26px] rounded-full object-cover transition-all duration-300",
                          isActive
                            ? "border-[2px] border-primary scale-[1.06] ring-1 ring-white/90"
                            : "border border-ink/30"
                        )}
                      />
                    ) : (
                      <div
                        className={cn(
                          "grid h-6 w-6 xs:h-[26px] xs:w-[26px] place-items-center rounded-full border text-[11px] font-black uppercase tracking-tight transition-all duration-300",
                          isActive
                            ? "bg-primary text-primary-foreground border-white scale-[1.06] ring-1 ring-white/80"
                            : "bg-ink/10 text-ink/90 border-ink/25"
                        )}
                      >
                        {currentUser?.name ? (
                          currentUser.name.charAt(0)
                        ) : (
                          <User className="h-3.5 w-3.5 text-ink" />
                        )}
                      </div>
                    )
                  ) : (
                    <User className={iconClass(isActive)} />
                  ))}
                <span className={labelClass(isActive)}>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Separate circular search button */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic();
          closeCart();
          navigate({ to: "/search" });
        }}
        aria-label="Search"
        aria-current={isSearchActive ? "page" : undefined}
        data-cursor="link"
        className="pointer-events-auto relative shrink-0 grid place-items-center h-[62px] w-[62px] xs:h-[66px] xs:w-[66px] sm:h-[70px] sm:w-[70px] rounded-full active:scale-95 transition-transform duration-200 outline-none isolate overflow-hidden"
        style={LIQUID_GLASS_CONTAINER}
      >
        <span aria-hidden className="absolute inset-0 rounded-full pointer-events-none" style={RIM_HIGHLIGHT} />
        <span aria-hidden className="absolute inset-0 rounded-full pointer-events-none" style={SPECULAR_SHEEN} />
        <Search
          className={cn(
            "relative z-10 h-[24px] w-[24px] xs:h-[26px] xs:w-[26px] transition-all duration-300",
            isSearchActive
              ? "text-primary fill-primary/20 stroke-[2.4px] scale-[1.06]"
              : "text-ink stroke-[2.1px] fill-transparent"
          )}
        />
      </button>
    </div>
  );
}
