import { expect, test, type Page } from "@playwright/test";

// Step 20 on the CI build (fixtures and drafts included in the index).
const input = (page: Page) =>
  page.getByLabel("Search projects, skills and experience");
const results = (page: Page) =>
  page.getByRole("region", { name: "Ask the site" }).getByRole("listitem");

test("keyword search works without the model", async ({ page }) => {
  await page.goto("/projects");
  await input(page).fill("firebase");
  await expect(results(page).first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Order Tracker" }).first(),
  ).toBeVisible();
  await expect(page.getByRole("status").first()).toHaveText("Keyword search.");
});

test("semantic search finds a dossier by meaning, on this device", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const requests: string[] = [];
  page
    .context()
    .on("request", (r) => requests.push(r.url() + (r.postData() ?? "")));

  await page.goto("/projects");
  await page.getByRole("button", { name: /Turn on semantic search/ }).click();
  await expect(page.getByText("Semantic search is on")).toBeVisible({
    timeout: 90_000,
  });

  // No keyword in common with the Brick Breaker dossier.
  await input(page).fill("game with physics");
  await expect(results(page).first()).toContainText("Brick Breaker", {
    timeout: 15_000,
  });

  expect(requests.filter((u) => /game|physics/i.test(u))).toEqual([]);
  expect(
    requests.filter((u) => !u.startsWith(new URL(page.url()).origin)),
  ).toEqual([]);
});

test("falls back to keyword search when the model can't load", async ({
  page,
}) => {
  await page.route("**/models/**", (route) => route.abort());
  await page.goto("/projects");
  await input(page).fill("firebase");
  await page.getByRole("button", { name: /Turn on semantic search/ }).click();

  await expect(page.getByRole("status").first()).toHaveText(
    "Semantic search couldn't load on this device, so results use keyword search.",
    { timeout: 60_000 },
  );
  await expect(results(page).first()).toBeVisible();
});

test("the model is not in the initial page load", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/projects");
  await page.waitForLoadState("networkidle");
  expect(
    requests.filter((u) => /\/(models|ort)\/|search-index/.test(u)),
  ).toEqual([]);
});
