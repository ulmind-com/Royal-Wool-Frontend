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
  distance_km: number | null;
  deliverable: boolean;
  tax: number;
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
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Could not read that location");
  const data = (await res.json()) as {
    address?: Record<string, string>;
    display_name?: string;
  };
  const a = data.address ?? {};
  return {
    house: [a["house_number"], a["building"], a["amenity"]].filter(Boolean).join(", "),
    area: [a["road"], a["neighbourhood"], a["suburb"]].filter(Boolean).join(", "),
    city: a["city"] || a["town"] || a["village"] || a["county"] || "",
    state: a["state"] || "",
    pincode: a["postcode"] || "",
    label: data.display_name ?? "",
  };
}
