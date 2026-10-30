import { expect, test } from "@playwright/test";

// Step 18: tabs at 1280px, accordion at 375px, close control, back button,
// and the slide-in under reduced motion.
const URL = "/projects/fixture";

test.describe("desktop (1280px)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("arrow keys, Home and End switch tabs", async ({ page }) => {
    await page.goto(URL);
    const first = page.getByRole("tab").first();
    await first.focus();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Data" })).toBeFocused();
    await expect(page.getByRole("tab", { name: "Data" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("tabpanel")).toHaveCount(1);

    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: "Outcome" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Brief" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("tab", { name: "Outcome" })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(page.getByRole("tab", { name: "Brief" })).toBeFocused();
  });

  test("accordion controls are hidden", async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator("h2 button[aria-expanded]").first()).toBeHidden();
  });

  test("inactive sections stay in the HTML for crawlers", async ({
    request,
  }) => {
    const html = await (await request.get(URL)).text();
    expect(html).toContain("Fixture failure entry");
    expect(html).toContain("Fixture outcome.");
  });
});

test.describe("mobile (375px)", () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test("sections are an accordion that works with the keyboard", async ({
    page,
  }) => {
    await page.goto(URL);
    await expect(page.getByRole("tablist")).toBeHidden();

    const brief = page.getByRole("button", { name: "Brief" });
    const outcome = page.getByRole("button", { name: "Outcome" });
    await expect(brief).toHaveAttribute("aria-expanded", "true");
    await expect(outcome).toHaveAttribute("aria-expanded", "false");

    await outcome.focus();
    await page.keyboard.press("Enter");
    await expect(outcome).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("Fixture outcome.")).toBeVisible();

    await page.keyboard.press("Space");
    await expect(page.getByText("Fixture outcome.")).toBeHidden();
  });

  test("no horizontal scroll", async ({ page }) => {
    await page.goto(URL);
    await page.getByRole("button", { name: "Evaluation" }).click();
    const width = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(width).toBeLessThanOrEqual(375);
  });
});

test("Close file returns to Work, by keyboard", async ({ page }) => {
  await page.goto(URL);
  await page.getByRole("link", { name: "Close file" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/projects$/);
});

test("the back button returns from a dossier", async ({ page }) => {
  await page.goto("/projects");
  await page.getByRole("link", { name: "Fixture Dossier" }).click();
  await expect(page).toHaveURL(/\/projects\/fixture$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
});

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`slide-in follows reduced motion: ${reducedMotion}`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ reducedMotion });
    const page = await context.newPage();
    await page.goto(URL);
    const duration = await page
      .locator("article.case-file-enter")
      .evaluate((el) => getComputedStyle(el).animationDuration);
    expect(duration).toBe(reducedMotion === "reduce" ? "0s" : "0.25s");
    await context.close();
  });
}
