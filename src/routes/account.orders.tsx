import { createFileRoute } from "@tanstack/react-router";

import { ProfileDashboard } from "@/components/account/profile-dashboard";

export const Route = createFileRoute("/account/orders")({
  head: () => ({
    meta: [
      { title: "My Orders & Live Tracker — Royal Wool" },
      { name: "description", content: "Track, cancel or return your Royal Wool orders." },
      { property: "og:title", content: "My Orders & Live Tracker — Royal Wool" },
      { property: "og:description", content: "Track, cancel or return your orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <ProfileDashboard defaultTab="orders" />,
});
