import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Loader2 } from "lucide-react";

import { ProductGrid } from "@/components/commerce/product-card";
import { fetchWishlist, useWishlistStore } from "@/store/wishlist-store";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/account/wishlist")({
  head: () => ({
    meta: [
      { title: "Your wishlist — Royal Wool" },
      { name: "description", content: "Yarns you saved for later at Royal Wool." },
      { property: "og:title", content: "Your wishlist — Royal Wool" },
      { property: "og:description", content: "Yarns you saved for later." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { isAuthenticated, setLoginModalOpen } = useAuthStore();
  // Re-reading ids keeps the list in step with hearts toggled on this page.
  const ids = useWishlistStore((s) => s.ids);

  const { data, isPending } = useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    enabled: isAuthenticated,
    retry: 1,
  });

  const products = (data?.products ?? []).filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-8 sm:px-6 lg:px-10">
      <header className="border-b border-border pb-5">
        <p className="font-data text-2xs uppercase tracking-[0.2em] text-marigold">Wishlist</p>
        <h1 className="mt-1.5 font-display text-3xl font-light text-foreground sm:text-4xl">
          Saved for later
        </h1>
        <p className="mt-2 font-data text-2xs text-muted-foreground">
          {products.length} yarn{products.length === 1 ? "" : "s"} waiting for you
        </p>
      </header>

      {!isAuthenticated ? (
        <Empty
          title="Sign in to see your saved yarns"
          body="Your hearts follow your account, so they're on every device."
          action={
            <button
              type="button"
              onClick={() => setLoginModalOpen(true)}
              className="sheen rounded-full bg-madder px-6 py-3 font-data text-2xs text-primary-foreground"
            >
              Sign in
            </button>
          }
        />
      ) : isPending ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-marigold" />
        </div>
      ) : products.length === 0 ? (
        <Empty
          title="Nothing saved yet"
          body="Tap the heart on any yarn and it lands here, ready when you are."
          action={
            <Link
              to="/collections"
              className="sheen rounded-full bg-madder px-6 py-3 font-data text-2xs text-primary-foreground"
            >
              Browse the catalogue
            </Link>
          }
        />
      ) : (
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
}

function Empty({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-border text-marigold">
        <Heart className="h-6 w-6" />
      </div>
      <h2 className="mt-5 font-display text-xl font-light text-foreground">{title}</h2>
      <p className="mt-2 max-w-sm font-data text-2xs leading-relaxed text-muted-foreground">
        {body}
      </p>
      <div className="mt-6">{action}</div>
    </div>
  );
}
