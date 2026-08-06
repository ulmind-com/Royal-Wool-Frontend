import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Glass } from "@/components/ui/glass";
import { categoryTreeQuery } from "@/lib/api/queries";
import type { CategoryNode } from "@/lib/api/types";
import { BRAND } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

function Wordmark() {
  return (
    <Link
      to="/"
      data-cursor="link"
      className="group flex min-w-0 items-center gap-2 sm:gap-2.5"
      aria-label={`${BRAND.name} home`}
    >
      <img
        src="/logo.jpeg"
        alt=""
        aria-hidden
        width={56}
        height={56}
        className="h-12 w-12 shrink-0 rounded-full border border-marigold/40 object-cover shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14"
      />
      <span className="flex min-w-0 items-baseline gap-1.5">
        <span className="font-display text-lg font-semibold tracking-[-0.04em] text-foreground sm:text-xl">
          Royaall
        </span>
        <span className="font-display text-lg font-light italic tracking-[-0.04em] text-marigold sm:text-xl">
          Wool
        </span>
      </span>
    </Link>
  );
}

const ICON_BTN =
  "relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-foreground/80 transition-colors duration-[var(--dur-micro)] hover:bg-foreground/10 hover:text-foreground active:bg-foreground/10 sm:h-10 sm:w-10";

const NAV_LINK =
  "rounded-full px-3 py-2 font-data text-2xs text-muted-foreground transition-colors hover:text-foreground";

const NAV_LINK_ACTIVE = "font-medium text-foreground";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const cartItems = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const [mounted, setMounted] = useState(false);
  const cartCount = mounted ? cartItems.reduce((acc, item) => acc + item.qty, 0) : 0;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesTimer = useRef<number | null>(null);

  const { data: tree } = useQuery(categoryTreeQuery);
  const groups: CategoryNode[] = (tree ?? []).filter((c) => !c.parent_id);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openCategories = () => {
    if (categoriesTimer.current) window.clearTimeout(categoriesTimer.current);
    setCategoriesOpen(true);
  };

  const closeCategoriesSoon = () => {
    categoriesTimer.current = window.setTimeout(() => setCategoriesOpen(false), 120);
  };

  const closeCategoriesNow = () => {
    if (categoriesTimer.current) window.clearTimeout(categoriesTimer.current);
    setCategoriesOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-[var(--dur-standard)] ease-[var(--ease-enter)]",
        scrolled
          ? "border-b border-border backdrop-blur-[22px] backdrop-saturate-[1.6]"
          : "border-b border-transparent",
      )}
      style={
        scrolled
          ? {
              backgroundImage:
                "linear-gradient(135deg, color-mix(in oklab, var(--ink) 8%, transparent), color-mix(in oklab, var(--ink) 2%, transparent))",
            }
          : undefined
      }
    >
      {/* Mobile Header Layout (< md) - Logo in exact center, Three-line menu on far right edge */}
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3 md:hidden">
        {/* Invisible Left Spacer to ensure exact geometric centering of Logo */}
        <div className="w-10 sm:w-11 shrink-0" aria-hidden="true" />
        
        <div className="flex min-w-0 flex-1 justify-center">
          <Wordmark />
        </div>

        <div className="flex w-10 sm:w-11 shrink-0 justify-end">
          <button
            type="button"
            className={ICON_BTN}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            data-cursor="link"
          >
            {menuOpen ? <X className="h-6 w-6 stroke-[2px]" /> : <Menu className="h-6 w-6 stroke-[2px]" />}
          </button>
        </div>
      </div>

      {/* Tablet & Desktop Header Layout (>= md) */}
      <div className="mx-auto hidden w-full max-w-[1600px] md:grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-6 py-3 lg:px-10">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className={cn(ICON_BTN, "lg:hidden")}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            data-cursor="link"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Wordmark />
        </div>

        {/* desktop nav */}
        <div className="flex min-w-0 justify-center">
          <nav aria-label="Main" className="hidden lg:flex">
            <ul className="flex items-center gap-0.5">
              <li>
                <Link
                  to="/"
                  activeProps={{ className: NAV_LINK_ACTIVE }}
                  inactiveProps={{ className: "" }}
                  activeOptions={{ exact: true }}
                  className={NAV_LINK}
                  data-cursor="link"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/collections"
                  activeProps={{ className: NAV_LINK_ACTIVE }}
                  inactiveProps={{ className: "" }}
                  className={NAV_LINK}
                  data-cursor="link"
                >
                  Shop
                </Link>
              </li>
              <li
                onMouseEnter={openCategories}
                onMouseLeave={closeCategoriesSoon}
                onFocus={openCategories}
                onBlur={closeCategoriesSoon}
              >
                <button
                  type="button"
                  data-cursor="link"
                  aria-expanded={categoriesOpen}
                  className={cn(
                    NAV_LINK,
                    "inline-flex items-center gap-1",
                    categoriesOpen && NAV_LINK_ACTIVE,
                  )}
                >
                  Categories
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-[var(--dur-micro)]",
                      categoriesOpen && "rotate-180",
                    )}
                  />
                </button>
              </li>
              <li>
                <Link
                  to="/about"
                  activeProps={{ className: NAV_LINK_ACTIVE }}
                  inactiveProps={{ className: "" }}
                  className={NAV_LINK}
                  data-cursor="link"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  activeProps={{ className: NAV_LINK_ACTIVE }}
                  inactiveProps={{ className: "" }}
                  className={NAV_LINK}
                  data-cursor="link"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/offers"
                  activeProps={{ className: NAV_LINK_ACTIVE }}
                  inactiveProps={{ className: "" }}
                  className={NAV_LINK}
                  data-cursor="link"
                >
                  Offers
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  activeProps={{ className: NAV_LINK_ACTIVE }}
                  inactiveProps={{ className: "" }}
                  className={NAV_LINK}
                  data-cursor="link"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            to="/search"
            data-cursor="link"
            aria-label="Search yarns"
            className="hidden items-center gap-3 rounded-full border border-border px-4 py-2 text-muted-foreground transition-colors hover:text-foreground lg:flex"
          >
            <Search className="h-4 w-4" />
            <span className="font-data text-2xs">Search</span>
            <kbd className="font-data text-2xs text-muted-foreground/70">⌘K</kbd>
          </Link>
          <Link to="/search" className={cn(ICON_BTN, "lg:hidden")} aria-label="Search yarns">
            <Search className="h-5 w-5" />
          </Link>
          <Link to="/account" className={cn(ICON_BTN, user?.avatar && "p-0 overflow-hidden")} aria-label="My Account" data-cursor="link">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover sm:h-7 sm:w-7" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </Link>
          <button type="button" onClick={openCart} className={ICON_BTN} aria-label="Open Cart Drawer" data-cursor="link">
            <ShoppingBag className="h-5 w-5" />
            <span className={cn(
              "absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 font-data text-[10px] leading-none text-primary-foreground sm:-right-0.5 sm:-top-0.5 transition-transform",
              cartCount > 0 ? "bg-marigold text-black font-bold scale-110" : "bg-madder"
            )}>
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* desktop categories mega-menu panel */}
      {categoriesOpen && groups.length ? (
        <div
          className="absolute inset-x-0 top-full hidden px-6 pb-6 lg:block"
          onMouseEnter={openCategories}
          onMouseLeave={closeCategoriesSoon}
        >
          <Glass variant="panel" refract className="mx-auto max-w-[1200px]">
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <div key={group.id}>
                  <Link
                    to="/collections/$slug"
                    params={{ slug: group.slug }}
                    data-cursor="link"
                    className="inline-block border-b border-border pb-2 font-display text-lg text-marigold transition-colors hover:text-foreground"
                    onClick={closeCategoriesNow}
                  >
                    {group.name}
                  </Link>
                  {group.blurb && !group.children?.length ? (
                    <p className="mt-3 text-sm text-muted-foreground">{group.blurb}</p>
                  ) : null}
                  <ul className="mt-3 space-y-2">
                    {(group.children ?? []).slice(0, 5).map((item) => (
                      <li key={item.id}>
                        <Link
                          to="/collections/$slug"
                          params={{ slug: item.slug }}
                          data-cursor="link"
                          className="text-base text-muted-foreground transition-colors hover:text-marigold"
                          onClick={closeCategoriesNow}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Glass>
        </div>
      ) : null}

      {/* mobile drawer */}
      {menuOpen ? (
        <div
          className="max-h-[calc(100dvh-3.75rem)] overflow-y-auto overscroll-contain border-t border-border px-4 pb-safe pt-4 backdrop-blur-[22px] lg:hidden"
          style={{
            backgroundImage:
              "linear-gradient(180deg, color-mix(in oklab, var(--background) 96%, transparent), color-mix(in oklab, var(--background) 92%, transparent))",
          }}
        >
          <nav aria-label="Mobile">
            <ul className="divide-y divide-border/60">
              <li>
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center text-base text-foreground active:text-marigold"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/collections"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center text-base text-foreground active:text-marigold"
                >
                  Shop
                </Link>
              </li>
              <li className="py-3">
                <p className="font-data text-2xs text-marigold">Categories</p>
                <ul className="mt-2 space-y-1">
                  {groups.map((group) => (
                    <li key={group.id}>
                      <Link
                        to="/collections/$slug"
                        params={{ slug: group.slug }}
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-11 items-center text-base text-muted-foreground active:text-foreground"
                      >
                        {group.name}
                      </Link>
                      <ul className="ml-4 space-y-1">
                        {(group.children ?? []).map((item) => (
                          <li key={item.id}>
                            <Link
                              to="/collections/$slug"
                              params={{ slug: item.slug }}
                              onClick={() => setMenuOpen(false)}
                              className="flex min-h-10 items-center text-sm text-muted-foreground/80 active:text-foreground"
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <Link
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center text-base text-foreground active:text-marigold"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center text-base text-foreground active:text-marigold"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/offers"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center text-base text-foreground active:text-marigold"
                >
                  Offers
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center text-base text-foreground active:text-marigold"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center text-base text-foreground active:text-marigold"
                >
                  My Account
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openCart();
                  }}
                  className="flex min-h-12 w-full text-left items-center text-base text-foreground active:text-marigold"
                >
                  Cart ({cartCount})
                </button>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
