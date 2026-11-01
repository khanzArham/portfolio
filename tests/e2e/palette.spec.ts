import { expect, test } from "@playwright/test";

// Step 21: the palette works with the keyboard alone.
const shortcut = process.platform === "darwin" ? "Meta+K" : "Control+K";

test("opens with the shortcut, filters, and navigates with the keyboard", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press(shortcut);
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  await expect(dialog).toBeVisible();

  await page.keyboard.type("order tracker");
  await expect(
    dialog.getByRole("option", { name: /Order Tracker/ }).first(),
  ).toBeVisible();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/projects\/order-tracker$/);
  await expect(dialog).toBeHidden();
});

test("arrow keys move the selection across groups", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press(shortcut);
  await page.keyboard.type("skills");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/skills$/);

  await page.keyboard.press(shortcut);
  await page.keyboard.type("theme");
  await page.keyboard.press("ArrowDown"); // light -> dark
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("shows keyword results from the site index", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press(shortcut);
  await page.keyboard.type("firebase");
  await expect(
    page.getByRole("group", { name: /Dossiers|Search results/ }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("option", { name: /Order Tracker/ }).first(),
  ).toBeVisible();
});

test("Escape closes the palette and returns focus to the trigger", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Search", exact: true });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("skills highlight the dossiers that used them", async ({ page }) => {
  await page.goto("/skills");
  const react = page.getByRole("button", { name: /^React/ });
  await react.focus();
  await page.keyboard.press("Enter");
  await expect(react).toHaveAttribute("aria-pressed", "true");

  const evidence = page.getByRole("region", { name: "Evidence" });
  await expect(evidence.getByRole("status")).toContainText("Order Tracker");
  await expect(
    evidence.locator("li[data-highlighted]", { hasText: "Order Tracker" }),
  ).toContainText("Uses React");
});
