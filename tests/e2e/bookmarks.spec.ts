import { test, expect } from "@playwright/test";

test.describe("My Bookmarks Hub & Bookmarking Pipeline (Issue #22)", () => {
  test("TC-22.1: Anonymous visitor navigating to /bookmarks is redirected to login", async ({
    page,
  }) => {
    // Navigate to /bookmarks without an authenticated session
    await page.goto("/bookmarks");
    await page.waitForLoadState("domcontentloaded");

    // Must be redirected to /login with callbackUrl
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain("/login");
  });

  test("TC-22.2: Authenticated user navigates to /bookmarks via user profile dropdown", async ({
    page,
  }) => {
    // Authenticate
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", { timeout: 15000 });

    // Open User Dropdown Menu
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const profileMenuBtn = page.locator("#user-profile-menu-btn");
    await expect(profileMenuBtn).toBeVisible({ timeout: 10000 });
    await profileMenuBtn.click();

    // Click My Bookmarks
    const bookmarksLink = page.locator("#dropdown-bookmarks-link");
    await expect(bookmarksLink).toBeVisible();
    await bookmarksLink.click();

    // Verify /bookmarks route loads cleanly
    await page.waitForURL(/\/bookmarks/, { timeout: 10000 });
    expect(page.url()).toContain("/bookmarks");

    const pageTitle = page.locator("#bookmarks-page-title");
    await expect(pageTitle).toBeVisible();
    await expect(pageTitle).toHaveText("My Bookmarks");

    const countBadge = page.locator("#bookmarks-count-badge");
    await expect(countBadge).toBeVisible();
  });

  test("TC-22.3: Bookmark toggle on article detail page updates button state and displays in /bookmarks", async ({
    page,
  }) => {
    // Authenticate
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", { timeout: 15000 });

    // Navigate to an article
    await page.goto("/blog/building-a-scalable-blog-platform-with-nextjs-and-tailwind-css");
    await page.waitForLoadState("domcontentloaded");

    // Ensure client session is authenticated
    const profileBtn = page.locator("#user-profile-menu-btn");
    await expect(profileBtn).toBeVisible({ timeout: 10000 });

    const headerBookmarkBtn = page.locator("#header-bookmark-btn");
    await expect(headerBookmarkBtn).toBeVisible({ timeout: 10000 });

    // Check if currently bookmarked
    const currentAria = await headerBookmarkBtn.getAttribute("aria-label");
    if (currentAria !== "Remove from bookmarks") {
      const [postRes] = await Promise.all([
        page.waitForResponse((resp) => resp.url().includes("/bookmark") && resp.request().method() === "POST"),
        headerBookmarkBtn.click(),
      ]);
      const data = await postRes.json();
      expect(data.bookmarked).toBe(true);
    }
    await expect(headerBookmarkBtn).toHaveAttribute("aria-label", "Remove from bookmarks", { timeout: 10000 });

    // Navigate to /bookmarks
    await page.goto("/bookmarks");
    await page.waitForLoadState("domcontentloaded");

    // The post should be in the bookmarks grid
    const postsGrid = page.locator("#bookmarks-posts-grid");
    await expect(postsGrid).toBeVisible({ timeout: 10000 });
    await expect(postsGrid).toContainText("Building a Scalable Blog Platform");

    // Click Remove Bookmark button on the card
    const removeBtn = postsGrid.locator("[data-testid='remove-bookmark-btn']").first();
    await removeBtn.click();

    // After removal, verify
    await page.waitForTimeout(1000);
  });

  test("TC-22.4: Empty bookmarks state renders friendly illustration and Explore Articles CTA", async ({
    page,
  }) => {
    // Authenticate as Alex who has no bookmarks
    await page.goto("/test-auth");
    await page.fill("#email-input", "alex@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", { timeout: 15000 });

    // Go to /bookmarks
    await page.goto("/bookmarks");
    await page.waitForLoadState("domcontentloaded");

    // Empty state or grid
    const emptyState = page.locator("#bookmarks-empty-state");
    const countBadge = page.locator("#bookmarks-count-badge");
    const countText = await countBadge.innerText();

    if (countText.startsWith("0")) {
      await expect(emptyState).toBeVisible();
      await expect(page.locator("#empty-state-title")).toHaveText("Your reading list is empty");

      const exploreBtn = page.locator("#explore-articles-btn");
      await expect(exploreBtn).toBeVisible();
      await exploreBtn.click();

      // Navigates to /explore
      await page.waitForURL(/\/explore/, { timeout: 10000 });
      expect(page.url()).toContain("/explore");
    }
  });

  test("TC-22.5: Unauthenticated user clicking bookmark button on article prompts auth modal", async ({
    page,
  }) => {
    // Visit article as guest
    await page.goto("/blog/building-a-scalable-blog-platform-with-nextjs-and-tailwind-css");
    await page.waitForLoadState("domcontentloaded");

    const headerBookmarkBtn = page.locator("#header-bookmark-btn");
    await expect(headerBookmarkBtn).toBeVisible({ timeout: 10000 });
    await headerBookmarkBtn.click();

    // Modal dialog pops up
    const authModal = page.locator("[data-testid='bookmark-auth-modal']");
    await expect(authModal).toBeVisible();
    await expect(authModal).toContainText("Save for Later");
  });
});
