import { queryOptions } from "@tanstack/react-query";

import { CONTACT_DEMO } from "@/data/contact";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { Settings } from "@/lib/api/types";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/whatsapp";

/**
 * Contact page content, admin-driven.
 *
 * The backend may expose this at several places (or not yet at all), so we try
 * a few aliases, fall back to fields already present in `/settings`, and only
 * then to the demo copy. Unknown channel keys are dropped.
 */

export type ChannelKey = "hotline" | "whatsapp" | "email" | "location" | "hours";

export interface ContactChannel {
  key: ChannelKey;
  label: string;
  value: string;
  href: string | null;
}

export interface ContactContent {
  eyebrow: string;
  title: string;
  intro: string;
  formTitle: string;
  formNote: string;
  cardTitle: string;
  cardNote: string;
  hours: string | null;
  channels: ContactChannel[];
  socials: { label: string; href: string }[];
  /** True while the copy is demo filler, not admin data. */
  placeholder: boolean;
}

const KEY_ALIASES: Record<string, ChannelKey> = {
  hotline: "hotline",
  phone: "hotline",
  call: "hotline",
  mobile: "hotline",
  telephone: "hotline",
  whatsapp: "whatsapp",
  wa: "whatsapp",
  sms: "whatsapp",
  chat: "whatsapp",
  email: "email",
  mail: "email",
  location: "location",
  address: "location",
  store: "location",
  studio: "location",
  hours: "hours",
  timing: "hours",
  opening_hours: "hours",
};

const ORDER: ChannelKey[] = ["hotline", "whatsapp", "email", "location", "hours"];

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function text(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}

function autoHref(key: ChannelKey, value: string): string | null {
  if (key === "hotline") return `tel:${value.replace(/[^\d+]/g, "")}`;
  if (key === "email") return `mailto:${value}`;
  if (key === "whatsapp") return whatsappLink("Hi Royaall Wool, I have a question about your yarns.");
  return null;
}

/** wa.me link for the admin's number, falling back to the build-time default. */
function waHref(display: string | null, message: string | null): string {
  const digits = (display ?? "").replace(/\D/g, "");
  const text = message || "Hi Royaall Wool, I have a question about your yarns.";
  if (!digits) return whatsappLink(text);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function pick(bag: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const found = text(bag[key]);
    if (found) return found;
  }
  return null;
}

function readChannels(raw: unknown): Map<ChannelKey, ContactChannel> {
  const out = new Map<ChannelKey, ContactChannel>();
  if (!Array.isArray(raw)) return out;
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const rawKey = pick(row, ["key", "id", "type", "slug", "label", "title"]);
    const value = pick(row, ["value", "text", "detail", "content", "number"]);
    if (!rawKey || !value) continue;
    const key = KEY_ALIASES[slug(rawKey)];
    if (!key) continue;
    const label = pick(row, ["label", "title", "heading"]) ?? key;
    out.set(key, {
      key,
      label,
      value,
      href: pick(row, ["href", "link", "url"]) ?? autoHref(key, value),
    });
  }
  return out;
}

/** Merges an admin payload + /settings on top of the demo defaults. */
export function normalizeContact(
  payload: unknown,
  settings?: Settings | null | undefined,
): ContactContent {
  const bag = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const nested =
    bag["contact"] && typeof bag["contact"] === "object"
      ? (bag["contact"] as Record<string, unknown>)
      : bag;

  const admin = readChannels(nested["channels"] ?? nested["items"] ?? nested["rows"]);

  const shop = settings?.shop;
  const support = settings?.support;
  // Once /settings has answered, it is the source of truth: a field the admin
  // cleared must disappear from the card rather than fall back to demo copy.
  const settingsLoaded = Boolean(settings);

  const fromSettings = new Map<ChannelKey, ContactChannel>();
  if (shop?.phone) {
    fromSettings.set("hotline", {
      key: "hotline",
      label: text(support?.hotline_label) ?? "Hotline",
      value: shop.phone,
      href: autoHref("hotline", shop.phone),
    });
  }
  if (shop?.email) {
    fromSettings.set("email", {
      key: "email",
      label: text(support?.email_label) ?? "Email",
      value: shop.email,
      href: autoHref("email", shop.email),
    });
  }
  if (shop?.address) {
    fromSettings.set("location", {
      key: "location",
      label: text(support?.address_label) ?? "Studio",
      value: shop.address,
      href: null,
    });
  }
  const waNumber = text(nested["whatsapp"]) ?? text(support?.whatsapp);
  if (waNumber || !settingsLoaded) {
    const display = waNumber ?? WHATSAPP_DISPLAY;
    fromSettings.set("whatsapp", {
      key: "whatsapp",
      label: text(support?.whatsapp_label) ?? "SMS / WhatsApp",
      value: display,
      href: waHref(display, text(support?.whatsapp_message)),
    });
  }

  const demo = new Map<ChannelKey, ContactChannel>(
    CONTACT_DEMO.channels.map((c) => [
      c.key as ChannelKey,
      {
        key: c.key as ChannelKey,
        label: c.label,
        value: c.value,
        href: c.href ?? autoHref(c.key as ChannelKey, c.value),
      },
    ]),
  );

  const channels = ORDER.flatMap((key) => {
    const row = admin.get(key) ?? fromSettings.get(key) ?? (settingsLoaded ? null : demo.get(key));
    return row ? [row] : [];
  });

  const socialsRaw = nested["socials"] ?? nested["social_links"] ?? support?.socials;
  const socials = Array.isArray(socialsRaw)
    ? socialsRaw.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const row = item as Record<string, unknown>;
        const label = pick(row, ["label", "name", "platform"]);
        const href = pick(row, ["href", "url", "link"]);
        return label && href ? [{ label, href }] : [];
      })
    : settingsLoaded
      ? []
      : [...CONTACT_DEMO.socials];

  return {
    eyebrow: pick(nested, ["eyebrow", "kicker"]) ?? CONTACT_DEMO.eyebrow,
    title: pick(nested, ["title", "heading"]) ?? CONTACT_DEMO.title,
    intro: pick(nested, ["intro", "subtitle", "description"]) ?? CONTACT_DEMO.intro,
    formTitle: pick(nested, ["form_title", "formTitle"]) ?? CONTACT_DEMO.formTitle,
    formNote: pick(nested, ["form_note", "formNote"]) ?? CONTACT_DEMO.formNote,
    cardTitle:
      pick(nested, ["card_title", "cardTitle", "support_title"]) ??
      text(support?.title) ??
      CONTACT_DEMO.cardTitle,
    cardNote:
      pick(nested, ["card_note", "cardNote", "support_note"]) ??
      text(support?.note) ??
      CONTACT_DEMO.cardNote,
    hours:
      pick(nested, ["hours", "timing", "opening_hours"]) ??
      text(support?.hours) ??
      (settingsLoaded ? null : CONTACT_DEMO.hours),
    channels,
    socials,
    placeholder: admin.size === 0,
  };
}

const ENDPOINTS = ["/contact", "/site-content/contact", "/pages/contact"];

async function fetchContact(signal: AbortSignal | null): Promise<unknown> {
  let lastError: unknown;
  for (const path of ENDPOINTS) {
    try {
      return await apiFetch<unknown>(path, { signal: signal ?? null, retries: 1 });
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
      if (error instanceof ApiError && error.isNotFound) continue;
      // Sleeping backend / other failures: stop trying aliases, use fallbacks.
      break;
    }
  }
  if (lastError instanceof ApiError && !lastError.isNotFound && !lastError.isOffline) {
    throw lastError;
  }
  return null;
}

export const contactContentQuery = queryOptions({
  queryKey: ["contact", "content"],
  queryFn: ({ signal }) => fetchContact(signal ?? null),
  staleTime: 15 * 60_000,
  retry: false,
});

export interface ContactMessageInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  message: string;
}

/** Posts an enquiry; throws when no endpoint accepts it. */
export async function sendContactMessage(input: ContactMessageInput): Promise<void> {
  const paths = ["/contact/messages", "/contact-messages", "/enquiries"];
  let lastError: unknown;
  for (const path of paths) {
    try {
      await apiFetch<unknown>(path, { method: "POST", json: input });
      return;
    } catch (error) {
      lastError = error;
      if (error instanceof ApiError && (error.isNotFound || error.status === 405)) continue;
      throw error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Could not send message");
}
