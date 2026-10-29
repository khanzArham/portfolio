// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleContact, type ContactServices } from "@/lib/contact/handle";
import { contactSchema } from "@/lib/contact/schema";
import {
  createDryRunServices,
  getContactServices,
  RATE_LIMIT,
} from "@/lib/contact/services";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello, I would like to talk about a role.",
};

function fakeServices(allowed = true) {
  return {
    allow: vi.fn(async () => allowed),
    send: vi.fn(async () => {}),
  } satisfies ContactServices;
}

describe("contactSchema", () => {
  it("accepts valid input and trims it", () => {
    const result = contactSchema.safeParse({ ...valid, name: "  Ada  " });
    expect(result.success && result.data.name).toBe("Ada");
  });

  it.each([
    ["a bad email", { email: "not-an-email" }, "email"],
    ["a short message", { message: "Hi" }, "message"],
    ["a missing name", { name: "" }, "name"],
    ["an over-long message", { message: "x".repeat(5001) }, "message"],
  ])("rejects %s", (_label, patch, field) => {
    const result = contactSchema.safeParse({ ...valid, ...patch });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual([field]);
  });
});

describe("handleContact", () => {
  it("sends valid messages", async () => {
    const services = fakeServices();
    expect(await handleContact(valid, "1.1.1.1", services)).toEqual({
      status: "success",
    });
    expect(services.allow).toHaveBeenCalledWith("1.1.1.1");
    expect(services.send).toHaveBeenCalledWith(valid);
  });

  it("returns field errors and sends nothing for invalid input", async () => {
    const services = fakeServices();
    const result = await handleContact(
      { ...valid, email: "nope" },
      "ip",
      services,
    );
    expect(result).toMatchObject({
      status: "error",
      fieldErrors: { email: "Enter a valid email address" },
    });
    expect(services.send).not.toHaveBeenCalled();
  });

  it("silently drops honeypot submissions", async () => {
    const services = fakeServices();
    const result = await handleContact(
      { ...valid, website: "https://spam.example" },
      "ip",
      services,
    );
    expect(result).toEqual({ status: "success" });
    expect(services.allow).not.toHaveBeenCalled();
    expect(services.send).not.toHaveBeenCalled();
  });

  it("blocks rate-limited clients and points to email", async () => {
    const services = fakeServices(false);
    const result = await handleContact(valid, "ip", services);
    expect(result).toMatchObject({
      status: "error",
      message: expect.stringContaining("Too many messages"),
    });
    expect(services.send).not.toHaveBeenCalled();
  });

  it("reports a send failure with the email fallback", async () => {
    const services = fakeServices();
    services.send.mockRejectedValueOnce(new Error("Resend down"));
    expect(await handleContact(valid, "ip", services)).toMatchObject({
      status: "error",
      message: expect.stringContaining("could not be sent"),
    });
  });

  it("says the form is unavailable when services are missing", async () => {
    expect(await handleContact(valid, "ip", null)).toMatchObject({
      status: "error",
      message: expect.stringContaining("unavailable"),
    });
  });
});

describe("contact services", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("dry run allows three messages per hour, then blocks the fourth", async () => {
    let now = 0;
    const services = createDryRunServices(() => now);
    for (let i = 0; i < RATE_LIMIT.messages; i++) {
      expect(await services.allow("ip")).toBe(true);
    }
    expect(await services.allow("ip")).toBe(false);
    expect(await services.allow("other-ip")).toBe(true);

    now = RATE_LIMIT.windowMs;
    expect(await services.allow("ip")).toBe(true);
  });

  it("is unavailable in production without keys", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CONTACT_DRY_RUN", "");
    vi.stubEnv("RESEND_API_KEY", "");
    expect(getContactServices()).toBeNull();
  });

  it("uses dry run when CONTACT_DRY_RUN=1", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CONTACT_DRY_RUN", "1");
    expect(getContactServices()).not.toBeNull();
  });
});
