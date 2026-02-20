import { test, expect } from "@playwright/test";

test("fixtures to my picks flow", async ({ page }) => {
  await page.goto("/fixtures");
  await expect(page.getByText("Fixtures")).toBeVisible();
  await page.getByRole("link", { name: "Open" }).first().click();
  await expect(page.locator("h1")).toContainText("vs");
  await page.goto("/picks");
  await expect(page.getByText("My Picks")).toBeVisible();
});
