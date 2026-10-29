import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import type { ContactServices } from "@/lib/contact/handle";
import type { ContactInput } from "@/lib/contact/schema";
import { site } from "@/lib/site";

// Server-only: reads secret keys. Imported only by the server action.

/** Plan Step 10: three messages per client per hour. */
export const RATE_LIMIT = {
  messages: 3,
  window: "1 h",
  windowMs: 3_600_000,
} as const;

const DEFAULT_FROM = "Portfolio contact <onboarding@resend.dev>";

const toText = (input: ContactInput) =>
  `From: ${input.name} <${input.email}>\n\n${input.message}`;

/** In-memory limiter and no-op sender for CI, E2E and keyless dev. */
export function createDryRunServices(now = () => Date.now()): ContactServices {
  const sent = new Map<string, number[]>();
  return {
    async allow(clientId) {
      const recent = (sent.get(clientId) ?? []).filter(
        (t) => now() - t < RATE_LIMIT.windowMs,
      );
      if (recent.length >= RATE_LIMIT.messages) return false;
      sent.set(clientId, [...recent, now()]);
      return true;
    },
    async send(input) {
      console.info(
        `[contact dry run] would email ${site.email}:\n${toText(input)}`,
      );
    },
  };
}

let dryRun: ContactServices | undefined;

/**
 * Real services when every key is set. Dry run when CONTACT_DRY_RUN=1, or
 * in development without keys. Null in production without keys, so the
 * form says it is unavailable instead of pretending to send.
 */
export function getContactServices(): ContactServices | null {
  const { RESEND_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } =
    process.env;
  const configured =
    RESEND_API_KEY && UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN;

  if (
    process.env.CONTACT_DRY_RUN === "1" ||
    (!configured && process.env.NODE_ENV === "development")
  ) {
    return (dryRun ??= createDryRunServices());
  }
  if (!configured) return null;

  const ratelimit = new Ratelimit({
    redis: new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(RATE_LIMIT.messages, RATE_LIMIT.window),
    prefix: "portfolio:contact",
  });
  const resend = new Resend(RESEND_API_KEY);

  return {
    async allow(clientId) {
      return (await ratelimit.limit(clientId)).success;
    },
    async send(input) {
      const { error } = await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
        to: site.email,
        replyTo: input.email,
        subject: `Portfolio message from ${input.name}`,
        text: toText(input),
      });
      if (error) throw new Error(`Resend: ${error.message}`);
    },
  };
}
