import { expect, test } from "@playwright/test";

// Step 16 on the fixture dossier (built with CONTENT_FIXTURES=1 in CI).
const URL = "/projects/fixture";

// Charts live in the Evaluation tab (Step 18).
async function openEvaluation(page: import("@playwright/test").Page) {
  await page.goto(URL);
  await page.getByRole("tab", { name: "Evaluation" }).click();
}

const captions = [
  "Fixture confusion matrix.",
  "Fixture loss curve.",
  "Fixture trade-off.",
  "Fixture metric table.",
];

test("every chart has its caption and text summary", async ({ page }) => {
  await openEvaluation(page);
  for (const caption of captions) {
    const figure = page.getByRole("figure", { name: caption });
    await expect(figure).toBeVisible();
    await expect(figure.locator("p").first()).not.toBeEmpty();
  }
  await expect(
    page.getByText(/Of 12 test items, 9 \(75%\) were classified correctly/),
  ).toBeVisible();
});

test("charts render as SVG and the matrix as a table", async ({ page }) => {
  await openEvaluation(page);
  await expect(
    page.locator('[data-chart="loss-curve"] svg').first(),
  ).toBeVisible();
  await expect(
    page.locator('[data-chart="tradeoff-scatter"] svg').first(),
  ).toBeVisible();
  await expect(
    page.getByRole("table", { name: /Fixture confusion matrix/ }),
  ).toBeVisible();
});

test("the data table toggle works with the keyboard", async ({ page }) => {
  await openEvaluation(page);
  const figure = page.getByRole("figure", { name: "Fixture loss curve." });
  const toggle = figure.getByRole("button", { name: "Data table" });

  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(figure.getByRole("table")).toBeVisible();
  await expect(figure.locator('[data-chart="loss-curve"]')).toHaveCount(0);

  await page.keyboard.press("Space");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(figure.locator('[data-chart="loss-curve"]')).toBeVisible();
});

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test.describe(`prefers-reduced-motion: ${reducedMotion}`, () => {
    test.use({ reducedMotion });

    test("charts follow the motion preference", async ({ page }) => {
      await openEvaluation(page);
      await expect(
        page.locator('[data-chart="loss-curve"] svg').first(),
      ).toBeVisible();
      const animate = reducedMotion === "reduce" ? "false" : "true";
      for (const chart of ["loss-curve", "tradeoff-scatter"]) {
        await expect(page.locator(`[data-chart="${chart}"]`)).toHaveAttribute(
          "data-animate",
          animate,
        );
      }
    });
  });
}
