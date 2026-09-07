import { test, expect } from "@playwright/test";

test.describe("Public Navigation & Footer Components E2E Tests", () => {
  test("TC-202.1: Anonymous Visitor sees 'Sign In' and 'Get Started' buttons in Navbar", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Brand logo
    await expect(page.locator("#navbar-brand-logo")).toBeVisible();

    // Visitor buttons
    const signInBtn = page.locator("#navbar-signin-btn");
    const registerBtn = page.locator("#navbar-register-btn");

    await expect(signInBtn).toBeVisible();
    await expect(signInBtn).toHaveText("Sign In");
    await expect(registerBtn).toBeVisible();
    await expect(registerBtn).toHaveText("Get Started");

    // Clicking Sign In navigates to /login
    await signInBtn.click();
    await expect(page).toHaveURL("/login");
  });

  test("TC-202.2: Authenticated Reader sees user avatar dropdown and Sign Out", async ({
    page,
  }) => {
    // 1. Log in as Reader via test portal
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");

    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Visit home page and verify Navbar reflects Reader session
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const profileBtn = page.locator("#user-profile-menu-btn");
    await expect(profileBtn).toBeVisible();
    await expect(profileBtn).toContainText("Jane Cooper");

    // Anonymous visitor buttons should NOT be visible
    await expect(page.locator("#navbar-signin-btn")).not.toBeVisible();

    // Open profile dropdown
    await profileBtn.click();
    const dropdown = page.locator("#user-profile-dropdown");
    await expect(dropdown).toBeVisible();
    await expect(dropdown).toContainText("jane@example.com");
    await expect(page.locator("#navbar-signout-btn")).toBeVisible();

    // Reader should not see admin control link
    await expect(page.locator("#navbar-admin-dashboard-link")).not.toBeVisible();

    // Test sign out
    await page.click("#navbar-signout-btn");
    await expect(page.locator("#navbar-signin-btn")).toBeVisible({ timeout: 10000 });
  });

  test("TC-202.3: Authenticated Admin sees prominent 'Admin Dashboard' badge", async ({
    page,
  }) => {
    // Log in as Admin via test portal
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");

    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // Navigate to home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Admin dashboard badge must be visible in navbar
    const adminLink = page.locator("#navbar-admin-dashboard-link");
    await expect(adminLink).toBeVisible();
    await expect(adminLink).toContainText("Admin Dashboard");

    // Clicking admin link navigates directly to /admin
    await adminLink.click();
    await expect(page).toHaveURL("/admin");
    await expect(page.locator("h1")).toHaveText("Admin Control Center");
  });

  test("TC-202.4: Mobile viewport collapses into hamburger drawer", async ({
    page,
  }) => {
    // Set viewport to mobile size (iPhone 13 dimensions)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hamburgerBtn = page.locator("#mobile-menu-toggle-btn");
    await expect(hamburgerBtn).toBeVisible();

    // Drawer should not be visible initially
    const drawer = page.locator("#mobile-nav-drawer");
    await expect(drawer).not.toBeVisible();

    // Click hamburger to open drawer
    await hamburgerBtn.click();
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("Feed");
    await expect(drawer).toContainText("Explore");

    // Click again to close drawer
    await hamburgerBtn.click();
    await expect(drawer).not.toBeVisible();
  });

  test("TC-202.5: Rapid clicking menu toggle maintains consistent state", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hamburgerBtn = page.locator("#mobile-menu-toggle-btn");
    const drawer = page.locator("#mobile-nav-drawer");

    // Rapidly toggle 5 times
    await hamburgerBtn.click();
    await hamburgerBtn.click();
    await hamburgerBtn.click();
    await hamburgerBtn.click();
    await hamburgerBtn.click();

    // Odd number of clicks -> drawer should remain open without crash or frozen state
    await expect(drawer).toBeVisible();

    // One more click -> closes cleanly
    await hamburgerBtn.click();
    await expect(drawer).not.toBeVisible();
  });

  test("TC-202.6: Footer displays newsletter capture and category exploration links", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check footer columns
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator("footer")).toContainText("Blogify");
    await expect(page.locator("footer")).toContainText("Web Development");
    await expect(page.locator("footer")).toContainText("Privacy Policy");

    // Test newsletter subscription
    await page.fill("#newsletter-email-input", "newsletter.subscriber@example.com");
    await page.click("#newsletter-submit-btn");

    const toast = page.locator("#newsletter-success-toast");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Subscribed!");
  });
});
