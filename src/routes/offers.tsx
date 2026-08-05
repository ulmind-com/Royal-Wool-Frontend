import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Package2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataError, EmptyState, GridSkeleton } from "@/components/data-state";
import { CouponTicket } from "@/components/commerce/coupon-ticket";
import { useSettings } from "@/hooks/use-settings";
import { type Combo, comboIsLive, combosQuery } from "@/lib/api/catalog-extras";
import { activeCouponsQuery, productsQuery } from "@/lib/api/queries";
import type { Coupon, Product } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & bundles — Royal Wool" },
      {
        name: "description",
        content:
          "Live coupons and yarn bundles — build a bundle and the offer price applies at checkout.",
      },
      { property: "og:title", content: "Offers & bundles — Royal Wool" },
      { property: "og:description", content: "Live coupons and yarn bundles from Royal Wool." },
      { property: "og:url", content: "/offers" },
    ],
    links: [{ rel: "canonical", href: "/offers" }],
  }),
  component: OffersPage,
});

function OffersPage() {
  const coupons = useQuery(activeCouponsQuery);
  const combos = useQuery(combosQuery);
  const catalogue = useQuery(productsQuery({ limit: 200 }));

  const liveCombos = (combos.data ?? []).filter(comboIsLive);

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-20 pt-10 sm:px-6 sm:pb-28 sm:pt-16 lg:px-10">
      {/* ── Masthead ───────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-3xl border border-border px-6 py-12 sm:px-12 sm:py-16">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "color-mix(in oklab, var(--marigold) 22%, transparent)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full blur-3xl"
          style={{ background: "color-mix(in oklab, var(--indigo) 14%, transparent)" }}
          aria-hidden
        />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-marigold/40 px-3 py-1 font-data text-2xs uppercase tracking-[0.18em] text-marigold">
            <Sparkles className="h-3 w-3" /> Offers
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-light leading-[1.05] tracking-[-0.03em] text-foreground sm:text-6xl">
            Every saving we're running, on one shelf
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Coupons apply themselves at checkout — the best one always wins. Bundles are built
            here: pick your shades, add the set, and the bundle price lands on the bill.
          </p>
        </div>
      </header>

      {/* ── Bundles ────────────────────────────────────────────────── */}
      <section className="mt-14 sm:mt-20" aria-label="Yarn bundles">
        <SectionHead
          eyebrow="01 · Bundles"
          title="Build a bundle"
          note="Choose any set from a bundle's shades. The flat bundle price replaces the regular total at checkout."
        />

        <div className="mt-8">
          {combos.isPending || catalogue.isPending ? (
            <GridSkeleton count={2} ratio="aspect-[16/9]" />
          ) : combos.isError ? (
            <DataError error={combos.error} retry={() => void combos.refetch()} />
          ) : liveCombos.length ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {liveCombos.map((c) => (
                <BundleCard key={c.id} combo={c} catalogue={catalogue.data ?? []} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No bundles running right now"
              note="New bundles drop with each dye batch — coupons below still apply."
            />
          )}
        </div>
      </section>

      {/* ── Coupons ────────────────────────────────────────────────── */}
      <section className="mt-16 sm:mt-24" aria-label="Coupons">
        <SectionHead
          eyebrow="02 · Coupons"
          title="Codes on the rack"
          note="Nothing to type — checkout picks your best code on its own. Copy one if you'd rather share it."
        />

        <div className="mt-8">
          {coupons.isPending ? (
            <GridSkeleton count={3} ratio="aspect-[6/1]" />
          ) : coupons.isError ? (
            <DataError error={coupons.error} retry={() => void coupons.refetch()} />
          ) : coupons.data?.length ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.data.map((c) => (
                <li key={c.id}>
                  <CouponCard coupon={c} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No live coupons right now"
              note="Free delivery thresholds still apply on every order."
            />
          )}
        </div>
      </section>
    </div>
  );
}

function SectionHead({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return (
    <div className="max-w-2xl">
      <p className="font-data text-2xs uppercase tracking-[0.18em] text-marigold">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-light tracking-[-0.02em] text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

/* ── Bundle builder ───────────────────────────────────────────────── */

function BundleCard({ combo, catalogue }: { combo: Combo; catalogue: Product[] }) {
  const { formatMoney } = useSettings();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [picked, setPicked] = useState<string[]>([]);

  const eligible = useMemo(
    () => catalogue.filter((p) => (combo.product_ids ?? []).includes(p.id)),
    [catalogue, combo.product_ids],
  );

  const priceOf = (p: Product) => p.final_price ?? p.price;
  const need = combo.qty;
  const chosen = picked.length;
  const ready = chosen === need;

  // What the picked set would normally cost. Before anything is picked we show
  // the dearest qualifying set, so the headline saving is never overstated.
  const regular = ready
    ? picked.reduce((sum, id) => {
        const p = eligible.find((x) => x.id === id);
        return sum + (p ? priceOf(p) : 0);
      }, 0)
    : eligible
        .map(priceOf)
        .sort((a, b) => b - a)
        .slice(0, need)
        .reduce((sum, v) => sum + v, 0);
  const saving = Math.max(0, regular - combo.price);

  const toggle = (id: string) => {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= need) return [...prev.slice(1), id]; // oldest pick rolls off
      return [...prev, id];
    });
  };

  const addBundle = () => {
    picked.forEach((id) => {
      const p = eligible.find((x) => x.id === id);
      if (!p) return;
      addItem({
        productId: p.id,
        title: p.title,
        price: priceOf(p),
        qty: 1,
        image: p.images?.[0],
      });
    });
    setPicked([]);
    openCart();
    toast.success(`${combo.name} added — bundle price applies at checkout.`);
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-border">
      {/* head */}
      <div
        className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-6"
        style={{ background: "color-mix(in oklab, var(--marigold) 7%, transparent)" }}
      >
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-marigold/20 px-2.5 py-1 font-data text-2xs uppercase tracking-wider text-marigold">
            <Package2 className="h-3.5 w-3.5" /> Any {need}
          </span>
          <h3 className="mt-2.5 truncate font-display text-2xl font-light text-foreground">
            {combo.name}
          </h3>
          {combo.description ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {combo.description}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <p className="font-display text-3xl font-light leading-none text-foreground">
            {formatMoney(combo.price)}
          </p>
          {saving > 0 ? (
            <p className="mt-1.5 font-data text-2xs text-indigo">
              Save {formatMoney(saving)}
              <span className="ml-1.5 text-muted-foreground/70 line-through">
                {formatMoney(regular)}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      {/* picker */}
      <div className="flex-1 px-5 py-5 sm:px-6">
        {eligible.length ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="font-data text-2xs uppercase tracking-[0.14em] text-muted-foreground">
                Pick your shades
              </p>
              <p className="font-data text-2xs text-foreground">
                {chosen} / {need} chosen
              </p>
            </div>

            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-marigold transition-[width] duration-300"
                style={{ width: `${Math.min(100, (chosen / need) * 100)}%` }}
              />
            </div>

            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {eligible.map((p) => {
                const on = picked.includes(p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      data-cursor="link"
                      aria-pressed={on}
                      className={cn(
                        "group w-full overflow-hidden rounded-2xl border text-left transition-all",
                        on
                          ? "border-marigold shadow-[0_0_0_1px_var(--marigold)]"
                          : "border-border hover:border-marigold/60",
                      )}
                    >
                      <span className="relative block aspect-square overflow-hidden bg-secondary/40">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        ) : null}
                        <span
                          className={cn(
                            "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border transition-all",
                            on
                              ? "border-marigold bg-marigold text-ink"
                              : "border-border bg-background/80 text-transparent",
                          )}
                          aria-hidden
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </span>
                      <span className="block px-2.5 py-2">
                        <span className="line-clamp-2 text-2xs text-foreground">{p.title}</span>
                        <span className="mt-0.5 block font-data text-2xs text-muted-foreground">
                          {formatMoney(priceOf(p))}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            This bundle applies to qualifying yarns by weight — add any matching skeins and the
            price adjusts at checkout.
          </p>
        )}
      </div>

      {/* action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 sm:px-6">
        <p className="font-data text-2xs text-muted-foreground">
          {eligible.length
            ? ready
              ? `Bundle ready · ${formatMoney(combo.price)} at checkout`
              : `Choose ${need - chosen} more to unlock this price`
            : "Bundle price is applied automatically"}
        </p>

        {eligible.length ? (
          <button
            type="button"
            onClick={addBundle}
            disabled={!ready}
            data-cursor="link"
            className="sheen inline-flex shrink-0 items-center gap-2 rounded-full bg-madder px-5 py-2.5 font-data text-2xs text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Package2 className="h-3.5 w-3.5" /> Add bundle to bag
          </button>
        ) : (
          <Link
            to="/collections"
            data-cursor="link"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-5 py-2.5 font-data text-2xs text-foreground transition-colors hover:border-marigold hover:text-marigold"
          >
            Browse yarns
          </Link>
        )}
      </div>
    </article>
  );
}

/* ── Coupons ──────────────────────────────────────────────────────── */

function CouponCard({ coupon }: { coupon: Coupon }) {
  const { formatMoney } = useSettings();

  const headline =
    coupon.type === "percent" ? `${Math.round(coupon.value)}%` : formatMoney(coupon.value);

  const terms = [
    coupon.min_order ? `Min ${formatMoney(coupon.min_order)}` : null,
    coupon.max_discount ? `Up to ${formatMoney(coupon.max_discount)} off` : null,
    coupon.first_order_only ? "First order only" : null,
    coupon.valid_until ? `Till ${new Date(coupon.valid_until).toLocaleDateString("en-IN")}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <CouponTicket
      code={coupon.code}
      headline={headline}
      description={coupon.description || undefined}
      terms={terms || undefined}
      copyable
    />
  );
}
