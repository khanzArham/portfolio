import { expect, type Page, test } from "@playwright/test";

// Plan §8: screenshot baselines for key pages and charts, at mobile and
// desktop widths, in both themes. Baselines are Linux-only and come from
// the official Playwright image so CI compares like with like; refresh them
// with `npm run test:visual:update` (needs Docker).
const widths = [
  { name: "mobile", viewport: { width: 375, height: 800 } },
  { name: "desktop", viewport: { width: 1280, height: 900 } },
];

const pages: { name: string; open: (page: Page) => Promise<void> }[] = [
  { name: "home", open: (page) => page.goto("/").then(() => {}) },
  { name: "projects", open: (page) => page.goto("/projects").then(() => {}) },
  {
    // The fixture dossier's Evaluation section holds all four charts:
    // a tab on desktop, an accordion button on mobile.
    name: "dossier-evaluation",
    open: async (page) => {
      await page.goto("/projects/fixture");
      const tab = page.getByRole("tab", { name: "Evaluation" });
      if (await tab.isVisible()) await tab.click();
      else await page.getByRole("button", { name: "Evaluation" }).click();
      await expect(
        page.getByRole("table", { name: "Key metrics" }),
      ).toBeVisible();
    },
  },
];

for (const colorScheme of ["light", "dark"] as const) {
  for (const { name: width, viewport } of widths) {
    test.describe(`${width} ${colorScheme}`, () => {
      // Reduced motion turns off chart and slide-in animations.
      test.use({ colorScheme, viewport, reducedMotion: "reduce" });

      for (const { name, open } of pages) {
        test(name, async ({ page }) => {
          await open(page);
          await page.waitForLoadState("networkidle");
          await page.evaluate(() => document.fonts.ready);
          await expect(page).toHaveScreenshot(
            `${name}-${width}-${colorScheme}.png`,
            { fullPage: true, animations: "disabled" },
          );
        });
      }
    });
  }
}
