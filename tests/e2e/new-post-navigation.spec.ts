import { test, expect } from "@playwright/test";

test.describe("New Post Option / Button in Main Navigation (Issue #26)", () => {
  test.describe("Unauthenticated Visitors", () => {
    test("TC-26.1: Desktop 'Write' button redirects unauthenticated users to login with callbackUrl", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const writeBtn = page.locator("#nav-new-post-btn");
      await expect(writeBtn).toBeVisible();
      await expect(writeBtn).toContainText("Write");

      // Clicking write button navigates to login with callbackUrl
      await writeBtn.click();
      await page.waitForURL(/\/login/, { timeout: 15000 });
      expect(page.url()).toContain("callbackUrl=");
      expect(page.url()).toContain("admin");
      expect(page.url()).toContain("posts");
    });

    test("TC-26.2: Mobile '+ Create New Post' button redirects unauthenticated users to login with callbackUrl", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Open mobile drawer
      const hamburgerBtn = page.locator("#mobile-menu-toggle-btn");
      await expect(hamburgerBtn).toBeVisible();
      await hamburgerBtn.click();

      // Verify mobile drawer has '+ Create New Post'
      const mobileNewPostBtn = page.locator("#mobile-nav-new-post-btn");
      await expect(mobileNewPostBtn).toBeVisible();
      await expect(mobileNewPostBtn).toContainText("Create New Post");

      await mobileNewPostBtn.click();
      await page.waitForURL(/\/login/, { timeout: 15000 });
      expect(page.url()).toContain("callbackUrl=");
      expect(page.url()).toContain("admin");
      expect(page.url()).toContain("posts");
    });
  });

  test.describe("Authenticated Administrators", () => {
    test.beforeEach(async ({ page }) => {
      // Authenticate as Admin
      await page.goto("/test-auth");
      await page.waitForLoadState("networkidle");
      await page.fill("#email-input", "admin@example.com");
      await page.fill("#password-input", "Admin123!");
      await page.click("#login-btn");
      await expect(page.locator("#session-status")).toHaveText("authenticated", { timeout: 15000 });
      await expect(page.locator("#user-email")).toHaveText("admin@example.com", { timeout: 5000 });
    });

    test("TC-26.3: Desktop 'Write' button navigates directly to the new post editor", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Verify user avatar/menu is visible on the navbar confirming session state
      await expect(page.locator("#user-profile-menu-btn")).toBeVisible({ timeout: 15000 });

      const writeBtn = page.locator("#nav-new-post-btn");
      await expect(writeBtn).toBeVisible();
      await writeBtn.click();

      // Verify direct navigation to /admin/posts/new
      await page.waitForURL(/\/admin\/posts\/new/, { timeout: 15000 });
      expect(page.url()).toContain("/admin/posts/new");

      // Verify the new post editor loaded with title input and submit button
      await expect(page.locator("#post-title-input")).toBeVisible({ timeout: 10000 });
      await expect(page.locator("#save-post-btn")).toBeVisible({ timeout: 10000 });
    });

    test("TC-26.4: Profile dropdown contains 'Create New Post' option which routes to editor", async ({
      page,
    }) => {
      await page.goto("/explore");
      await page.waitForLoadState("networkidle");

      // Open user profile menu
      const profileMenuBtn = page.locator("#user-profile-menu-btn");
      await expect(profileMenuBtn).toBeVisible({ timeout: 15000 });
      await profileMenuBtn.click();

      // Verify dropdown link
      const dropdownLink = page.locator("#dropdown-new-post-link");
      await expect(dropdownLink).toBeVisible();
      await expect(dropdownLink).toContainText("Create New Post");

      await dropdownLink.click();
      await page.waitForURL(/\/admin\/posts\/new/, { timeout: 15000 });
      expect(page.url()).toContain("/admin/posts/new");
    });

    test("TC-26.5: End-to-end post creation via new post flow succeeds and appears in posts list", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Verify user is authenticated in the navbar
      await expect(page.locator("#user-profile-menu-btn")).toBeVisible({ timeout: 15000 });

      // Click nav Write button
      await page.click("#nav-new-post-btn");
      await page.waitForURL(/\/admin\/posts\/new/, { timeout: 15000 });

      const timestamp = Date.now().toString(36);
      const postTitle = `Nav Button Test Post ${timestamp}`;
      const postExcerpt = `Testing the seamless new post creation flow ${timestamp}`;

      // Fill in required details
      await page.fill("#post-title-input", postTitle);
      await page.fill("#post-excerpt-input", postExcerpt);

      // Submit post
      await page.click("#save-post-btn");

      // Should redirect to /admin/posts
      await page.waitForURL(/\/admin\/posts/, { timeout: 15000 });
      expect(page.url()).toContain("/admin/posts");

      // Wait for table to load
      await expect(page.locator("text=Loading articles...")).not.toBeVisible({ timeout: 15000 });

      // Check that newly created post is in the table
      const tableBody = page.locator("tbody");
      await expect(tableBody).toContainText(postTitle, { timeout: 15000 });
    });
  });
});
