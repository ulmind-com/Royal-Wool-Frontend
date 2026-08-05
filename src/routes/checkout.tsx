import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Banknote,
  CreditCard,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { useSettings } from "@/hooks/use-settings";
import { ApiError } from "@/lib/api/client";
import {
  type Bill,
  type OrderAddress,
  type OrderItemIn,
  codAvailability,
  loadRazorpay,
  placeOrder,
  quoteOrder,
  reverseGeocode,
  verifyPayment,
} from "@/lib/api/orders";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Royal Wool" },
      { name: "description", content: "Address, payment and order review in one page." },
      { property: "og:title", content: "Checkout — Royal Wool" },
      { property: "og:description", content: "Address, payment and order review." },
      { property: "og:url", content: "/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: CheckoutPage,
});

const EMPTY: OrderAddress = {
  tag: "Home",
  name: "",
  house: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  lat: null,
  lng: null,
};

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { formatMoney, codEnabled } = useSettings();
  const { user, isAuthenticated, setLoginModalOpen } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [address, setAddress] = useState<OrderAddress>(EMPTY);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [method, setMethod] = useState<"online" | "cod">("online");
  const [cod, setCod] = useState<{ available: boolean; reason?: string }>({ available: false });

  const [bill, setBill] = useState<Bill | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [paying, setPaying] = useState(false);

  const saved: OrderAddress[] = useMemo(() => (user?.addresses ?? []) as OrderAddress[], [user]);

  const orderItems: OrderItemIn[] = useMemo(
    () =>
      items.map((i) => ({
        product_id: i.productId,
        qty: i.qty,
        color: i.color,
        size: i.size,
      })),
    [items],
  );

  const cartTotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const cartCount = items.reduce((sum, i) => sum + i.qty, 0);

  // Prefill from the signed-in profile, preferring a saved address.
  useEffect(() => {
    if (!user) return;
    setAddress((prev) => {
      if (prev.house || prev.pincode) return prev;
      const first = (user.addresses ?? [])[0] as OrderAddress | undefined;
      if (first) {
        setSavedIndex(0);
        return {
          ...EMPTY,
          ...first,
          name: first.name || user.name || "",
          phone: first.phone || user.phone || "",
        };
      }
      return { ...EMPTY, name: user.name ?? "", phone: user.phone ?? "" };
    });
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    codAvailability()
      .then(setCod)
      .catch(() => setCod({ available: false }));
  }, [isAuthenticated]);

  const complete =
    address.name.trim() !== "" &&
    address.house.trim() !== "" &&
    address.city.trim() !== "" &&
    address.state.trim() !== "" &&
    /^\d{6}$/.test(address.pincode.trim()) &&
    /^\+?\d{10,13}$/.test(address.phone.replace(/\s/g, ""));

  // Re-quote whenever the address or coupon settles — debounced, latest wins.
  const quoteSeq = useRef(0);
  useEffect(() => {
    if (!isAuthenticated || !complete || orderItems.length === 0) {
      setBill(null);
      return;
    }
    const seq = ++quoteSeq.current;
    setQuoting(true);
    const timer = setTimeout(() => {
      quoteOrder(orderItems, address, appliedCoupon)
        .then((b) => {
          if (seq !== quoteSeq.current) return;
          setBill(b);
          setQuoteError(b.deliverable ? null : "We don't deliver to this pincode yet.");
        })
        .catch((err: unknown) => {
          if (seq !== quoteSeq.current) return;
          setBill(null);
          setQuoteError(err instanceof ApiError ? err.message : "Could not price this order.");
        })
        .finally(() => {
          if (seq === quoteSeq.current) setQuoting(false);
        });
    }, 500);
    return () => clearTimeout(timer);
  }, [address, appliedCoupon, orderItems, isAuthenticated, complete]);

  const set = (patch: Partial<OrderAddress>) => {
    setSavedIndex(null);
    setAddress((prev) => ({ ...prev, ...patch }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Your browser can't share a location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const found = await reverseGeocode(coords.latitude, coords.longitude);
          setSavedIndex(null);
          setAddress((prev) => ({
            ...prev,
            house: found.house || prev.house,
            area: found.area || prev.area,
            city: found.city || prev.city,
            state: found.state || prev.state,
            pincode: found.pincode || prev.pincode,
            lat: coords.latitude,
            lng: coords.longitude,
          }));
          toast.success("Address filled from your location 📍");
        } catch {
          toast.error("Couldn't read an address from that location.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast.error("Location permission denied.");
      },
      { enableHighAccuracy: true, timeout: 12_000 },
    );
  };

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    setAppliedCoupon(code || null);
    if (code) toast.success(`Coupon ${code} applied to the bill.`);
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    if (!complete) {
      toast.error("Please complete the delivery address and phone number.");
      return;
    }
    setPaying(true);
    try {
      const created = await placeOrder(orderItems, address, method, appliedCoupon);

      if (created.payment_method === "cod") {
        clearCart();
        toast.success("Order confirmed — pay on delivery 🎉");
        navigate({ to: "/order/$id/success", params: { id: created.order_id } });
        return;
      }

      const ready = await loadRazorpay();
      if (!ready) throw new Error("Payment window failed to load. Check your connection.");

      const Razorpay = (
        window as unknown as {
          Razorpay: new (o: unknown) => {
            open: () => void;
            on: (e: string, cb: (r: unknown) => void) => void;
          };
        }
      ).Razorpay;

      const rzp = new Razorpay({
        key: created.key_id,
        amount: created.amount,
        currency: created.currency,
        order_id: created.razorpay_order_id,
        name: "Royal Wool",
        description: `${cartCount} item(s) · order ${created.order_id.slice(-8)}`,
        prefill: created.prefill,
        notes: { order_id: created.order_id },
        theme: { color: "#C6402E" },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast.info("Payment cancelled — your order is still waiting.");
          },
        },
        handler: async (response: RazorpayResponse) => {
          try {
            await verifyPayment({
              order_id: created.order_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            toast.success("Payment successful — order confirmed 🎉");
            navigate({ to: "/order/$id/success", params: { id: created.order_id } });
          } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "We couldn't verify that payment.");
          } finally {
            setPaying(false);
          }
        },
      });
      rzp.on("payment.failed", () => {
        setPaying(false);
        toast.error("Payment failed. No money was taken — please try again.");
      });
      rzp.open();
    } catch (err) {
      setPaying(false);
      toast.error(err instanceof ApiError ? err.message : (err as Error).message);
    }
  };

  if (!isAuthenticated) {
    return (
      <Gate
        title="Sign in to check out"
        body="Your bag is saved. Sign in and we'll carry it straight to payment."
        action={
          <button
            type="button"
            onClick={() => setLoginModalOpen(true)}
            className="sheen inline-flex items-center gap-2 rounded-full bg-madder px-6 py-3 font-data text-2xs text-primary-foreground"
          >
            <Lock className="h-4 w-4" /> Sign in to continue
          </button>
        }
      />
    );
  }

  if (items.length === 0) {
    return (
      <Gate
        title="Nothing to check out yet"
        body="Add a skein or two and the checkout will open up."
        action={
          <Link
            to="/collections"
            className="sheen inline-flex items-center gap-2 rounded-full bg-madder px-6 py-3 font-data text-2xs text-primary-foreground"
          >
            Browse the catalogue
          </Link>
        }
      />
    );
  }

  const payDisabled = paying || !complete || !bill || !bill.deliverable || quoting;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-8 sm:px-6 lg:px-10">
      <header className="border-b border-border pb-5">
        <p className="font-data text-2xs uppercase tracking-[0.2em] text-marigold">Checkout</p>
        <h1 className="mt-1.5 font-display text-3xl font-light text-foreground sm:text-4xl">
          Address, then payment
        </h1>
        <p className="mt-2 font-data text-2xs text-muted-foreground">
          {cartCount} item{cartCount > 1 ? "s" : ""} · secured by Razorpay
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
        {/* ── Left: address + payment ───────────────────────────────── */}
        <div className="space-y-6">
          {saved.length > 0 ? (
            <Section icon={<MapPin className="h-4 w-4" />} title="Saved addresses">
              <div className="grid gap-2 sm:grid-cols-2">
                {saved.map((a, i) => (
                  <button
                    key={`${a.pincode}-${i}`}
                    type="button"
                    onClick={() => {
                      setSavedIndex(i);
                      setAddress({
                        ...EMPTY,
                        ...a,
                        name: a.name || user?.name || "",
                        phone: a.phone || user?.phone || "",
                      });
                    }}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-colors",
                      savedIndex === i
                        ? "border-madder bg-madder/5"
                        : "border-border hover:border-madder/50",
                    )}
                  >
                    <span className="font-data text-2xs uppercase tracking-wider text-marigold">
                      {a.tag || "Home"}
                    </span>
                    <p className="mt-1 line-clamp-2 text-xs text-foreground">
                      {[a.house, a.area, a.city].filter(Boolean).join(", ")}
                    </p>
                    <p className="mt-0.5 font-data text-2xs text-muted-foreground">
                      {a.pincode} {a.phone ? `· ${a.phone}` : ""}
                    </p>
                  </button>
                ))}
              </div>
            </Section>
          ) : null}

          <Section
            icon={<Truck className="h-4 w-4" />}
            title="Delivery address"
            action={
              <button
                type="button"
                onClick={useMyLocation}
                disabled={locating}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-indigo px-3 py-1.5 font-data text-2xs text-indigo transition-colors hover:bg-indigo hover:text-fleece disabled:opacity-50"
              >
                {locating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LocateFixed className="h-3.5 w-3.5" />
                )}
                Use my location
              </button>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Full name"
                value={address.name}
                onChange={(v) => set({ name: v })}
                placeholder="Ananya Sen"
              />
              <Field
                label="Mobile number"
                value={address.phone}
                onChange={(v) => set({ phone: v.replace(/[^\d+]/g, "").slice(0, 13) })}
                placeholder="9876543210"
                inputMode="tel"
              />
              <Field
                label="House / Flat / Block"
                value={address.house}
                onChange={(v) => set({ house: v })}
                placeholder="12B, Jasmine Apartments"
                className="sm:col-span-2"
              />
              <Field
                label="Area / Road / Landmark"
                value={address.area}
                onChange={(v) => set({ area: v })}
                placeholder="Ballygunge Circular Road"
                className="sm:col-span-2"
              />
              <Field
                label="City"
                value={address.city}
                onChange={(v) => set({ city: v })}
                placeholder="Kolkata"
              />
              <Field
                label="State"
                value={address.state}
                onChange={(v) => set({ state: v })}
                placeholder="West Bengal"
              />
              <Field
                label="Pincode"
                value={address.pincode}
                onChange={(v) => set({ pincode: v.replace(/\D/g, "").slice(0, 6) })}
                placeholder="700019"
                inputMode="numeric"
              />
              <div>
                <span className="font-data text-2xs uppercase tracking-wider text-muted-foreground">
                  Address type
                </span>
                <div className="mt-1.5 flex gap-2">
                  {["Home", "Work", "Other"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => set({ tag })}
                      className={cn(
                        "rounded-full border px-3 py-1.5 font-data text-2xs transition-colors",
                        address.tag === tag
                          ? "border-madder bg-madder text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-madder/50",
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {address.lat != null ? (
              <p className="mt-3 inline-flex items-center gap-1.5 font-data text-2xs text-indigo">
                <BadgeCheck className="h-3.5 w-3.5 shrink-0" /> Pinned to your exact coordinates —
                delivery fee is distance-accurate.
              </p>
            ) : null}
          </Section>

          <Section icon={<CreditCard className="h-4 w-4" />} title="Payment method">
            <div className="grid gap-3 sm:grid-cols-2">
              <PayOption
                active={method === "online"}
                onClick={() => setMethod("online")}
                icon={<CreditCard className="h-4 w-4" />}
                title="Pay online"
                body="UPI, cards, net banking & wallets via Razorpay."
              />
              <PayOption
                active={method === "cod"}
                onClick={() => cod.available && setMethod("cod")}
                disabled={!cod.available || !codEnabled}
                icon={<Banknote className="h-4 w-4" />}
                title="Cash on delivery"
                body={
                  cod.available
                    ? "Pay the courier when it arrives."
                    : cod.reason || "Not available right now."
                }
              />
            </div>
          </Section>
        </div>

        {/* ── Right: order summary ──────────────────────────────────── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="border-b border-border px-4 py-3">
              <h2 className="font-display text-lg font-light text-foreground">Order summary</h2>
            </div>

            <ul className="max-h-[330px] divide-y divide-border overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 p-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs text-foreground">{item.title}</p>
                    <p className="mt-0.5 font-data text-2xs text-muted-foreground">
                      {[item.color, item.size].filter(Boolean).join(" · ") || "Default"} · Qty{" "}
                      {item.qty}
                    </p>
                  </div>
                  <span className="shrink-0 font-data text-xs text-foreground">
                    {formatMoney(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="min-w-0 flex-1 rounded-full border border-border bg-transparent px-3.5 py-2 font-data text-base sm:text-2xs uppercase tracking-wider text-foreground outline-none focus:border-marigold"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="shrink-0 rounded-full border border-marigold px-4 py-2 font-data text-2xs text-marigold transition-colors hover:bg-marigold hover:text-ink"
                >
                  Apply
                </button>
              </div>

              <dl className="mt-4 space-y-2 font-data text-2xs">
                <Row label="Subtotal" value={formatMoney(bill?.subtotal ?? cartTotal)} />
                {bill && bill.discount > 0 ? (
                  <Row
                    label={`Discount${appliedCoupon ? ` (${appliedCoupon})` : ""}`}
                    value={`− ${formatMoney(bill.discount)}`}
                    tone="good"
                  />
                ) : null}
                <Row
                  label={
                    bill?.distance_km != null
                      ? `Delivery · ${bill.distance_km.toFixed(1)} km`
                      : "Delivery"
                  }
                  value={!bill ? "—" : bill.delivery_free ? "Free" : formatMoney(bill.delivery)}
                  {...(bill?.delivery_free ? { tone: "good" as const } : {})}
                />
                <Row label="GST" value={bill ? formatMoney(bill.tax) : "—"} />
              </dl>

              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="font-display text-sm text-foreground">Total payable</span>
                <span className="font-display text-xl text-foreground">
                  {quoting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-marigold" />
                  ) : (
                    formatMoney(bill?.total ?? cartTotal)
                  )}
                </span>
              </div>

              {!complete ? (
                <p className="mt-3 font-data text-2xs text-muted-foreground">
                  Fill in the delivery address to see final delivery and GST.
                </p>
              ) : null}
              {quoteError ? (
                <p className="mt-3 font-data text-2xs text-madder">{quoteError}</p>
              ) : null}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={payDisabled}
                className="sheen mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-madder px-5 py-3.5 font-data text-2xs text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {paying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Opening payment…
                  </>
                ) : method === "cod" ? (
                  <>
                    <Banknote className="h-4 w-4" /> Place order · Pay on delivery
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Pay {formatMoney(bill?.total ?? cartTotal)} securely
                  </>
                )}
              </button>

              <p className="mt-3 inline-flex items-center gap-1.5 font-data text-2xs text-muted-foreground/80">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-indigo" /> 256-bit encrypted ·
                UPI, cards, net banking supported
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-light text-foreground">
          <span className="text-marigold">{icon}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  inputMode?: "tel" | "numeric" | "text";
}) {
  return (
    <label className={cn("block", className)}>
      <span className="font-data text-2xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        {...(inputMode ? { inputMode } : {})}
        className="mt-1.5 w-full rounded-xl border border-border bg-transparent px-3.5 py-2.5 text-base sm:text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-marigold"
      />
    </label>
  );
}

function PayOption({
  active,
  onClick,
  disabled,
  icon,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-xl border p-4 text-left transition-colors disabled:opacity-45",
        active ? "border-madder bg-madder/5" : "border-border hover:border-madder/50",
      )}
    >
      <span className="inline-flex items-center gap-2 font-display text-sm text-foreground">
        <span className={active ? "text-madder" : "text-muted-foreground"}>{icon}</span>
        {title}
      </span>
      <p className="mt-1.5 font-data text-2xs text-muted-foreground">{body}</p>
    </button>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "good" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={tone === "good" ? "text-indigo" : "text-foreground"}>{value}</dd>
    </div>
  );
}

function Gate({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-border text-marigold">
        <Lock className="h-6 w-6" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-light text-foreground">{title}</h1>
      <p className="mt-2 max-w-sm font-data text-2xs leading-relaxed text-muted-foreground">
        {body}
      </p>
      <div className="mt-6">{action}</div>
    </div>
  );
}
