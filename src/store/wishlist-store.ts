import { create } from "zustand";

import { apiFetch } from "@/lib/api/client";
import type { Product } from "@/lib/api/types";
import { useAuthStore } from "./auth-store";

/**
 * Wishlist. Ids are hydrated once per session so every heart across the
 * catalogue knows its state, and toggles are optimistic — the server call
 * only has to correct us if it fails.
 */

interface WishlistState {
  ids: string[];
  hydrated: boolean;
  loading: boolean;
  has: (id: string) => boolean;
  hydrate: () => Promise<void>;
  toggle: (id: string) => Promise<boolean>;
  clearLocal: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],
  hydrated: false,
  loading: false,

  has: (id) => get().ids.includes(id),

  hydrate: async () => {
    if (get().hydrated || get().loading) return;
    if (!useAuthStore.getState().token) return;
    set({ loading: true });
    try {
      const { ids } = await apiFetch<{ ids: string[] }>("/wishlist/ids");
      set({ ids: ids ?? [], hydrated: true });
    } catch {
      /* a cold backend shouldn't break the catalogue */
    } finally {
      set({ loading: false });
    }
  },

  toggle: async (id) => {
    const wanted = !get().has(id);
    const before = get().ids;
    set({ ids: wanted ? [...before, id] : before.filter((x) => x !== id) });
    try {
      await apiFetch(`/wishlist/${id}`, { method: wanted ? "POST" : "DELETE" });
      return wanted;
    } catch (err) {
      set({ ids: before });
      throw err;
    }
  },

  clearLocal: () => set({ ids: [], hydrated: false }),
}));

export const fetchWishlist = () =>
  apiFetch<{ ids: string[]; products: Product[] }>("/wishlist");
