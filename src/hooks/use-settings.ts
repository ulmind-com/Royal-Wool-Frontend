import { useQuery } from "@tanstack/react-query";

import { settingsQuery } from "@/lib/api/queries";
import type { Settings } from "@/lib/api/types";

/**
 * Store configuration, read once and shared. Deliberately non-suspending:
 * the shell must paint immediately even while a sleeping backend wakes up, so
 * every consumer gets a safe fallback until real settings arrive.
 */
export function useSettings() {
  const { data, isPending, isError, refetch } = useQuery(settingsQuery);

  const currency = data?.currency ?? "₹";

  const formatMoney = (amount: number | null | undefined) => {
    if (amount == null || Number.isNaN(amount)) return "—";
    const rounded = Math.round(amount * 100) / 100;
    const whole = Number.isInteger(rounded);
    return `${currency}${rounded.toLocaleString("en-IN", {
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return {
    settings: data,
    /** True while we still have no settings at all (first paint / cold start). */
    isPending,
    isError,
    refetch,
    currency,
    formatMoney,
    shop: data?.shop,
    delivery: data?.delivery,
    freeAbove: data?.delivery.free_above ?? null,
    freeRadiusKm: data?.delivery.free_radius_km ?? null,
    perKmRate: data?.delivery.per_km_rate ?? null,
    baseFee: data?.delivery.base_fee ?? null,
    maxServiceKm: data?.delivery.max_service_km ?? null,
    returnWindowDays: data?.return_window_days ?? null,
    cancelWindowHours: data?.cancel_window_hours ?? null,
    taxRate: data?.tax_rate ?? null,
    codEnabled: data?.cod.enabled ?? false,
  };
}

export type UseSettings = ReturnType<typeof useSettings>;
export type { Settings };
