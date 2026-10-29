import { z } from "zod";

// Shared by the form (client-side checks) and the server action (the
// authoritative check).
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Enter your name" })
    .max(100, { error: "Keep your name under 100 characters" }),
  email: z
    .email({ error: "Enter a valid email address" })
    .max(200, { error: "Keep the email under 200 characters" }),
  message: z
    .string()
    .trim()
    .min(10, { error: "Write at least 10 characters" })
    .max(5000, { error: "Keep the message under 5,000 characters" }),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactInput;

/** Hidden field that people never see; bots that fill it are dropped. */
export const HONEYPOT_FIELD = "website";

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<ContactField, string>>;
    };
