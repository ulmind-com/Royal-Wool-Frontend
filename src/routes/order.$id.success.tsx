import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Copy, Download, Loader2, Package, Receipt } from "lucide-react";
import { toast } from "sonner";

import { OrderSupportChat } from "@/components/chat/support-chat";
import { useSettings } from "@/hooks/use-settings";
import { getOrder, downloadInvoice } from "@/lib/api/orders";

export const Route = createFileRoute("/order/$id/success")({
  head: () => ({
    meta: [
      { title: "Order confirmed — Royal Wool" },
      { name: "description", content: "Your Royal Wool order is confirmed." },
      { property: "og:title", content: "Order confirmed — Royal Wool" },
      { property: "og:description", content: "Your Royal Wool order is confirmed." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const { id } = Route.useParams();
  const { formatMoney } = useSettings();

  const { data: order, isPending } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
    // Status moves on the admin side — keep the tracker honest without a reload.
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const [downloading, setDownloading] = useState(false);
  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      await downloadInvoice(id);
      toast.success("Invoice downloaded!");
    } catch (err) {
      console.error("Download invoice error:", err);
      toast.error("Couldn't download invoice");
    } finally {
      setDownloading(false);
    }
  };

  const copyId = () => {
    navigator.clipboard?.writeText(id);
    toast.success("Order ID copied");
  };

  return (
    <div className="mx-auto w-full max-w-[900px] px-4 pb-24 pt-10 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl border border-indigo/40 bg-indigo/10 text-indigo">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="mt-5 font-data text-2xs uppercase tracking-[0.2em] text-marigold">
          Payment received
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-light text-foreground sm:text-4xl">
          Your order is in
        </h1>

        <button
          type="button"
          onClick={copyId}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-data text-2xs text-foreground transition-colors hover:border-marigold"
        >
          Order ID · #{id.slice(-10).toUpperCase()}
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {isPending ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-marigold" />
        </div>
      ) : order ? (
        <div className="mt-10 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card icon={<Package className="h-4 w-4" />} title="What's coming">
              <ul className="space-y-2.5">
                {order.items.map((item, i) => (
                  <li key={i} className="flex items-start justify-between gap-3">
                    <span className="min-w-0 text-xs text-foreground">
                      <span className="line-clamp-2">{item.title}</span>
                      <span className="block font-data text-2xs text-muted-foreground">
                        Qty {item.qty}
                      </span>
                    </span>
                    <span className="shrink-0 font-data text-2xs text-foreground">
                      {formatMoney((item.price ?? 0) * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card icon={<Receipt className="h-4 w-4" />} title="Payment & delivery">
              <dl className="space-y-2 font-data text-2xs">
                <Line label="Amount paid" value={formatMoney(order.amount)} />
                <Line
                  label="Method"
                  value={order.payment_method === "cod" ? "Cash on delivery" : "Online · Razorpay"}
                />
                {order.razorpay_payment_id ? (
                  <Line label="Payment ID" value={order.razorpay_payment_id} />
                ) : null}
                <Line label="Status" value={order.status} />
              </dl>
              <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                {[
                  order.address.house,
                  order.address.area,
                  order.address.city,
                  order.address.state,
                  order.address.pincode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </Card>
          </div>
        </div>
      ) : (
        <p className="mt-10 text-center font-data text-2xs text-muted-foreground">
          We couldn't load this order right now — it's safe in your account.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {order && (
          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-data text-2xs text-foreground transition-colors hover:border-marigold disabled:opacity-50"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download Invoice
          </button>
        )}
        <OrderSupportChat orderId={id} orderLabel={`#${id.slice(-8).toUpperCase()}`} />
        <Link
          to="/account/orders"
          className="sheen inline-flex items-center gap-2 rounded-full bg-madder px-6 py-3 font-data text-2xs text-primary-foreground"
        >
          Track in my orders
        </Link>
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-data text-2xs text-foreground transition-colors hover:border-marigold"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border p-4">
      <h2 className="mb-3 inline-flex items-center gap-2 font-display text-base font-light text-foreground">
        <span className="text-marigold">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="truncate text-foreground">{value}</dd>
    </div>
  );
}
