import { create } from "zustand";

/** Lightweight user shape matching the backend's UserPublic response. */
export interface BackendUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  addresses?: any[];
  cart?: any[];
  created_at?: string | null;
}

const TOKEN_KEY = "rw_token";

interface AuthState {
  /** Backend user profile (from /auth/google or /auth/login). */
  user: BackendUser | null;
  /** JWT issued by the backend. */
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;

  /** Call after a successful backend auth response. */
  loginSuccess: (user: BackendUser, token: string) => void;
  /** Update current user in store and localStorage */
  setUser: (user: BackendUser | null) => void;
  /** Clear everything on logout. */
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setLoginModalOpen: (open: boolean) => void;
}

function loadToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function loadUser(): BackendUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("rw_user");
    return raw ? (JSON.parse(raw) as BackendUser) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: loadUser(),
  token: loadToken(),
  isAuthenticated: !!loadToken(),
  isLoading: false,
  isLoginModalOpen: false,

  loginSuccess: (user, token) => {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
      window.localStorage.setItem("rw_user", JSON.stringify(user));
    } catch { /* SSR or quota exceeded */ }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  setUser: (user) => {
    try {
      if (user) {
        window.localStorage.setItem("rw_user", JSON.stringify(user));
      } else {
        window.localStorage.removeItem("rw_user");
      }
    } catch { /* SSR or quota exceeded */ }
    set({ user });
  },

  logout: () => {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem("rw_user");
    } catch { /* noop */ }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setLoginModalOpen: (isLoginModalOpen) => set({ isLoginModalOpen }),
}));
