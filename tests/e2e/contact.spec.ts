import { expect, test, type Page } from "@playwright/test";

// Runs with CONTACT_DRY_RUN=1 in CI (and dry run in keyless dev): the
// server action validates and rate-limits in memory, and never sends.
// Each test uses its own client IP so rate limits don't leak between tests.
const useClientIp = (page: Page) =>
  page.setExtraHTTPHeaders({
    "x-forwarded-for": `203.0.113.${Math.floor(Math.random() * 250) + 1}`,
  });

async function fillForm(page: Page) {
  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page
    .getByLabel("Message")
    .fill("Hello, I would like to talk about a role.");
}

test("shows field errors before submitting", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByLabel("Name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Name")).toBeFocused();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
});

test("sends a valid message", async ({ page }) => {
  await useClientIp(page);
  await page.goto("/contact");
  await fillForm(page);
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("status")).toHaveText(/your message was sent/);
});

test("rate-limits the fourth message within an hour", async ({ page }) => {
  await useClientIp(page);
  for (let i = 1; i <= 4; i++) {
    await page.goto("/contact");
    await fillForm(page);
    await page.getByRole("button", { name: "Send message" }).click();
    if (i < 4) {
      await expect(page.getByRole("status")).toBeVisible();
    }
  }
  // Scoped to the form: Next.js also renders an empty role="alert" route
  // announcer on every page.
  await expect(page.locator("form").getByRole("alert")).toContainText(
    "Too many messages",
  );
});
