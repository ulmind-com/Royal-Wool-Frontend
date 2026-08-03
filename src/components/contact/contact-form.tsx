import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { sendContactMessage } from "@/lib/api/contact";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

const schema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(80, "Too long"),
  last_name: z.string().trim().max(80, "Too long"),
  email: z.string().trim().email("Enter a valid email").max(255, "Too long"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a 10-digit mobile number"),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (10+ characters)")
    .max(1000, "Keep it under 1000 characters"),
});

type Fields = z.infer<typeof schema>;
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { first_name: "", last_name: "", email: "", phone: "", message: "" };

const fieldClass =
  "min-h-12 w-full rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm text-foreground outline-none transition-all duration-[var(--dur-micro)] placeholder:text-muted-foreground/60 focus:border-marigold focus:ring-2 focus:ring-marigold/30";

/** Enquiry form. Posts to the admin backend; falls back to WhatsApp handoff. */
export function ContactForm({ title, note }: { title: string; note: string }) {
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const set = (key: keyof Fields) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Fields;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setBusy(true);
    try {
      await sendContactMessage(parsed.data);
      toast.success("Message sent — we'll reply shortly.");
      setValues(EMPTY);
    } catch {
      const url = whatsappLink(
        `Hi Royal Wool, I'm ${parsed.data.first_name}. ${parsed.data.message} (Reply: ${parsed.data.email} / ${parsed.data.phone})`,
      );
      window.open(url, "_blank", "noopener");
      toast("Opening WhatsApp instead", {
        description: "Our message inbox is waking up — your note is prefilled on WhatsApp.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="min-w-0">
      <h2 className="font-display text-2xl font-light text-foreground sm:text-[1.75rem]">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{note}</p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="First name" error={errors.first_name}>
          <input
            className={fieldClass}
            value={values.first_name}
            onChange={set("first_name")}
            placeholder="Enter your first name"
            autoComplete="given-name"
            maxLength={80}
          />
        </Field>
        <Field label="Last name" error={errors.last_name}>
          <input
            className={fieldClass}
            value={values.last_name}
            onChange={set("last_name")}
            placeholder="Enter your last name"
            autoComplete="family-name"
            maxLength={80}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            className={fieldClass}
            value={values.email}
            onChange={set("email")}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            maxLength={255}
          />
        </Field>
        <Field label="Contact number" error={errors.phone}>
          <div className="flex items-stretch gap-2">
            <span className="grid min-h-12 place-items-center rounded-xl border border-border/70 bg-card/70 px-3 font-data text-2xs text-muted-foreground">
              +91
            </span>
            <input
              className={fieldClass}
              value={values.phone}
              onChange={set("phone")}
              placeholder="Enter your number"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
            />
          </div>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Message" error={errors.message}>
            <textarea
              className={cn(fieldClass, "min-h-36 resize-y")}
              value={values.message}
              onChange={set("message")}
              placeholder="What are you making, and which shade are you after?"
              maxLength={1000}
            />
          </Field>
        </div>
      </div>

      <div className="mt-7 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-data text-2xs text-muted-foreground/80">
          We reply on WhatsApp or email — never spam.
        </p>
        <button
          type="submit"
          disabled={busy}
          data-cursor="link"
          className="sheen inline-flex min-h-12 items-center justify-center rounded-full bg-madder px-7 py-3 font-data text-2xs text-primary-foreground transition-transform duration-[var(--dur-micro)] hover:-translate-y-0.5 disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send a message"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="font-data text-2xs text-foreground/80">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error ? <span className="mt-1.5 block text-xs text-madder">{error}</span> : null}
    </label>
  );
}
