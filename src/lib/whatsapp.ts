/** WhatsApp deep-link helpers. Number is a public business number. */
export const WHATSAPP_NUMBER = import.meta.env["VITE_WHATSAPP_NUMBER"] ?? "918910792214";

export const WHATSAPP_DISPLAY = "+91 89107 92214";

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const waAskAboutProduct = (title: string, url: string) =>
  whatsappLink(`Hi Royal Wool, I'd like to know more about "${title}" — ${url}`);

export const waNotifyMe = (name: string) =>
  whatsappLink(`Hi Royal Wool, please notify me when "${name}" is available.`);

export const waGeneral = () => whatsappLink("Hi Royal Wool, I have a question about your yarns.");
