import { createFileRoute } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/page-shell";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [
      { title: "Your profile — Royal Wool" },
      { name: "description", content: "Manage your Royal Wool profile, addresses and preferences." },
      { property: "og:title", content: "Your profile — Royal Wool" },
      { property: "og:description", content: "Manage your profile and addresses." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <PageShell
      eyebrow="Account"
      title="Your profile"
      intro="Name, phone and avatar from /auth/me. Phase 3 adds the auth gate and the edit form."
    />
  ),
});
