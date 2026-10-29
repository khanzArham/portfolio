"use server";

import { headers } from "next/headers";
import { handleContact } from "@/lib/contact/handle";
import type { ContactState } from "@/lib/contact/schema";
import { getContactServices } from "@/lib/contact/services";

// Vercel sets these from the real connection; clients cannot override them.
async function clientIp() {
  const h = await headers();
  return (
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/** Contact form Server Action (no public API route, plan §6.3). */
export async function sendContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  return handleContact(
    Object.fromEntries(formData),
    await clientIp(),
    getContactServices(),
  );
}
