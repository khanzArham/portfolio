import {
  contactSchema,
  HONEYPOT_FIELD,
  type ContactField,
  type ContactInput,
  type ContactState,
} from "@/lib/contact/schema";
import { site } from "@/lib/site";

export type ContactServices = {
  /** True if this client may send another message now. */
  allow: (clientId: string) => Promise<boolean>;
  send: (input: ContactInput) => Promise<void>;
};

const fallback = `Please email me directly at ${site.email}.`;

/**
 * The contact flow, kept free of Next.js and real services so it can be
 * tested with fakes: validate, drop honeypot hits, rate-limit, send.
 * `services` is null when production is missing its keys.
 */
export async function handleContact(
  raw: Record<string, unknown>,
  clientId: string,
  services: ContactServices | null,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<ContactField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ContactField;
      fieldErrors[field] ??= issue.message;
    }
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors,
    };
  }

  // Report success so bots learn nothing, but send nothing.
  const honeypot = raw[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return { status: "success" };
  }

  if (!services) {
    return { status: "error", message: `The form is unavailable. ${fallback}` };
  }

  try {
    if (!(await services.allow(clientId))) {
      return {
        status: "error",
        message: `Too many messages from this connection. Try again in an hour, or email me directly at ${site.email}.`,
      };
    }
    await services.send(parsed.data);
  } catch {
    return {
      status: "error",
      message: `Your message could not be sent. ${fallback}`,
    };
  }

  return { status: "success" };
}
