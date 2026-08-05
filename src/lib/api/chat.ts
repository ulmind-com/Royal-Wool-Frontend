import { apiFetch } from "@/lib/api/client";

/** Cleo, the support agent. Both endpoints need a signed-in customer. */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const chatSuggestions = (orderId?: string | null) =>
  apiFetch<{ questions: string[] }>("/chat/suggestions", {
    ...(orderId ? { query: { order_id: orderId } } : {}),
  });

export const sendChat = (messages: ChatMessage[], orderId?: string | null) =>
  apiFetch<{ reply: string }>("/chat", {
    method: "POST",
    json: { messages, order_id: orderId ?? null },
  });
