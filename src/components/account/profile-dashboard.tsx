import { useState, useEffect, useMemo, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { API_BASE_URL } from "@/lib/site";
import { fmtDate, fmtDateTime, fmtTime } from "@/lib/date";
import { Glass } from "@/components/ui/glass";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  User, ShoppingBag, Package, Settings, MapPin, LogOut,
  Camera, CheckCircle2, Truck, Box, Clock, Plus, Trash2,
  Edit3, Loader2, Sparkles, TrendingUp, ExternalLink, ShieldCheck,
  AlertCircle, ArrowRight, Minus, CreditCard, Award, RefreshCcw, ChevronRight, Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderSupportChat } from "@/components/chat/support-chat";


const ORDER_STAGES = ["placed", "confirmed", "shipped", "out_for_delivery", "delivered"];
const STAGE_LABELS: Record<string, { label: string; icon: React.ReactNode; desc: string }> = {
  placed: { label: "Order Placed", icon: <CheckCircle2 className="w-5 h-5" />, desc: "Received and awaiting confirmation" },
  confirmed: { label: "Confirmed & Packing", icon: <Package className="w-5 h-5" />, desc: "Our craftspeople are preparing your yarn" },
  shipped: { label: "Dispatched", icon: <Truck className="w-5 h-5" />, desc: "Handed over to courier partner" },
  out_for_delivery: { label: "Out for Delivery", icon: <Truck className="w-5 h-5" />, desc: "Arriving at your doorstep today" },
  delivered: { label: "Delivered", icon: <Sparkles className="w-5 h-5" />, desc: "Delivered safely. Enjoy your luxury wool!" },
};

interface ProfileDashboardProps {
  defaultTab?: "overview" | "cart" | "orders" | "edit" | "addresses";
}

export function ProfileDashboard({ defaultTab = "overview" }: ProfileDashboardProps) {
  const { user, token, isAuthenticated, logout, setLoginModalOpen, setUser } = useAuthStore();
  const { items: cartItems, updateQty, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"overview" | "cart" | "orders" | "edit" | "addresses">(defaultTab);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // New Address form state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrTag, setAddrTag] = useState("Home");
  const [addrHouse, setAddrHouse] = useState("");
  const [addrArea, setAddrArea] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("West Bengal");
  const [addrPin, setAddrPin] = useState("");
  const [addrPhone, setAddrPhone] = useState("");

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      setLoadingOrders(true);
      const userRes = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.status === 401) {
        logout();
        toast.error("Your session expired — please log in again.");
        return;
      }
      if (userRes.ok) {
        const u = await userRes.json();
        setUser(u);
      }
      const ordRes = await fetch(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ordRes.status === 401) {
        logout();
        toast.error("Your session expired — please log in again.");
        return;
      }
      if (ordRes.ok) {
        const ords = await ordRes.json();
        rememberStatuses(ords || []);
        setOrders(ords || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, token]);

  /**
   * Live tracking. The admin moves an order's status server-side, so the page
   * polls /orders quietly — no spinner, no /auth/me round-trip — and announces
   * any status that actually changed. Polling pauses on a hidden tab and
   * catches up the moment the window is focused again.
   */
  const statusRef = useRef<Record<string, string>>({});

  const rememberStatuses = (list: any[]) => {
    list.forEach((o) => {
      const oid = strId(o._id ?? o.id);
      if (oid) statusRef.current[oid] = o.status;
    });
  };

  const pollOrders = async () => {
    if (!token || (typeof document !== "undefined" && document.hidden)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        toast.error("Your session expired — please log in again.");
        return;
      }
      if (!res.ok) return;
      const next: any[] = (await res.json()) || [];
      next.forEach((o) => {
        const oid = strId(o._id ?? o.id);
        const was = statusRef.current[oid];
        if (was && was !== o.status) {
          const label = STAGE_LABELS[o.status]?.label || o.status;
          toast.success(`Order #${oid.slice(-6).toUpperCase()} — ${label}`, {
            description: STAGE_LABELS[o.status]?.desc,
          });
        }
      });
      rememberStatuses(next);
      setOrders(next);
      setLastSync(Date.now());
    } catch {
      /* transient — the next tick retries */
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    const id = window.setInterval(pollOrders, 12_000);
    const onWake = () => {
      if (!document.hidden) pollOrders();
    };
    window.addEventListener("focus", onWake);
    document.addEventListener("visibilitychange", onWake);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onWake);
      document.removeEventListener("visibilitychange", onWake);
    };
  }, [isAuthenticated, token]);

  const cartTotalQty = useMemo(() => cartItems.reduce((acc, item) => acc + item.qty, 0), [cartItems]);
  const cartTotalPrice = useMemo(() => cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0), [cartItems]);

  const totalSpent = useMemo(() => {
    return orders
      .filter((o) => ["placed", "confirmed", "shipped", "out_for_delivery", "delivered"].includes(o.status))
      .reduce((acc, o) => acc + (Number(o.amount) || 0), 0);
  }, [orders]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (JPG, PNG, WebP).");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/upload/user-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.status === 401) {
        logout();
        toast.error("Your session expired — please log in again.");
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(err.detail || "Failed to upload picture");
      }

      const { url } = await res.json();
      
      const patchRes = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: url }),
      });

      if (patchRes.status === 401) {
        logout();
        toast.error("Your session expired — please log in again.");
        return;
      }

      if (patchRes.ok) {
        const updatedUser = await patchRes.json();
        setUser(updatedUser);
        toast.success("Profile photo updated successfully!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim() || null,
        }),
      });

      if (res.status === 401) {
        logout();
        toast.error("Your session expired — please log in again.");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to update profile details.");
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      toast.success("Profile details updated!");
    } catch (err: any) {
      toast.error(err.message || "Error saving profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;

    if (!addrHouse.trim() || !addrPin.trim() || !addrCity.trim()) {
      toast.error("Please fill in House/Street, City, and Pincode.");
      return;
    }

    const newAddr = {
      tag: addrTag,
      house: addrHouse.trim(),
      area: addrArea.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      pincode: addrPin.trim(),
      phone: addrPhone.trim() || user.phone || "",
    };

    const updatedAddresses = [...(user.addresses || []), newAddr];

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });

      if (res.status === 401) {
        logout();
        toast.error("Your session expired — please log in again.");
        return;
      }

      if (res.ok) {
        const u = await res.json();
        setUser(u);
        setShowAddAddress(false);
        setAddrHouse(""); setAddrArea(""); setAddrCity(""); setAddrPin("");
        toast.success("Address added to your address book!");
      }
    } catch (err) {
      toast.error("Failed to save address.");
    }
  };

  const handleDeleteAddress = async (index: number) => {
    if (!token || !user) return;
    const updated = (user.addresses || []).filter((_, i) => i !== index);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ addresses: updated }),
      });
      if (res.status === 401) {
        logout();
        toast.error("Your session expired — please log in again.");
        return;
      }
      if (res.ok) {
        const u = await res.json();
        setUser(u);
        toast.success("Address removed.");
      }
    } catch (err) {
      toast.error("Failed to delete address.");
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-marigold">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-light text-foreground sm:text-3xl">
            Customer Account
          </h1>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
            Sign in or register to access your orders, live shipment tracker, wishlist, and saved addresses.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="rounded-full bg-marigold px-6 py-2.5 text-xs font-semibold text-black shadow-sm transition-transform hover:scale-[1.02] active:scale-95"
            >
              Log In / Register
            </button>
            <Link
              to="/collections"
              className="rounded-full border border-border bg-transparent px-6 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sleek Left Sidebar with Compact Profile Dossier & Navigation */}
        <div className="lg:col-span-4 space-y-4">
          {/* Compact Profile Card in Sidebar */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs">
            <div className="flex items-center gap-3.5">
              {/* Avatar with photo changer */}
              <div className="relative flex-none">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-14 w-14 rounded-xl object-cover border border-border shadow-xs transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-600 to-stone-800 flex items-center justify-center font-display text-xl font-light text-white border border-border shadow-xs">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <label
                  htmlFor="avatar-upload-sidebar"
                  className="absolute -bottom-1 -right-1 grid h-5 w-5 cursor-pointer place-items-center rounded-full bg-marigold text-black shadow transition-transform hover:scale-110 active:scale-95"
                  title="Change Photo"
                >
                  {uploadingAvatar ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Camera className="h-2.5 w-2.5" />}
                  <input
                    id="avatar-upload-sidebar"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="font-display text-base font-semibold text-foreground truncate">
                    {user.name || "Valued Patron"}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded bg-marigold/15 border border-marigold/25 px-1.5 py-0.5 text-[9px] font-semibold text-marigold uppercase">
                    VIP
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground truncate" title={user.email}>{user.email}</p>
                {user.phone && <p className="text-[11px] text-muted-foreground/80 truncate">{user.phone}</p>}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2 text-2xs">
              <span className="text-muted-foreground/80 truncate">
                {user.created_at ? `Patron since ${fmtDate(user.created_at)}` : "Active account"}
              </span>
              <div className="flex items-center gap-1.5 flex-none">
                <button
                  onClick={() => fetchDashboardData()}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-secondary/50 p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="Refresh Data"
                >
                  <RefreshCcw className={`h-3.5 w-3.5 ${loadingOrders ? "animate-spin text-marigold" : ""}`} />
                </button>
                <button
                  onClick={() => {
                    logout();
                    toast.success("Signed out successfully.");
                    navigate({ to: "/" });
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-2xs font-semibold text-red-600 hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="h-3 w-3" /> Log Out
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar p-1 lg:p-0 gap-1 lg:space-y-1 bg-secondary/30 lg:bg-transparent rounded-xl border border-border/40 lg:border-0">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "orders", label: "Orders & Tracking", icon: Package, badge: orders.length },
              { id: "cart", label: "Active Cart", icon: ShoppingBag, badge: cartTotalQty },
              { id: "edit", label: "Profile & Photo", icon: Settings },
              { id: "addresses", label: "Saved Addresses", icon: MapPin, badge: (user.addresses || []).length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex flex-none items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all text-left w-auto lg:w-full",
                    isActive
                      ? "bg-foreground text-background font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 flex-none", isActive ? "text-background" : "text-muted-foreground/80")} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={cn(
                      "ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold leading-none",
                      isActive ? "bg-marigold text-black" : "bg-secondary text-foreground border border-border/50"
                    )}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Compact Help Box */}
          <div className="hidden lg:block rounded-xl border border-border/60 bg-card p-4 text-left shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-marigold" /> Patron Assistance
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              Need custom winding or shipment support? Contact our artisans anytime.
            </p>
            <Link
              to="/contact"
              className="mt-2 inline-flex items-center gap-1 text-2xs font-semibold text-marigold hover:underline"
            >
              Get in touch <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-5">
                  {/* Clean Stat Metric Cards */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {[
                      { title: "Total Orders", value: orders.length, sub: "In account history", icon: Package },
                      { title: "In Your Bag", value: cartTotalQty, sub: `₹${cartTotalPrice.toFixed(0)} total`, icon: ShoppingBag },
                      { title: "Lifetime Spend", value: `₹${totalSpent.toFixed(0)}`, sub: "Across all orders", icon: CreditCard },
                      { title: "Saved Addresses", value: (user.addresses || []).length, sub: "Ready for checkout", icon: MapPin },
                    ].map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <div key={idx} className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs transition-colors hover:border-border">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-[11px] font-medium tracking-tight">{card.title}</span>
                            <Icon className="h-3.5 w-3.5 text-marigold" />
                          </div>
                          <div className="mt-1.5 text-xl sm:text-2xl font-bold font-sans text-foreground tracking-tight">
                            {card.value}
                          </div>
                          <div className="text-[11px] text-muted-foreground/80 mt-0.5">{card.sub}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Latest Activity / Orders Teaser */}
                  <div className="rounded-xl border border-border/70 bg-card p-5 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Package className="h-4 w-4 text-marigold" /> Recent Shipment Status
                      </h2>
                      {orders.length > 0 && (
                        <button
                          onClick={() => setActiveTab("orders")}
                          className="text-xs font-medium text-marigold hover:underline flex items-center gap-1"
                        >
                          View All ({orders.length}) <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {orders.length === 0 ? (
                      <div className="py-10 text-center rounded-lg border border-dashed border-border/70 bg-secondary/20 p-6">
                        <Box className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
                        <p className="text-sm font-medium text-foreground">No active or completed shipments</p>
                        <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
                          Once you order from our artisan yarn catalogue, your live tracking steps will show up here.
                        </p>
                        <Link
                          to="/collections"
                          className="inline-block rounded-full bg-marigold px-6 py-2 text-xs font-semibold text-black shadow-2xs transition-transform hover:scale-102"
                        >
                          Browse Catalogue
                        </Link>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border/60 bg-secondary/15 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5 mb-3 text-xs">
                          <div>
                            <span className="font-bold text-foreground font-mono">#{orders[0]._id ? strId(orders[0]._id).slice(-8) : strId(orders[0].id).slice(-8)}</span>
                            <span className="text-muted-foreground ml-2">Placed {fmtDate(orders[0].created_at || Date.now())}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-emerald-500/15 text-emerald-700 border border-emerald-500/25 px-2 py-0.5 text-[11px] font-semibold capitalize">
                              ● {orders[0].status || "placed"}
                            </span>
                            <span className="font-semibold text-foreground">₹{(orders[0].amount || 0).toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground flex items-center gap-2 py-1">
                          <span>{STAGE_LABELS[orders[0].status]?.icon || <Package className="w-5 h-5" />}</span>
                          <span className="text-foreground font-medium">{STAGE_LABELS[orders[0].status]?.label || "Processing"}:</span>
                          <span>{STAGE_LABELS[orders[0].status]?.desc || "Your order is progressing."}</span>
                        </div>

                        <button
                          onClick={() => setActiveTab("orders")}
                          className="mt-3.5 w-full rounded-lg bg-background py-2 text-center text-xs font-medium text-foreground hover:bg-secondary transition-colors border border-border/60 shadow-2xs"
                        >
                          View Live Step Tracker & Ordered Items
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cart Snippet */}
                  {cartTotalQty > 0 && (
                    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-marigold border border-amber-500/20">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground">You have {cartTotalQty} item(s) in your shopping bag</div>
                          <div className="text-[11px] text-muted-foreground">Estimated bag total: ₹{cartTotalPrice.toFixed(2)}</div>
                        </div>
                      </div>
                      <Link
                        to="/cart"
                        className="rounded-full bg-marigold px-5 py-2 text-xs font-semibold text-black shadow-2xs transition-transform hover:scale-102 whitespace-nowrap text-center"
                      >
                        Proceed to Checkout
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MY ORDERS & TRACKER */}
              {activeTab === "orders" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-foreground">My Orders & Live Tracker</h2>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          </span>
                          Live
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Updates on their own as your parcel moves
                        {lastSync ? ` · synced ${fmtTime(lastSync)}` : ""}.
                      </p>
                    </div>
                    <button
                      onClick={() => fetchDashboardData()}
                      className="inline-flex items-center gap-1 text-xs font-medium text-marigold hover:underline"
                    >
                      <RefreshCcw className="h-3 w-3" /> Refresh
                    </button>
                  </div>

                  {loadingOrders && orders.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-marigold mb-2" />
                      Loading shipment records...
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-12 text-center rounded-xl border border-dashed border-border/70 bg-card p-6">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                      <h3 className="text-sm font-semibold text-foreground">No order records found</h3>
                      <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                        Once you place an order, you can follow its spinning, packing, and courier dispatch stages right here.
                      </p>
                      <Link
                        to="/collections"
                        className="mt-5 inline-block rounded-full bg-marigold px-6 py-2 text-xs font-semibold text-black shadow-2xs"
                      >
                        Explore Yarns
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {orders.map((order, oIdx) => {
                        const oid = order._id ? strId(order._id) : strId(order.id);
                        const currentStage = order.status || "placed";
                        const isCancelled = currentStage === "cancelled";
                        const currentIdx = ORDER_STAGES.indexOf(currentStage);

                        return (
                          <div key={oIdx} className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs transition-colors hover:border-border">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3 mb-5">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-xs text-foreground font-mono">#{oid.slice(-10).toUpperCase()}</span>
                                  {order.payment_method === "cod" ? (
                                    <span className="rounded bg-amber-500/15 text-amber-800 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase">COD</span>
                                  ) : (
                                    <span className="rounded bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase">Paid Online</span>
                                  )}
                                </div>
                                <div className="text-2xs text-muted-foreground mt-0.5">
                                  Placed {fmtDateTime(order.created_at || Date.now())} • {order.items?.length || 1} item(s)
                                </div>
                              </div>
                              <div className="text-left sm:text-right">
                                <div className="text-[10px] uppercase text-muted-foreground">Total Bill</div>
                                <div className="text-base font-bold text-foreground">₹{(Number(order.amount) || 0).toFixed(2)}</div>
                              </div>
                            </div>

                            {/* Refined Tracking Bar */}
                            {!isCancelled ? (
                              <div className="my-5 px-2 sm:px-4">
                                <div className="relative">
                                  <div className="absolute top-3.5 left-0 right-0 h-[2px] bg-secondary rounded overflow-hidden z-0">
                                    <div
                                      className="h-full bg-marigold transition-all duration-500"
                                      style={{ width: `${(Math.max(0, currentIdx) / (ORDER_STAGES.length - 1)) * 100}%` }}
                                    />
                                  </div>

                                  <div className="relative z-10 flex justify-between">
                                    {ORDER_STAGES.map((st, sIdx) => {
                                      const passed = currentIdx >= sIdx;
                                      const active = currentIdx === sIdx;
                                      const stData = STAGE_LABELS[st] || { label: st, icon: "•", desc: "" };

                                      return (
                                        <div key={st} className="flex flex-col items-center w-1/5 text-center">
                                          <div className={cn(
                                            "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold shadow-xs transition-all duration-300",
                                            active ? "bg-marigold text-black scale-110 ring-2 ring-marigold/30" :
                                            passed ? "bg-amber-600 text-white" : "bg-card text-muted-foreground/40 border border-border"
                                          )}>
                                            {passed ? stData.icon : "•"}
                                          </div>
                                          <div className={cn(
                                            "mt-1.5 text-[10px] font-medium leading-tight",
                                            active ? "text-foreground font-semibold" : passed ? "text-foreground" : "text-muted-foreground/70"
                                          )}>
                                            {stData.label}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="mt-5 rounded-lg bg-secondary/30 border border-border/40 p-3 flex items-center gap-2.5 text-xs">
                                  <span className="text-sm">{STAGE_LABELS[currentStage]?.icon || <Package className="w-4 h-4" />}</span>
                                  <div>
                                    <span className="font-semibold text-foreground">{STAGE_LABELS[currentStage]?.label}: </span>
                                    <span className="text-muted-foreground">{STAGE_LABELS[currentStage]?.desc || "Status updated."}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="my-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2 text-xs text-red-600">
                                <AlertCircle className="h-4 w-4 flex-none" />
                                <div><b>Cancelled:</b> This order was cancelled and any prepaid amount will be refunded automatically.</div>
                              </div>
                            )}

                            {/* Products */}
                            <div className="mt-4 border-t border-border/40 pt-3">
                              <div className="text-2xs font-semibold uppercase text-muted-foreground mb-2">Items Included</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {(order.items || []).map((it: any, itIdx: number) => (
                                  <div key={itIdx} className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/50 p-2 text-xs">
                                    {it.image ? (
                                      <img src={it.image} className="h-10 w-10 rounded-md object-cover border border-border flex-none" alt="" />
                                    ) : (
                                      <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center flex-none"><ShoppingBag className="w-5 h-5 opacity-50" /></div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="font-medium text-foreground truncate">{it.title || "Yarn Item"}</div>
                                      <div className="text-2xs text-muted-foreground">
                                        {it.color ? `${it.color} ` : ""}{it.size ? `• ${it.size}` : ""} • <b>{it.qty}x</b>
                                      </div>
                                    </div>
                                    <div className="font-semibold text-foreground flex-none">
                                      ₹{((it.price || 0) * (it.qty || 1)).toFixed(2)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* Cleo answers about THIS order. */}
                            <div className="mt-4 flex flex-col items-start gap-2.5 border-t border-border/40 pt-3 sm:flex-row sm:items-center sm:justify-between">
                              <OrderSupportChat
                                orderId={oid}
                                orderLabel={`#${oid.slice(-8).toUpperCase()}`}
                                className="w-full justify-center sm:w-auto"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ACTIVE CART */}
              {activeTab === "cart" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Active Cart & Shopping Bag</h2>
                      <p className="text-xs text-muted-foreground">Manage selected yarns and quantities.</p>
                    </div>
                    {cartItems.length > 0 && (
                      <button
                        onClick={() => {
                          clearCart();
                          toast.success("Cart cleared.");
                        }}
                        className="text-xs font-medium text-red-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Clear All
                      </button>
                    )}
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="py-12 text-center rounded-xl border border-dashed border-border/70 bg-card p-6">
                      <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                      <h3 className="text-sm font-semibold text-foreground">Your bag is empty</h3>
                      <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                        Add hand-spun colors from our store to see them gathered here.
                      </p>
                      <Link
                        to="/collections"
                        className="mt-5 inline-block rounded-full bg-marigold px-6 py-2 text-xs font-semibold text-black shadow-2xs"
                      >
                        Browse Store
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs">
                          <div className="flex items-center gap-3.5 min-w-0">
                            {item.image ? (
                              <img src={item.image} className="h-14 w-14 rounded-lg object-cover border border-border flex-none shadow-2xs" alt={item.title} />
                            ) : (
                              <div className="h-14 w-14 rounded-lg bg-secondary flex items-center justify-center text-xl flex-none"><ShoppingBag className="w-6 h-6 opacity-50" /></div>
                            )}
                            <div className="min-w-0">
                              <Link to="/product/$id" params={{ id: item.productId }} className="font-semibold text-sm text-foreground hover:text-marigold transition-colors block truncate">
                                {item.title}
                              </Link>
                              <div className="text-xs text-muted-foreground">
                                {item.color ? `Shade: ${item.color} ` : ""}{item.size ? `• Size: ${item.size}` : ""}
                              </div>
                              <div className="text-xs font-medium text-foreground mt-0.5">
                                ₹{item.price.toFixed(2)} each
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between w-full sm:w-auto gap-4 border-t sm:border-t-0 border-border/40 pt-2.5 sm:pt-0">
                            <div className="flex items-center rounded-lg border border-border bg-secondary/40 px-2 py-0.5">
                              <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-1 text-muted-foreground hover:text-foreground">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="mx-2.5 text-xs font-semibold text-foreground min-w-[1.25rem] text-center">
                                {item.qty}
                              </span>
                              <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-1 text-muted-foreground hover:text-foreground">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <div className="text-right flex items-center gap-3">
                              <div>
                                <div className="text-[10px] text-muted-foreground">Total</div>
                                <div className="text-sm font-bold text-foreground">₹{(item.price * item.qty).toFixed(2)}</div>
                              </div>
                              <button
                                onClick={() => {
                                  removeItem(item.id);
                                  toast.success("Item removed.");
                                }}
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Summary */}
                      <div className="mt-6 rounded-xl border border-stone-800 bg-[#1c1917] p-5 text-stone-100 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="text-xs text-stone-400">Estimated Bag Total ({cartTotalQty} items)</div>
                          <div className="text-2xl font-bold text-white mt-0.5">₹{cartTotalPrice.toFixed(2)}</div>
                          <div className="text-[11px] text-marigold mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Free luxury packaging included
                          </div>
                        </div>
                        <Link
                          to="/cart"
                          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-marigold px-7 py-3 text-xs font-semibold text-black shadow-sm transition-transform hover:scale-102 active:scale-95"
                        >
                          Proceed to Checkout <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: EDIT PROFILE */}
              {activeTab === "edit" && (
                <div className="space-y-5 max-w-xl">
                  <div className="border-b border-border/60 pb-3">
                    <h2 className="text-base font-semibold text-foreground">Edit Profile & Portrait</h2>
                    <p className="text-xs text-muted-foreground">Keep your name, photo and delivery mobile number updated.</p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    {/* Photo upload Box */}
                    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs flex items-center gap-4">
                      {user.avatar ? (
                        <img src={user.avatar} className="h-16 w-16 rounded-xl object-cover border border-border shadow-xs" alt="" />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-secondary text-foreground font-display font-medium flex items-center justify-center text-2xl border border-border">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <label
                          htmlFor="avatar-upload-tab"
                          className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                        >
                          {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin text-marigold" /> : <Camera className="h-3.5 w-3.5 text-marigold" />}
                          <span>{uploadingAvatar ? "Uploading..." : "Change Photo"}</span>
                          <input
                            id="avatar-upload-tab"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={uploadingAvatar}
                            className="hidden"
                          />
                        </label>
                        <p className="mt-1 text-2xs text-muted-foreground">JPG, PNG or WebP image files supported.</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-card p-5 shadow-2xs space-y-4">
                      <div>
                        <label className="text-xs font-medium text-foreground block mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          required
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-marigold focus:outline-none focus:ring-1 focus:ring-marigold"
                          placeholder="Your Name"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-foreground block mb-1.5">Mobile Number</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-marigold focus:outline-none focus:ring-1 focus:ring-marigold"
                          placeholder="+91 9876543210"
                        />
                        <p className="mt-1 text-[11px] text-muted-foreground">Helps courier agents coordinate doorstep deliveries.</p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-foreground block mb-1.5">Email Address</label>
                        <div className="relative">
                          <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full rounded-lg border border-border/40 bg-secondary/40 px-3 py-2 text-xs text-muted-foreground cursor-not-allowed"
                          />
                          <span className="absolute right-2.5 top-2 inline-flex items-center gap-1 rounded bg-emerald-500/15 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditName(user.name || "");
                          setEditPhone(user.phone || "");
                          toast.info("Reset to saved details.");
                        }}
                        className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="rounded-lg bg-marigold px-6 py-2 text-xs font-semibold text-black shadow-sm hover:bg-marigold/90 transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>{savingProfile ? "Saving..." : "Save Changes"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 5: SAVED ADDRESSES */}
              {activeTab === "addresses" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Saved Shipping Addresses</h2>
                      <p className="text-xs text-muted-foreground">Your delivery destinations for quick checkouts.</p>
                    </div>
                    {!showAddAddress && (
                      <button
                        onClick={() => setShowAddAddress(true)}
                        className="rounded-full bg-marigold px-4 py-2 text-xs font-semibold text-black shadow-2xs hover:bg-marigold/90 transition-all flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add New
                      </button>
                    )}
                  </div>

                  {showAddAddress && (
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm mb-5">
                      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-border/50">
                        <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-marigold" /> Add Shipping Destination
                        </h3>
                        <button onClick={() => setShowAddAddress(false)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                      </div>
                      <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                        <div>
                          <label className="font-medium text-foreground block mb-1.5">Address Type</label>
                          <div className="flex gap-2">
                            {["Home", "Office", "Other"].map((tag) => (
                              <button
                                type="button"
                                key={tag}
                                onClick={() => setAddrTag(tag)}
                                className={cn(
                                  "rounded-lg px-3 py-1 text-xs font-medium border transition-all",
                                  addrTag === tag ? "bg-foreground text-background border-foreground font-semibold" : "bg-secondary/40 text-muted-foreground border-border"
                                )}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-medium text-foreground block mb-1">House / Apartment *</label>
                            <input
                              value={addrHouse}
                              onChange={(e) => setAddrHouse(e.target.value)}
                              required
                              placeholder="Flat / Building Name"
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:border-marigold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="font-medium text-foreground block mb-1">Street / Area</label>
                            <input
                              value={addrArea}
                              onChange={(e) => setAddrArea(e.target.value)}
                              placeholder="Locality / Road"
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:border-marigold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="font-medium text-foreground block mb-1">City *</label>
                            <input
                              value={addrCity}
                              onChange={(e) => setAddrCity(e.target.value)}
                              required
                              placeholder="City"
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:border-marigold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="font-medium text-foreground block mb-1">Pincode *</label>
                            <input
                              value={addrPin}
                              onChange={(e) => setAddrPin(e.target.value)}
                              required
                              maxLength={6}
                              placeholder="6 digit postal code"
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:border-marigold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="font-medium text-foreground block mb-1">State</label>
                            <input
                              value={addrState}
                              onChange={(e) => setAddrState(e.target.value)}
                              placeholder="State"
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:border-marigold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="font-medium text-foreground block mb-1">Contact Number</label>
                            <input
                              value={addrPhone}
                              onChange={(e) => setAddrPhone(e.target.value)}
                              placeholder="Recipient phone"
                              className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:border-marigold focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddAddress(false)}
                            className="rounded-lg border border-border px-4 py-2 font-medium text-muted-foreground hover:bg-secondary"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="rounded-lg bg-marigold px-5 py-2 font-semibold text-black shadow-2xs hover:bg-marigold/90"
                          >
                            Save Address
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {(user.addresses || []).length === 0 ? (
                    <div className="py-12 text-center rounded-xl border border-dashed border-border/70 bg-card p-6">
                      <MapPin className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                      <h3 className="text-sm font-semibold text-foreground">No saved addresses</h3>
                      <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                        Save your default shipping destinations to speed up future checkouts.
                      </p>
                      {!showAddAddress && (
                        <button
                          onClick={() => setShowAddAddress(true)}
                          className="mt-5 inline-flex items-center gap-1 rounded-full bg-marigold px-6 py-2 text-xs font-semibold text-black shadow-2xs"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add Address
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {(user.addresses || []).map((addr: any, idx: number) => (
                        <div key={idx} className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs hover:border-border transition-colors relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="rounded bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-foreground border border-border/60">
                              {addr.tag || "Address"}
                            </span>
                            <button
                              onClick={() => handleDeleteAddress(idx)}
                              className="text-muted-foreground hover:text-red-500 p-1 transition-colors"
                              title="Delete Address"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="font-semibold text-xs text-foreground mb-1">
                            {addr.house}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {[addr.area, addr.city, addr.state].filter(Boolean).join(", ")}
                            <br />
                            <strong className="text-foreground font-semibold">PIN: {addr.pincode}</strong>
                          </p>
                          {addr.phone && (
                            <div className="mt-2 pt-2 border-t border-border/30 text-2xs text-muted-foreground">
                              <Phone className="w-3 h-3 mr-1 inline-block" /> Phone: <strong className="text-foreground">{addr.phone}</strong>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function strId(id: any): string {
  if (typeof id === "string") return id;
  if (id && id.$oid) return id.$oid;
  return String(id || "12345678");
}
