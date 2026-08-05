import { apiFetch } from "@/lib/api/client";

/** Customer-side returns / exchanges. Admin drives the status afterwards. */

export interface ReturnItem {
  product_id: string;
  qty: number;
  color?: string | null;
  size?: string | null;
  title?: string;
  image?: string;
}

export interface ReturnRecord {
  id?: string;
  _id?: string;
  order_id: string;
  type: "refund" | "exchange" | string;
  reason: string;
  note?: string;
  status: string;
  amount?: number;
  items: ReturnItem[];
  created_at?: string;
}

export const myReturns = () => apiFetch<ReturnRecord[]>("/returns");

export const createReturn = (body: {
  order_id: string;
  type: "refund" | "exchange";
  reason: string;
  note?: string;
  items: Array<{ product_id: string; qty: number; color?: string | null; size?: string | null }>;
}) => apiFetch<ReturnRecord>("/returns", { method: "POST", json: body });

export const RETURN_STATUS_COPY: Record<string, string> = {
  requested: "Requested — waiting for approval",
  approved: "Approved — pickup being arranged",
  rejected: "Declined",
  picked_up: "Picked up from your address",
  refunded: "Refunded",
  exchanged: "Exchange dispatched",
};
