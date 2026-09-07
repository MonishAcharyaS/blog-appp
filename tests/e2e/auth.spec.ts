import { test, expect } from "@playwright/test";

test.describe("NextAuth Interactive Authentication Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
  });

  test("TC-103.1 (Browser): Logs in as Admin and displays role ADMIN and user name", async ({
    page,
  }) => {
    // Fill credentials for Admin
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");

    // Expect session status authenticated
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });
    await expect(page.locator("#user-name")).toHaveText("Platform Administrator");
    await expect(page.locator("#user-email")).toHaveText("admin@example.com");
    await expect(page.locator("#user-role")).toHaveText("ADMIN");

    // Test sign-out
    await page.click("#logout-btn");
    await expect(page.locator("#session-status")).toHaveText("unauthenticated", {
      timeout: 10000,
    });
    await expect(page.locator("#email-input")).toBeVisible();
  });

  test("TC-103.2 (Browser): Logs in as Reader and displays role READER", async ({
    page,
  }) => {
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");

    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });
    await expect(page.locator("#user-name")).toHaveText("Jane Cooper");
    await expect(page.locator("#user-role")).toHaveText("READER");

    await page.click("#logout-btn");
    await expect(page.locator("#session-status")).toHaveText("unauthenticated", {
      timeout: 10000,
    });
  });

  test("TC-103.5 (Browser): Rejects invalid password with error message", async ({
    page,
  }) => {
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "WrongPassword!");
    await page.click("#login-btn");

    await expect(page.locator("#error-message")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#session-status")).toHaveText("unauthenticated");
  });

  test("TC-103.6 (Browser): Rejects banned user account", async ({
    page,
  }) => {
    await page.fill("#email-input", "banned@example.com");
    await page.fill("#password-input", "Banned123!");
    await page.click("#login-btn");

    await expect(page.locator("#error-message")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#session-status")).toHaveText("unauthenticated");
  });
});
