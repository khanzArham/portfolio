import { expect, test } from "@playwright/test";

const journey = (page: import("@playwright/test").Page) =>
  page.getByRole("region", { name: "Journey" });

test("the map is an ordered list of stations, without Lab", async ({
  page,
}) => {
  await page.goto("/");
  const items = journey(page).getByRole("list").first().getByRole("listitem");
  await expect(items).toHaveCount(3);
  await expect(
    journey(page).getByText("Origin", { exact: true }),
  ).toBeVisible();
  await expect(journey(page).getByText("Build", { exact: true })).toBeVisible();
  await expect(journey(page).getByText("Field", { exact: true })).toBeVisible();
  await expect(journey(page).getByText("Lab", { exact: true })).toHaveCount(0);
});

test("stations open and close with the keyboard", async ({ page }) => {
  await page.goto("/");
  const field = journey(page).locator("details").nth(2);
  const summary = field.locator("summary");

  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(field).toHaveAttribute("open", "");
  const link = field.getByRole("link", { name: "Experience details" });
  await expect(link).toBeVisible();

  await page.keyboard.press("Space");
  await expect(field).not.toHaveAttribute("open", "");
  await expect(link).toBeHidden();
});

test("station links lead to the full section", async ({ page }) => {
  await page.goto("/");
  const origin = journey(page).locator("details").first();
  await origin.locator("summary").click();
  await origin.getByRole("link", { name: "Education details" }).click();
  await expect(page).toHaveURL(/\/experience#origin-title$/);
  await expect(page.getByRole("heading", { name: "Origin" })).toBeVisible();
});

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`path animation follows reduced motion: ${reducedMotion}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion });
    const page = await context.newPage();
    await page.goto("/");
    const animation = await page
      .locator(".journey-path-fill")
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe(
      reducedMotion === "reduce" ? "none" : "journey-fill",
    );
    await context.close();
  });
}
