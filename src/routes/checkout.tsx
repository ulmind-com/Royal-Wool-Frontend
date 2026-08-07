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
import { ApiError, apiFetch } from "@/lib/api/client";
import {
  type CouponOffer,
  applicableCoupons,
} from "@/lib/api/catalog-extras";
import {
  type Bill,
  type OrderAddress,
  type OrderItemIn,
  loadRazorpay,
  placeOrder,
  quoteOrder,
  reverseGeocode,
  verifyPayment,
} from "@/lib/api/orders";
import { CouponTicket } from "@/components/commerce/coupon-ticket";
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

/** GST and the delivery slab both key off this, so it must be a real state —
 *  free text like "India" would silently price the order as interstate. */
const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

/** First two digits of an Indian PIN pin down the postal circle. Used only to
 *  warn on a state/pincode mismatch — a wrong state silently flips CGST+SGST to
 *  IGST and swaps the delivery slab. */
const PIN_PREFIX_STATES: Record<string, string[]> = {
  "11": ["Delhi"],
  "12": ["Haryana"], "13": ["Haryana"],
  "14": ["Punjab"], "15": ["Punjab"], "16": ["Punjab", "Chandigarh", "Haryana"],
  "17": ["Himachal Pradesh"],
  "18": ["Jammu and Kashmir"], "19": ["Jammu and Kashmir", "Ladakh"],
  "20": ["Uttar Pradesh"], "21": ["Uttar Pradesh"], "22": ["Uttar Pradesh"],
  "23": ["Uttar Pradesh"], "27": ["Uttar Pradesh"], "28": ["Uttar Pradesh"],
  "24": ["Uttar Pradesh", "Uttarakhand"], "25": ["Uttar Pradesh", "Uttarakhand"],
  "26": ["Uttar Pradesh", "Uttarakhand"],
  "30": ["Rajasthan"], "31": ["Rajasthan"], "32": ["Rajasthan"], "33": ["Rajasthan"],
  "34": ["Rajasthan"],
  "36": ["Gujarat"], "37": ["Gujarat"], "38": ["Gujarat"],
  "39": ["Gujarat", "Dadra and Nagar Haveli and Daman and Diu"],
  "40": ["Maharashtra"], "41": ["Maharashtra"], "42": ["Maharashtra"], "43": ["Maharashtra"],
  "44": ["Maharashtra"],
  "45": ["Madhya Pradesh"], "46": ["Madhya Pradesh"], "47": ["Madhya Pradesh"],
  "48": ["Madhya Pradesh", "Chhattisgarh"], "49": ["Chhattisgarh", "Madhya Pradesh"],
  "50": ["Telangana"], "51": ["Andhra Pradesh"], "52": ["Andhra Pradesh", "Telangana"],
  "53": ["Andhra Pradesh"],
  "56": ["Karnataka"], "57": ["Karnataka"], "58": ["Karnataka"], "59": ["Karnataka"],
  "60": ["Tamil Nadu", "Puducherry"], "61": ["Tamil Nadu"], "62": ["Tamil Nadu"], "63": ["Tamil Nadu"],
  "64": ["Tamil Nadu"],
  "67": ["Kerala"], "68": ["Kerala"], "69": ["Kerala", "Lakshadweep"],
  "70": ["West Bengal"], "71": ["West Bengal"], "72": ["West Bengal"],
  "73": ["West Bengal", "Sikkim"], "74": ["West Bengal", "Andaman and Nicobar Islands"],
  "75": ["Odisha"], "76": ["Odisha"], "77": ["Odisha"],
  "78": ["Assam"],
  "79": ["Arunachal Pradesh", "Meghalaya", "Manipur", "Mizoram", "Nagaland", "Tripura"],
  "80": ["Bihar"], "81": ["Bihar"], "82": ["Bihar", "Jharkhand"],
  "83": ["Jharkhand"], "84": ["Bihar"], "85": ["Bihar"],
};

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { formatMoney, codEnabled } = useSettings();
  const { user, isAuthenticated, setLoginModalOpen, setUser } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const [address, setAddress] = useState<OrderAddress>(EMPTY);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const method = "online";

  const [bill, setBill] = useState<Bill | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [couponNote, setCouponNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [offers, setOffers] = useState<CouponOffer[]>([]);
  const [couponTouched, setCouponTouched] = useState(false);
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

  // Before the address is complete there is no server quote yet — still show
  // what the applied coupon takes off, so the total reflects the saving.
  const appliedOffer = offers.find((o) => o.code === appliedCoupon);
  const shownDiscount = bill ? bill.discount : (appliedOffer?.discount ?? 0);
  const shownTotal = bill ? bill.total : Math.max(0, cartTotal - shownDiscount);

  // Prefill from the signed-in profile, preferring a saved address.
  useEffect(() => {
    if (!user) return;
    setAddress((prev) => {
      if (prev.house || prev.pincode) return prev;
      const list = (user.addresses ?? []) as OrderAddress[];
      const first = list[list.length - 1];
      if (first) {
        setSavedIndex(list.length - 1);
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

  // Pull the live coupon pool and auto-apply the best saving, unless the
  // shopper has already picked (or cleared) a code themselves.
  useEffect(() => {
    if (!isAuthenticated || cartTotal <= 0) return;
    applicableCoupons(cartTotal)
      .then((r) => {
        setOffers(r.offers ?? []);
        if (couponTouched || !r.best_code) return;
        setAppliedCoupon(r.best_code);
        setCouponNote({
          ok: true,
          text: `Best offer ${r.best_code} applied automatically — you save ${formatMoney(r.best_discount)}.`,
        });
      })
      .catch(() => setOffers([]));
  }, [isAuthenticated, cartTotal, couponTouched, formatMoney]);

  // Auto-pin on arrival: no saved address means the shopper would otherwise have
  // to type a city/state we can read off their coordinates. State drives both the
  // delivery slab (West Bengal vs rest of India) and CGST+SGST vs IGST, so the
  // whole bill settles without a single tap.
  const autoLocated = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || autoLocated.current) return;
    if (address.pincode || address.city || saved.length) return;
    autoLocated.current = true;

    const run = () => locate(true);
    if (!navigator.permissions?.query) {
      run();
      return;
    }
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        if (status.state !== "denied") run();
      })
      .catch(() => run());
    // Runs once per checkout visit; `locate` is stable enough for that intent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, saved.length]);



  // Pricing only needs somewhere to ship to — state + a valid pincode (plus the
  // GPS pin when we have one). The phone is an order requirement, not a pricing
  // one, so the bill lands the moment the location is known.
  const quotable =
    address.state.trim() !== "" && /^\d{6}$/.test(address.pincode.trim());

  // A pincode that belongs to another circle means the state (and therefore the
  // whole tax + delivery calculation) is almost certainly wrong.
  const pinStates = PIN_PREFIX_STATES[address.pincode.trim().slice(0, 2)];
  const pinMismatch =
    quotable && !!pinStates && !pinStates.includes(address.state.trim());

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
    if (!isAuthenticated || !quotable || orderItems.length === 0) {
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
  }, [address, appliedCoupon, orderItems, isAuthenticated, quotable]);

  const [savingAddress, setSavingAddress] = useState(false);

  // Same house + pincode already in the book means there is nothing to save.
  const alreadySaved = saved.some(
    (a) =>
      a.pincode.trim() === address.pincode.trim() &&
      a.house.trim().toLowerCase() === address.house.trim().toLowerCase(),
  );

  /** Keep this address on the profile so the next checkout picks it up on its own. */
  const saveAddress = async (silent = false) => {
    if (!complete || alreadySaved) return;
    if (!silent) setSavingAddress(true);
    try {
      const updated = await apiFetch<typeof user>("/auth/me", {
        method: "PATCH",
        json: { addresses: [...saved, address] },
      });
      if (updated) setUser(updated);
      setSavedIndex(saved.length);
      if (!silent) toast.success("Address saved — we'll pick it next time.");
    } catch (err) {
      if (!silent) toast.error(err instanceof ApiError ? err.message : "Couldn't save that address.");
    } finally {
      if (!silent) setSavingAddress(false);
    }
  };

  const set = (patch: Partial<OrderAddress>) => {
    setSavedIndex(null);
    setAddress((prev) => ({ ...prev, ...patch }));
  };

  /** Pin the shopper by GPS and fill the address from those coordinates.
   *  `silent` is used by the automatic detection on load — it must never
   *  scold someone who simply dismissed the browser prompt. */
  const locate = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) toast.error("Your browser can't share a location.");
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
          if (!silent) toast.success("Address filled from your location 📍");
        } catch {
          if (!silent) toast.error("Couldn't read an address from that location.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        if (!silent) toast.error("Location permission denied.");
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  };

  const useMyLocation = () => locate(false);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    if (!complete) {
      toast.error("Please complete the delivery address and phone number.");
      return;
    }
    // Ordering from an address is the strongest signal it is a real one — keep
    // it on the profile so the next checkout opens pre-filled.
    void saveAddress(true);

    setPaying(true);
    try {
      const created = await placeOrder(orderItems, address, method, appliedCoupon);



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
            toast.info("Payment cancelled — complete payment to place your order.");
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
                {locating ? "Locating…" : "Use my location"}
              </button>
            }
          >
            {locating ? (
              <p className="mb-3 inline-flex items-center gap-1.5 font-data text-2xs text-indigo">
                <Loader2 className="h-3 w-3 animate-spin" /> Detecting your location to price
                delivery and GST…
              </p>
            ) : null}
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
              <label className="block">
                <span className="font-data text-2xs uppercase tracking-wider text-muted-foreground">
                  State
                </span>
                <select
                  value={INDIAN_STATES.includes(address.state) ? address.state : ""}
                  onChange={(e) => set({ state: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-border bg-transparent px-3.5 py-2.5 text-base sm:text-sm text-foreground outline-none transition-colors focus:border-marigold"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </label>
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

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              {address.lat != null ? (
                <p className="inline-flex items-center gap-1.5 font-data text-2xs text-indigo">
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0" /> Pinned to your exact coordinates.
                </p>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={() => void saveAddress(false)}
                disabled={!complete || alreadySaved || savingAddress}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-data text-2xs text-foreground transition-colors hover:border-marigold hover:text-marigold disabled:opacity-50"
              >
                {savingAddress ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : alreadySaved ? (
                  <BadgeCheck className="h-3.5 w-3.5" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" />
                )}
                {alreadySaved ? "Saved to your address book" : "Save this address"}
              </button>
            </div>
          </Section>

          <Section icon={<CreditCard className="h-4 w-4" />} title="Payment method">
            <div className="grid gap-3 sm:grid-cols-1">
              <PayOption
                active={true}
                onClick={() => {}}
                icon={<CreditCard className="h-4 w-4" />}
                title="Pay online"
                body="UPI, cards, net banking & wallets via Razorpay."
              />
            </div>
          </Section>
        </div>

        {/* ── Right: order summary ──────────────────────────────────── */}
        <aside className="lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="border-b border-border px-4 py-3">
              <h2 className="font-display text-lg font-light text-foreground">Order summary</h2>
            </div>

            <ul className="divide-y divide-border">
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
              {couponNote ? (
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      "font-data text-2xs",
                      couponNote.ok ? "text-indigo" : "text-madder",
                    )}
                  >
                    {couponNote.text}
                  </p>
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCouponTouched(true);
                        setAppliedCoupon(null);
                        setCouponNote(null);
                      }}
                      data-cursor="link"
                      className="shrink-0 font-data text-2xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ) : null}

              {offers.length ? (
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-data text-2xs uppercase tracking-[0.14em] text-muted-foreground">
                      Available coupons
                    </p>
                    <Link
                      to="/offers"
                      data-cursor="link"
                      className="font-data text-2xs text-marigold transition-opacity hover:opacity-70"
                    >
                      See all
                    </Link>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {offers.slice(0, 4).map((o) => (
                      <li key={o.code}>
                        <CouponTicket
                          code={o.code}
                          headline={
                            o.type === "percent"
                              ? `${Math.round(o.value)}%`
                              : formatMoney(o.value)
                          }
                          description={o.description || undefined}
                          terms={
                            o.applicable
                              ? `You save ${formatMoney(o.discount)}`
                              : `Add ${formatMoney(o.needed_more)} to unlock`
                          }
                          locked={!o.applicable}
                          applied={appliedCoupon === o.code}
                          actionLabel={appliedCoupon === o.code ? "Applied" : "Apply"}
                          onAction={() => {
                            setCouponTouched(true);
                            setAppliedCoupon(o.code);
                            setCouponNote({
                              ok: true,
                              text: `${o.code} applied — you save ${formatMoney(o.discount)}.`,
                            });
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <dl className="mt-4 space-y-2 font-data text-2xs">
                <Row label="Subtotal" value={formatMoney(bill?.subtotal ?? cartTotal)} />
                {shownDiscount > 0 ? (
                  <Row
                    label={`Discount${appliedCoupon ? ` (${appliedCoupon})` : ""}`}
                    value={`− ${formatMoney(shownDiscount)}`}
                    tone="good"
                  />
                ) : null}
                <Row
                  label={
                    bill?.distance_km != null
                      ? `Delivery · ${bill.distance_km.toFixed(1)} km`
                      : "Delivery"
                  }
                  value={
                    !bill
                      ? "Add address"
                      : bill.delivery_free
                        ? bill.delivery_free_reason === "coupon"
                          ? `Free · ${appliedCoupon ?? "coupon"}`
                          : "Free"
                        : formatMoney(bill.delivery)
                  }
                  {...(bill?.delivery_free ? { tone: "good" as const } : {})}
                />
                {bill?.gst && !bill.gst.interstate && bill.gst.total > 0 ? (
                  <>
                    <Row label="CGST" value={formatMoney(bill.gst.cgst)} />
                    <Row label="SGST" value={formatMoney(bill.gst.sgst)} />
                  </>
                ) : bill?.gst?.interstate && bill.gst.total > 0 ? (
                  <Row label="IGST" value={formatMoney(bill.gst.igst)} />
                ) : (
                  <Row label="GST" value={bill ? formatMoney(bill.tax) : "Add address"} />
                )}
              </dl>

              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                <span className="font-display text-sm text-foreground">Total payable</span>
                <span className="font-display text-xl text-foreground">
                  {quoting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-marigold" />
                  ) : (
                    formatMoney(shownTotal)
                  )}
                </span>
              </div>

              {pinMismatch ? (
                <p className="mt-3 font-data text-2xs text-madder">
                  Pincode {address.pincode} belongs to {pinStates?.join(" / ")} — check the state,
                  it decides your GST and delivery.
                </p>
              ) : null}
              {!quotable ? (
                <p className="mt-3 font-data text-2xs text-muted-foreground">
                  Add your city, state and pincode to see delivery and GST.
                </p>
              ) : !complete ? (
                <p className="mt-3 font-data text-2xs text-muted-foreground">
                  Add your name and mobile number to place the order.
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
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Pay {formatMoney(shownTotal)} securely
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
