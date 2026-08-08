import { useMemo, useState, useEffect } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, ShoppingBag, ShoppingCart, Search, User } from "lucide-react";

import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

/**
 * Liquid Glass bottom navigation — uses the exact liquid-glass CSS
 * with color-mix(), layered inset highlights/shadows, and glass reflection.
 *
 * 4-item frosted pill (Home / Shop / Cart / Profile) + separate circular Search button.
 * Active item has its own elevated liquid glass capsule that slides smoothly.
 */

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

  useEffect(() => {
    setMounted(true);
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

  return (
    <div className="lg-bottom-wrapper md:hidden">
      {/* 4-item liquid glass pill */}
      <nav className="lg-bottom-nav">
        {/* Glass reflection layer */}
        <span className="lg-bottom-nav-reflection" aria-hidden />

        {/* Active glass capsule — slides to active item */}
        {activeIndex >= 0 && (
          <span
            className="lg-bottom-active-capsule"
            aria-hidden
            style={{
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />
        )}

        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={cn("lg-bottom-item", isActive && "active")}
              onClick={() => {
                triggerHaptic();
                if (item.isCart) {
                  toggleCart();
                } else {
                  closeCart();
                  if (item.path) navigate({ to: item.path });
                }
              }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              data-cursor="link"
            >
              <span className={cn("lg-bottom-icon", isActive && "active")}>
                {item.id === "home" && <Home />}
                {item.id === "shop" && <ShoppingBag />}
                {item.id === "cart" && (
                  <span className="relative grid place-items-center">
                    <ShoppingCart />
                    {cartCount > 0 && (
                      <span className="lg-bottom-badge">{cartCount}</span>
                    )}
                  </span>
                )}
                {item.id === "profile" &&
                  (isUserAuthenticated ? (
                    currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name || "User"}
                        className={cn(
                          "lg-bottom-avatar",
                          isActive && "active"
                        )}
                      />
                    ) : (
                      <span
                        className={cn(
                          "lg-bottom-initials",
                          isActive && "active"
                        )}
                      >
                        {currentUser?.name ? currentUser.name.charAt(0) : <User />}
                      </span>
                    )
                  ) : (
                    <User />
                  ))}
              </span>
              <span className={cn("lg-bottom-label", isActive && "active")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Separate circular search button */}
      <button
        type="button"
        className={cn("lg-bottom-search", isSearchActive && "active")}
        onClick={() => {
          triggerHaptic();
          closeCart();
          navigate({ to: "/search" });
        }}
        aria-label="Search"
        aria-current={isSearchActive ? "page" : undefined}
        data-cursor="link"
      >
        <span className="lg-bottom-nav-reflection round" aria-hidden />
        <Search />
      </button>
    </div>
  );
}
