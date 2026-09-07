import { test, expect } from "@playwright/test";

test.describe("PROJ-401: Admin Dashboard Layout & Metric Overview Cards E2E Tests", () => {
  test("TC-401.1: Authenticated Admin logs in and displays all 6 KPI cards with live database counts", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });
    await expect(page.locator("#user-role")).toHaveText("ADMIN");

    // 2. Navigate to /admin
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    // Verify Title & Admin badge
    await expect(page.locator("h1")).toHaveText("Admin Control Center");
    await expect(page.locator("#admin-role-badge")).toHaveText("ADMIN");

    // Verify 6 KPI Cards are all present with accurate counts
    const kpiPosts = page.locator("#metric-posts");
    const kpiPublished = page.locator("#metric-published");
    const kpiViews = page.locator("#metric-views");
    const kpiLikes = page.locator("#metric-likes");
    const kpiComments = page.locator("#metric-comments");
    const kpiUsers = page.locator("#metric-users");

    await expect(kpiPosts).toBeVisible();
    await expect(kpiPublished).toBeVisible();
    await expect(kpiViews).toBeVisible();
    await expect(kpiLikes).toBeVisible();
    await expect(kpiComments).toBeVisible();
    await expect(kpiUsers).toBeVisible();

    // Verify post count and user count match DB values (>= 4 posts, >= 3 users)
    const postsVal = parseInt(await kpiPosts.innerText(), 10);
    const usersVal = parseInt(await kpiUsers.innerText(), 10);
    expect(postsVal).toBeGreaterThanOrEqual(4);
    expect(usersVal).toBeGreaterThanOrEqual(3);
  });

  test("TC-401.2: Sidebar navigation renders and highlights active /admin route", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Go to /admin
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    const sidebar = page.locator("#admin-sidebar");
    await expect(sidebar).toBeVisible();

    // Verify Overview link is highlighted as active
    const overviewLink = page.locator("#admin-nav-overview");
    await expect(overviewLink).toBeVisible();
    await expect(overviewLink).toHaveClass(/bg-\[#5B48EE\]/);
  });

  test("TC-401.3: 'Return to Website' link navigates back to homepage cleanly", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Go to /admin
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    // Click Return to Website
    const returnLink = page.locator("#return-to-site-link");
    await expect(returnLink).toBeVisible();
    await returnLink.click();

    // Should navigate to homepage
    await expect(page).toHaveURL("/");
    await expect(page.locator("#featured-hero-section")).toBeVisible();
  });

  test("TC-401.4: Recent activity table renders recent articles with metadata", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Go to /admin
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    const recentTable = page.locator("#recent-articles-table");
    await expect(recentTable).toBeVisible();
    await expect(recentTable.locator("tr")).toHaveCount(6); // 1 header + 5 recent posts
  });

  test("TC-401.5: Anonymous visitor attempting to access /admin is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin/);
  });

  test("TC-401.6: Authenticated Reader attempting to access /admin is redirected with unauthorized error", async ({
    page,
  }) => {
    // 1. Log in as Reader
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });
    await expect(page.locator("#user-role")).toHaveText("READER");

    // 2. Navigate to /admin
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/\?error=unauthorized/);
  });
});
