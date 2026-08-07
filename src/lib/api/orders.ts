import { apiFetch } from "@/lib/api/client";

/**
 * Checkout + order tracking wire types. Every money field is server-computed —
 * the client never adds up a bill of its own, it only renders what /orders/quote
 * and /orders return.
 */

export interface OrderAddress {
  tag: string;
  name: string;
  house: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  lat?: number | null;
  lng?: number | null;
}

export interface OrderItemIn {
  product_id: string;
  qty: number;
  color?: string | undefined;
  size?: string | undefined;
}

export interface Bill {
  subtotal: number;
  discount: number;
  delivery: number;
  delivery_free: boolean;
  delivery_free_reason?: "coupon" | "threshold" | null;
  distance_km: number | null;
  deliverable: boolean;
  tax: number;
  gst?: {
    total: number;
    interstate: boolean;
    cgst: number;
    sgst: number;
    igst: number;
  };
  total: number;
  currency: string;
  currency_code: string;
  coupon_applied: boolean;
}

export interface CreatedOrder {
  order_id: string;
  payment_method: "online" | "cod";
  status?: string;
  bill: Bill;
  razorpay_order_id?: string;
  amount?: number;
  currency?: string;
  key_id?: string;
  prefill?: { name?: string; contact?: string; email?: string };
}

export interface OrderRecord {
  id?: string;
  _id?: string;
  status: string;
  amount: number;
  items: Array<{ title: string; qty: number; price?: number; image?: string }>;
  address: OrderAddress;
  payment_method: string;
  razorpay_payment_id?: string | null;
  created_at?: string;
}

export interface CodAvailability {
  available: boolean;
  reason?: string;
}

const body = (items: OrderItemIn[], address: OrderAddress, coupon_code?: string | null) => ({
  items,
  address,
  payment_method: "online",
  coupon_code: coupon_code || null,
});

export function quoteOrder(items: OrderItemIn[], address: OrderAddress, coupon?: string | null) {
  return apiFetch<Bill>("/orders/quote", { method: "POST", json: body(items, address, coupon) });
}

export function placeOrder(
  items: OrderItemIn[],
  address: OrderAddress,
  paymentMethod: "online" | "cod",
  coupon?: string | null,
) {
  return apiFetch<CreatedOrder>("/orders", {
    method: "POST",
    json: { ...body(items, address, coupon), payment_method: paymentMethod },
  });
}

export function verifyPayment(payload: {
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  return apiFetch<{ status: string; order_id: string }>("/orders/verify", {
    method: "POST",
    json: payload,
  });
}

export const codAvailability = () => apiFetch<CodAvailability>("/orders/cod-availability");
export const myOrders = () => apiFetch<OrderRecord[]>("/orders");
export const getOrder = (id: string) => apiFetch<OrderRecord>(`/orders/${id}`);

export const downloadInvoice = async (id: string) => {
  const token = localStorage.getItem("rw_token");
  const base = import.meta.env.VITE_API_URL || "https://royal-wool-backend.onrender.com";
  const res = await fetch(`${base}/orders/${id}/invoice`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Could not download invoice");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoice_Royal_Wool_${id.slice(-8).toUpperCase()}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Razorpay's own checkout widget — loaded once, only in the browser. */
let rzpPromise: Promise<boolean> | null = null;

export function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve(true);
  if (rzpPromise) return rzpPromise;

  rzpPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      rzpPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return rzpPromise;
}

/**
 * Reverse-geocodes browser coordinates into a fillable Indian address.
 * OpenStreetMap's Nominatim needs no key and is fine at checkout volume.
 */
export async function reverseGeocode(lat: number, lng: number) {
  const lookup = async (zoom: number) => {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1` +
      `&zoom=${zoom}&accept-language=en&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("Could not read that location");
    return (await res.json()) as {
      address?: Record<string, string>;
      display_name?: string;
    };
  };

  // zoom=18 is building level — the only zoom that reliably carries a house
  // number and a postcode. Where OSM has no postcode on the building we widen
  // to the suburb (zoom 14), which almost always does.
  const fine = await lookup(18);
  let a = fine.address ?? {};
  if (!a["postcode"] || !(a["city"] || a["town"] || a["village"])) {
    try {
      const coarse = await lookup(14);
      a = { ...(coarse.address ?? {}), ...a };
      if (!a["postcode"] && coarse.address?.["postcode"]) a["postcode"] = coarse.address["postcode"];
    } catch {
      /* the fine result is still usable on its own */
    }
  }

  return {
    house: [a["house_number"], a["building"], a["amenity"]].filter(Boolean).join(", "),
    area: [a["road"], a["neighbourhood"], a["suburb"], a["village"]].filter(Boolean).join(", "),
    city:
      a["city"] ||
      a["town"] ||
      a["municipality"] ||
      a["city_district"] ||
      a["village"] ||
      a["state_district"] ||
      a["county"] ||
      "",
    state: a["state"] || "",
    pincode: (a["postcode"] || "").replace(/\s/g, ""),
    label: fine.display_name ?? "",
  };
}

/** Self-service cancellation — the server enforces the admin's time window. */
export const cancelOrder = (orderId: string) =>
  apiFetch<{ status: string; refund: boolean }>(`/orders/${orderId}/cancel`, { method: "POST" });
