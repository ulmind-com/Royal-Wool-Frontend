import { useMemo, useState, useEffect, useRef } from "react";
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

  // ── Drag-to-move the liquid capsule (finger follows, snaps on release) ──
  const navRef = useRef<HTMLElement | null>(null);
  const [dragX, setDragX] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragState = useRef<{ startX: number; active: boolean; pointerId: number | null }>({
    startX: 0,
    active: false,
    pointerId: null,
  });
  const justDragged = useRef(false);

  // Once navigation settles onto the new tab, drop the manual offset so the
  // capsule rests on its slot (position is identical, so no visual jump).
  useEffect(() => {
    setDragX(null);
  }, [activeIndex]);

  const slotMetrics = () => {
    const rect = navRef.current!.getBoundingClientRect();
    const contentW = rect.width - 8; // minus the 4px padding on each side
    const slotW = contentW / 4;
    return { rect, contentW, slotW };
  };

  const moveTo = (clientX: number) => {
    const { rect, contentW, slotW } = slotMetrics();
    const left = clientX - rect.left - 4 - slotW / 2;
    setDragX(Math.max(0, Math.min(contentW - slotW, left)));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    justDragged.current = false;
    dragState.current = { startX: e.clientX, active: true, pointerId: e.pointerId };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const st = dragState.current;
    if (!st.active) return;
    if (!dragging) {
      if (Math.abs(e.clientX - st.startX) < 6) return; // still a tap, not a drag
      setDragging(true);
      try {
        navRef.current?.setPointerCapture(st.pointerId!);
      } catch {
        /* noop */
      }
    }
    moveTo(e.clientX);
  };

  const endDrag = () => {
    const st = dragState.current;
    dragState.current = { startX: 0, active: false, pointerId: null };
    if (!dragging) {
      setDragX(null);
      return; // plain tap → the button's onClick handles navigation
    }
    setDragging(false);
    const { slotW } = slotMetrics();
    const idx = Math.max(0, Math.min(3, Math.round((dragX ?? 0) / slotW)));
    justDragged.current = true;
    triggerHaptic();
    const item = NAV_ITEMS[idx];
    if (item.isCart) {
      toggleCart();
    } else {
      closeCart();
      if (item.path) navigate({ to: item.path });
    }
    if (idx === activeIndex) setDragX(null); // no route change → snap back now
  };

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
      {/* 
        SVG Filters for Liquid Refraction 
        Used by the CSS url(#liquid-glass) and url(#liquid-toggler) 
      */}
      <svg width="0" height="0" className="hidden absolute pointer-events-none">
        <defs>
          <filter id="liquid-glass" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="liquid-toggler" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* 4-item liquid glass pill */}
      <nav
        className="lg-bottom-nav"
        ref={navRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Active glass capsule — slides to active item, or follows the finger */}
        {activeIndex >= 0 && (
          <span
            className={cn("lg-bottom-active-capsule", dragging && "dragging")}
            aria-hidden
            style={{
              transform:
                dragX != null
                  ? `translateX(${dragX}px)`
                  : `translateX(${activeIndex * 100}%)`,
            }}
          >
            {/* keyed inner glass — restarts the liquid stretch on each switch */}
            <span key={activeIndex} className="lg-bottom-active-glass" />
          </span>
        )}

        {NAV_ITEMS.map((item, index) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={cn("lg-bottom-item", isActive && "active")}
              data-index={index}
              onClick={() => {
                if (justDragged.current) {
                  justDragged.current = false;
                  return; // this "click" is the tail of a drag — ignore it
                }
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
        <Search />
      </button>
    </div>
  );
}
