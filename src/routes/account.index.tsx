import { createFileRoute } from "@tanstack/react-router";

import { ProfileDashboard } from "@/components/account/profile-dashboard";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [
      { title: "VIP Patron Dashboard — Royal Wool" },
      {
        name: "description",
        content: "Manage your Royal Wool profile, orders, tracking, addresses and preferences.",
      },
      { property: "og:title", content: "VIP Patron Dashboard — Royal Wool" },
      { property: "og:description", content: "Manage your profile and orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <ProfileDashboard defaultTab="overview" />,
});
