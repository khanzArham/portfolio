import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { routes } from "./routes";

// Plan §7.2: WCAG 2.2 AA in both themes, with no critical or serious
// violations. The theme follows the system setting (next-themes
// "system"), so emulating the color scheme exercises the real path.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const BLOCKING = new Set(["critical", "serious"]);

async function expectNoBlockingViolations(page: Page) {
  await page.waitForLoadState("networkidle");
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();
  const blocking = violations
    .filter((v) => BLOCKING.has(v.impact ?? ""))
    .map((v) => ({
      rule: v.id,
      impact: v.impact,
      targets: v.nodes.map((n) => n.target.join(" ")),
    }));
  expect(blocking).toEqual([]);
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`axe (${colorScheme})`, () => {
    // Reduced motion: scroll reveals would otherwise catch text mid-fade,
    // and contrast is judged on the settled page.
    test.use({ colorScheme, reducedMotion: "reduce" });

    for (const route of routes) {
      test(route, async ({ page }) => {
        await page.goto(route);
        await expect(page.locator("html")).toHaveClass(
          new RegExp(`\\b${colorScheme}\\b`),
        );
        await expectNoBlockingViolations(page);
      });
    }

    // The charts only render on the Evaluation tab; their colors count too.
    test("/projects/fixture (Evaluation tab)", async ({ page }) => {
      await page.goto("/projects/fixture");
      await page.getByRole("tab", { name: "Evaluation" }).click();
      await expect(
        page.getByRole("table", { name: "Key metrics" }),
      ).toBeVisible();
      await expectNoBlockingViolations(page);
    });

    test("404 page", async ({ page }) => {
      await page.goto("/projects/does-not-exist");
      await expectNoBlockingViolations(page);
    });
  });
}
