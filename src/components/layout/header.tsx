import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Bell, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Glass } from "@/components/ui/glass";
import { categoryTreeQuery } from "@/lib/api/queries";
import type { CategoryNode } from "@/lib/api/types";
import { BRAND } from "@/lib/site";
import { cn } from "@/lib/utils";

function Wordmark() {
  return (
    <Link
      to="/"
      data-cursor="link"
      className="group flex items-baseline gap-2"
      aria-label={`${BRAND.name} home`}
    >
      <span className="font-display text-2xl font-semibold tracking-[-0.04em] text-fleece">
        Royal
      </span>
      <span className="font-display text-2xl font-light italic tracking-[-0.04em] text-marigold">
        Wool
      </span>
    </Link>
  );
}

const ICON_BTN =
  "relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-fleece/80 transition-colors duration-[var(--dur-micro)] hover:bg-fleece/10 hover:text-fleece";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openColumn, setOpenColumn] = useState<string | null>(null);

  // Top-level categories become mega-menu columns; their children become links.
  const { data: tree } = useQuery(categoryTreeQuery);
  const groups: CategoryNode[] = (tree ?? []).filter((c) => !c.parent_id).slice(0, 5);
  const activeGroup = groups.find((g) => g.slug === openColumn);
  const activeItems = activeGroup?.children ?? [];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


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
                "linear-gradient(135deg, color-mix(in oklab, var(--fleece) 8%, transparent), color-mix(in oklab, var(--fleece) 2%, transparent))",
            }
          : undefined
      }
    >
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
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

        {/* desktop mega-menu triggers */}
        <nav aria-label="Main" className="hidden min-w-0 justify-center lg:flex">
          <ul className="flex items-center gap-1" onMouseLeave={() => setOpenColumn(null)}>
            {groups.map((group) => (
              <li key={group.id}>
                {group.children?.length ? (
                  <button
                    type="button"
                    data-cursor="link"
                    onMouseEnter={() => setOpenColumn(group.slug)}
                    onFocus={() => setOpenColumn(group.slug)}
                    aria-expanded={openColumn === group.slug}
                    className="rounded-full px-4 py-2 font-data text-2xs text-fleece-dim transition-colors hover:text-fleece"
                  >
                    {group.name}
                  </button>
                ) : (
                  <Link
                    to="/collections/$slug"
                    params={{ slug: group.slug }}
                    data-cursor="link"
                    onMouseEnter={() => setOpenColumn(null)}
                    className="rounded-full px-4 py-2 font-data text-2xs text-fleece-dim transition-colors hover:text-fleece"
                  >
                    {group.name}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <Link
                to="/upcoming"
                data-cursor="link"
                className="rounded-full px-4 py-2 font-data text-2xs text-marigold transition-colors hover:text-fleece"
              >
                Upcoming
              </Link>
            </li>
            <li>
              <Link
                to="/offers"
                data-cursor="link"
                className="rounded-full px-4 py-2 font-data text-2xs text-fleece-dim transition-colors hover:text-fleece"
              >
                Offers
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            to="/search"
            data-cursor="link"
            aria-label="Search yarns"
            className="hidden items-center gap-3 rounded-full border border-border px-4 py-2 text-fleece-dim transition-colors hover:text-fleece md:flex"
          >
            <Search className="h-4 w-4" />
            <span className="font-data text-2xs">Search</span>
            <kbd className="font-data text-2xs text-fleece-dim/70">⌘K</kbd>
          </Link>
          <Link to="/search" className={cn(ICON_BTN, "md:hidden")} aria-label="Search yarns">
            <Search className="h-5 w-5" />
          </Link>
          <Link to="/account/wishlist" className={ICON_BTN} aria-label="Wishlist" data-cursor="link">
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            to="/account/notifications"
            className={ICON_BTN}
            aria-label="Notifications"
            data-cursor="link"
          >
            <Bell className="h-5 w-5" />
          </Link>
          <Link to="/account" className={ICON_BTN} aria-label="Account" data-cursor="link">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/cart" className={ICON_BTN} aria-label="Cart" data-cursor="link">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-madder px-1 font-data text-[10px] leading-none text-fleece">
              0
            </span>
          </Link>
        </div>
      </div>

      {/* desktop mega-menu panel */}
      {activeGroup && activeItems.length ? (
        <div
          className="absolute inset-x-0 top-full hidden px-6 pb-6 lg:block"
          onMouseEnter={() => setOpenColumn(activeGroup.slug)}
          onMouseLeave={() => setOpenColumn(null)}
        >
          <Glass variant="panel" refract className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-8">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
                <Link
                  to="/collections/$slug"
                  params={{ slug: activeGroup.slug }}
                  data-cursor="link"
                  className="border-b border-border pb-2 text-lg text-marigold transition-colors hover:text-fleece"
                >
                  All {activeGroup.name}
                </Link>
                {activeItems.map((item) => (
                  <Link
                    key={item.id}
                    to="/collections/$slug"
                    params={{ slug: item.slug }}
                    data-cursor="link"
                    className="border-b border-border pb-2 text-lg text-fleece-dim transition-colors hover:text-marigold"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="hidden w-64 shrink-0 flex-col justify-between md:flex">
                <p className="font-data text-2xs text-fleece-dim">Curated by hand</p>
                <p className="font-display text-2xl font-light text-fleece">
                  Small-batch colour, wound for stitch definition.
                </p>
              </div>
            </div>
          </Glass>
        </div>
      ) : null}

      {/* mobile drawer */}
      {menuOpen ? (
        <div className="border-t border-border px-4 pb-6 pt-4 lg:hidden">
          <nav aria-label="Mobile">
            <ul className="space-y-5">
              {groups.map((group) => (
                <li key={group.id}>
                  <Link
                    to="/collections/$slug"
                    params={{ slug: group.slug }}
                    onClick={() => setMenuOpen(false)}
                    className="font-data text-2xs text-marigold"
                  >
                    {group.name}
                  </Link>
                  <ul className="mt-2 space-y-2">
                    {(group.children ?? []).map((item) => (
                      <li key={item.id}>
                        <Link
                          to="/collections/$slug"
                          params={{ slug: item.slug }}
                          onClick={() => setMenuOpen(false)}
                          className="block text-lg text-fleece-dim"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              <li className="flex gap-4 pt-2">
                <Link
                  to="/upcoming"
                  onClick={() => setMenuOpen(false)}
                  className="font-data text-2xs text-marigold"
                >
                  Upcoming
                </Link>
                <Link
                  to="/offers"
                  onClick={() => setMenuOpen(false)}
                  className="font-data text-2xs text-fleece-dim"
                >
                  Offers
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
