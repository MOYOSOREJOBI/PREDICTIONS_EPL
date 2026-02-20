import { test, expect } from "@playwright/test";

test("fixtures -> add pick -> picks", async ({ page }) => {
  await page.goto("/fixtures");
  await expect(page.getByText("Fixtures")).toBeVisible();
  await page.getByRole("link", { name: "Open" }).first().click();
  await page.getByRole("button", { name: "Add to slip" }).click();
  await page.goto("/picks");
  await expect(page.getByText("My Picks")).toBeVisible();
});
