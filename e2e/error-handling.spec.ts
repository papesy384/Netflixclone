import { test, expect } from "@playwright/test";

test.describe("Error handling", () => {
  test("error test page loads", async ({ page }) => {
    await page.goto("/test/errors");
    await expect(page.locator("h1")).toContainText("Error Handling Tests");
  });

  test("default error boundary catches crash and shows fallback", async ({ page }) => {
    await page.goto("/test/errors");
    const crashBtn = page.getByRole("button", { name: "Trigger crash" }).first();
    await expect(crashBtn).toBeVisible();
    await crashBtn.click();
    await expect(page.getByRole("heading", { name: "Something went wrong" })).toBeVisible();
    await expect(page.locator("text=Test error: click-triggered crash")).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  });

  test("default error boundary reset button works", async ({ page }) => {
    await page.goto("/test/errors");
    const defaultSection = page.locator("section").filter({ hasText: "1. Error boundary (default" });
    await defaultSection.getByRole("button", { name: "Trigger crash" }).click();
    await expect(page.getByRole("heading", { name: "Something went wrong" })).toBeVisible();
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(defaultSection.getByRole("button", { name: "Trigger crash" })).toBeVisible();
  });

  test("custom error boundary shows custom fallback", async ({ page }) => {
    await page.goto("/test/errors");
    const sections = page.locator("section");
    const customSection = sections.filter({ has: page.locator("text=2. Error boundary (custom fallback)") });
    const crashBtn = customSection.getByRole("button", { name: "Trigger crash" });
    await crashBtn.click();
    await expect(page.locator("text=Custom fallback:")).toBeVisible();
    await expect(page.locator("text=Test error: click-triggered crash")).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  });

  test("invalid room loads (room may show sync error or create)", async ({ page }) => {
    await page.goto("/watch/invalid-room-id-12345");
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("invalid video room loads without crashing", async ({ page }) => {
    await page.goto("/watch/test?v=invalidVideoId123");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: /Copy Link|Copied!/ })).toBeVisible();
    await expect(page.getByText("Chat")).toBeVisible();
  });
});
