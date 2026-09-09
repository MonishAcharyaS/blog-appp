import { test, expect } from "@playwright/test";

test.describe("Global Navbar Search Bar & Route Synchronization (Issue #23)", () => {
  test("TC-23.1: Global keyboard shortcut (Cmd+K / Ctrl+K) focuses the navbar search bar", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const searchInput = page.locator("#navbar-search-input");
    await expect(searchInput).toBeVisible();

    // Verify initially not focused
    await expect(searchInput).not.toBeFocused();

    // Press Control+k or Meta+k
    await page.keyboard.press("Control+k");
    await expect(searchInput).toBeFocused();
  });

  test("TC-23.2: Submitting a search query in navbar navigates to /explore and filters articles", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const searchInput = page.locator("#navbar-search-input");
    await expect(searchInput).toBeVisible();

    // Fill in a query that exists
    await searchInput.fill("Scalable");
    await page.keyboard.press("Enter");

    // Should navigate to /explore?search=Scalable
    await page.waitForURL(/\/explore\?search=Scalable/, { timeout: 10000 });
    expect(page.url()).toContain("/explore?search=Scalable");

    // Verify discovery grid has matching post
    const postsGrid = page.locator("#discovery-posts-grid");
    await expect(postsGrid).toBeVisible({ timeout: 10000 });
    await expect(postsGrid).toContainText("Scalable");

    // Verify the search bar in the discovery feed is synchronized
    const discoverySearchInput = page.locator("#discovery-search-input");
    await expect(discoverySearchInput).toHaveValue("Scalable");
  });

  test("TC-23.3: Navbar search clear button resets input and allows clearing query", async ({
    page,
  }) => {
    await page.goto("/explore?search=Scalable");
    await page.waitForLoadState("domcontentloaded");

    const searchInput = page.locator("#navbar-search-input");
    await expect(searchInput).toHaveValue("Scalable");

    const clearBtn = page.locator("#navbar-search-clear-btn");
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // Input should be empty and URL updated to /explore
    await expect(searchInput).toHaveValue("");
    await page.waitForURL(url => !url.searchParams.has("search"), { timeout: 10000 });
  });

  test("TC-23.4: Searching for non-existent keyword displays clean empty state without errors", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const searchInput = page.locator("#navbar-search-input");
    await searchInput.fill("nonexistentquery999zzz");
    await page.keyboard.press("Enter");

    await page.waitForURL(/\/explore\?search=nonexistentquery999zzz/, { timeout: 10000 });

    const emptyState = page.locator("#discovery-empty-state");
    await expect(emptyState).toBeVisible({ timeout: 10000 });
    await expect(emptyState).toContainText("No stories match your criteria");

    const resetBtn = page.locator("#discovery-reset-filters-btn");
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Posts should reappear
    const postsGrid = page.locator("#discovery-posts-grid");
    await expect(postsGrid).toBeVisible({ timeout: 10000 });
  });

  test("TC-23.5: Whitespace-only search query does not break the active page or feed", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const searchInput = page.locator("#navbar-search-input");
    await searchInput.fill("     ");
    await page.keyboard.press("Enter");

    // Should remain on the homepage without error
    expect(page.url()).not.toContain("search=");
    const heroSection = page.locator("#featured-hero-section");
    await expect(heroSection).toBeVisible();
  });

  test("TC-23.6: Mobile drawer search input submits and navigates to /explore", async ({
    page,
  }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Open mobile menu
    const mobileMenuBtn = page.locator("#mobile-menu-toggle-btn");
    await expect(mobileMenuBtn).toBeVisible();
    await mobileMenuBtn.click();

    const mobileSearchInput = page.locator("#mobile-navbar-search-input");
    await expect(mobileSearchInput).toBeVisible();

    await mobileSearchInput.fill("Scalable");
    await page.locator("#mobile-navbar-search-submit-btn").click();

    await page.waitForURL(/\/explore\?search=Scalable/, { timeout: 10000 });
    expect(page.url()).toContain("/explore?search=Scalable");
  });
});
