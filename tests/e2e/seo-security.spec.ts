import { expect, test } from "@playwright/test";

const pages = [
  "/",
  "/projects",
  "/projects/fixture",
  "/experience",
  "/skills",
  "/about",
  "/contact",
];

test("security headers are set", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();

  const csp = headers["content-security-policy"];
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("form-action 'self'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("every page has a unique title, description and canonical URL", async ({
  page,
}) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();

  for (const path of pages) {
    await page.goto(path);
    const title = await page.title();
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");

    expect(title, path).toContain("Arham Zahid Khan");
    expect(description, path).toBeTruthy();
    expect(new URL(canonical ?? "").pathname, path).toBe(path);
    titles.add(title);
    descriptions.add(description ?? "");
  }

  expect(titles.size).toBe(pages.length);
  expect(descriptions.size).toBe(pages.length);
});

for (const path of ["/", "/about"]) {
  test(`${path} has Person structured data`, async ({ page }) => {
    await page.goto(path);
    const json = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    const data = JSON.parse(json ?? "{}");
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe("Arham Zahid Khan");
    expect(data.sameAs).toContain("https://github.com/khanzArham");
  });
}

test("/lab is noindex; other pages are indexable", async ({ page }) => {
  const robots = () =>
    page.locator('meta[name="robots"]').getAttribute("content");

  await page.goto("/lab");
  expect(await robots()).toContain("noindex");

  await page.goto("/projects");
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test("sitemap lists public pages but not /lab", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/projects</loc>");
  expect(xml).toContain("/contact</loc>");
  expect(xml).not.toContain("/lab</loc>");
});

test("robots.txt allows crawling and points to the sitemap", async ({
  request,
}) => {
  const text = await (await request.get("/robots.txt")).text();
  expect(text).toContain("Allow: /");
  expect(text).toMatch(/Sitemap: https:\/\/.+\/sitemap\.xml/);
});
