import { test, expect } from "@playwright/test";

test.describe("RBAC Edge Middleware & Route Guard E2E Tests", () => {
  test("TC-104.2: Anonymous visitor accesses public routes cleanly without obstruction", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Blogify/);

    const healthRes = await page.goto("/api/health");
    expect(healthRes?.status()).toBe(200);
  });

  test("TC-104.3: Anonymous visitor navigating to /admin is redirected to /login?callbackUrl=%2Fadmin", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin/);
    await expect(page.locator("h1")).toHaveText("Sign In to Blogify");
  });

  test("TC-104.5: Anonymous request to /api/admin/metrics returns 401 Unauthorized", async ({
    request,
  }) => {
    const response = await request.get("/api/admin/metrics");
    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toContain("Unauthorized");
  });

  test("TC-104.4: Authenticated Reader navigating to /admin is redirected to / with error=unauthorized", async ({
    page,
  }) => {
    // 1. Log in as Reader via test-auth page
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");

    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });
    await expect(page.locator("#user-role")).toHaveText("READER");

    // 2. Reader attempts to navigate to /admin
    await page.goto("/admin");
    // Edge middleware redirects Reader to /?error=unauthorized
    await expect(page).toHaveURL(/\/\?error=unauthorized/);
  });

  test("TC-104.1: Authenticated Admin navigating to /admin accesses control center successfully (HTTP 200)", async ({
    page,
  }) => {
    // 1. Log in as Admin via test-auth page
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");

    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });
    await expect(page.locator("#user-role")).toHaveText("ADMIN");

    // 2. Admin navigates to /admin
    const response = await page.goto("/admin");
    expect(response?.status()).toBe(200);

    // Verify Admin Dashboard renders cleanly
    await expect(page.locator("h1")).toHaveText("Admin Control Center");
    await expect(page.locator("#admin-role-badge")).toHaveText("ADMIN");
    await expect(page.locator("#metric-posts")).toHaveText("4");
    await expect(page.locator("#metric-users")).toHaveText("3");
  });
});
