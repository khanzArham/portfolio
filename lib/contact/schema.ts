import * as z from "zod/mini";

// Performance (Step 22): zod/mini keeps the same validation in a much
// smaller client bundle, and jitless stops Zod from trying `new Function`,
// which the CSP blocks (script-src has no 'unsafe-eval').
z.config({ jitless: true });

// Shared by the form (client-side checks) and the server action (the
// authoritative check).
export const contactSchema = z.object({
  name: z
    .string()
    .check(
      z.trim(),
      z.minLength(2, { error: "Enter your name" }),
      z.maxLength(100, { error: "Keep your name under 100 characters" }),
    ),
  email: z
    .email({ error: "Enter a valid email address" })
    .check(z.maxLength(200, { error: "Keep the email under 200 characters" })),
  message: z
    .string()
    .check(
      z.trim(),
      z.minLength(10, { error: "Write at least 10 characters" }),
      z.maxLength(5000, { error: "Keep the message under 5,000 characters" }),
    ),
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
