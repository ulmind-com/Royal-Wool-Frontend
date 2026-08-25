import { create } from "zustand";
import { useAuthStore } from "./auth-store";
import { API_BASE_URL } from "@/lib/site";

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  color?: string | undefined;
  size?: string | undefined;
  price: number;
  qty: number;
  image?: string | undefined;
}

const CART_KEY = "rw_cart_items";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch { /* noop */ }
}

async function syncWithBackend(items: CartItem[]) {
  const { token, setUser } = useAuthStore.getState();
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cart: items }),
    });
    if (res.ok) {
      const updatedUser = await res.json();
      setUser(updatedUser);
    }
  } catch (err) {
    console.error("Failed to sync cart to backend:", err);
  }
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;

  directCheckoutItems: CartItem[] | null;
  setDirectCheckout: (items: CartItem[]) => void;
  clearDirectCheckout: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCart(),
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set({ isOpen: !get().isOpen }),

  addItem: (item) => {
    const current = get().items;
    const existingIndex = current.findIndex(
      (i) => i.productId === item.productId && i.color === item.color && i.size === item.size
    );

    let next: CartItem[];
    if (existingIndex > -1) {
      next = current.map((x, idx) =>
        idx === existingIndex ? { ...x, qty: x.qty + item.qty } : x
      );
    } else {
      const newItem: CartItem = {
        ...item,
        id: `${item.productId}-${item.color || "def"}-${item.size || "def"}-${Date.now()}`,
      };
      next = [...current, newItem];
    }

    saveCart(next);
    // Adding never yanks the drawer open — the bag opens only when tapped.
    set({ items: next });
    syncWithBackend(next);
  },

  removeItem: (id) => {
    const next = get().items.filter((x) => x.id !== id);
    saveCart(next);
    set({ items: next });
    syncWithBackend(next);
  },

  updateQty: (id, qty) => {
    if (qty <= 0) {
      get().removeItem(id);
      return;
    }
    const next = get().items.map((x) => (x.id === id ? { ...x, qty } : x));
    saveCart(next);
    set({ items: next });
    syncWithBackend(next);
  },

  clearCart: () => {
    saveCart([]);
    set({ items: [] });
    syncWithBackend([]);
  },

  setItems: (items) => {
    saveCart(items);
    set({ items });
  },

  directCheckoutItems: null,
  setDirectCheckout: (items) => set({ directCheckoutItems: items }),
  clearDirectCheckout: () => set({ directCheckoutItems: null }),
}));

