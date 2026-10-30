import { expect, test } from "@playwright/test";

// Needs the "_fixture" dossier: CI builds with CONTENT_FIXTURES=1 and the
// dev server always includes fixtures.
const routes = [
  "/",
  "/projects",
  "/projects/fixture",
  "/experience",
  "/skills",
  "/lab",
  "/about",
  "/contact",
];

test.describe("smoke", () => {
  for (const route of routes) {
    test(`${route} renders one h1 with no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push(e.message));

      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("main h1")).toBeVisible();
      await page.waitForLoadState("networkidle");
      expect(errors).toEqual([]);
    });
  }
});

test("fixture dossier shows every section", async ({ page }) => {
  await page.goto("/projects/fixture");
  await expect(page.getByText("CASE-000")).toBeVisible();

  // Sections are tabs on desktop (Step 18); Stack moved into the header.
  await expect(page.getByRole("tab")).toHaveText([
    "Brief",
    "Data",
    "Method",
    "Evaluation",
    "Failure Log",
    "Outcome",
  ]);
  await expect(page.getByRole("definition").getByText("Python")).toBeVisible();

  await page.getByRole("tab", { name: "Failure Log" }).click();
  await expect(
    page.getByRole("heading", { level: 3, name: "Fixture failure entry" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Evaluation" }).click();
  await expect(page.getByRole("table", { name: "Key metrics" })).toBeVisible();
});

test("unknown dossier slugs return 404 with site chrome", async ({ page }) => {
  const response = await page.goto("/projects/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
});

test("tag filter updates the list and the URL", async ({ page }) => {
  await page.goto("/projects");
  const ml = page.getByRole("button", { name: "ML", exact: true });

  await ml.click();
  await expect(page).toHaveURL(/\?tag=ML$/);
  await expect(ml).toHaveAttribute("aria-pressed", "true");
  // The page also has the search panel's status, so pick the filter's.
  await expect(
    page.getByRole("status").filter({ hasText: "tagged ML" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Fixture Dossier" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "All" }).click();
  await expect(page).toHaveURL(/\/projects$/);
});

test("a shared ?tag= link opens pre-filtered", async ({ page }) => {
  await page.goto("/projects?tag=Web");
  await expect(
    page.getByRole("button", { name: "Web", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("home features the fixture dossier", async ({ page }) => {
  await page.goto("/");
  const featured = page.getByRole("region", { name: "Featured dossiers" });
  await featured.getByRole("link", { name: "Fixture Dossier" }).click();
  await expect(page).toHaveURL(/\/projects\/fixture$/);
});
