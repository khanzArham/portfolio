import { expect, test } from "@playwright/test";

// Plan §8 "Agent readability": /llms.txt lists every public dossier and
// all of its links resolve.

test("serves plain text", async ({ request }) => {
  const response = await request.get("/llms.txt");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");
  expect(await response.text()).toMatch(/^# Arham Zahid Khan\n/);
});

test("lists every dossier in the sitemap", async ({ request }) => {
  const text = await (await request.get("/llms.txt")).text();
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const dossierUrls = [
    ...sitemap.matchAll(/<loc>([^<]+\/projects\/[^<]+)<\/loc>/g),
  ].map((m) => m[1]);

  expect(dossierUrls.length).toBeGreaterThan(0); // CI builds the fixture
  for (const url of dossierUrls) expect(text).toContain(`](${url})`);
});

test("every site link resolves", async ({ request }) => {
  const text = await (await request.get("/llms.txt")).text();
  const paths = [...text.matchAll(/\]\((https:\/\/[^)]+)\)/g)]
    .map((m) => new URL(m[1]))
    .filter((url) => url.host === "portfolio-khanzarham.vercel.app")
    .map((url) => url.pathname);

  expect(paths.length).toBeGreaterThan(0);
  for (const path of paths) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});
