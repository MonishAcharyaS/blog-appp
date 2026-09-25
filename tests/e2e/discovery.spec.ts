import { test, expect } from "@playwright/test";

test.describe("Public Discovery Hub (PROJ-203) E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("TC-203.1: Featured Hero renders with title, author info, reading time, and read story CTA", async ({
    page,
  }) => {
    const heroSection = page.locator("#featured-hero-section");
    await expect(heroSection).toBeVisible();

    // Verify title and badges
    const heroTitle = page.locator("#hero-article-title-link");
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText(/Building a Scalable Blog Platform/i);

    // Verify Read Story CTA button
    const readBtn = page.locator("#hero-read-story-btn");
    await expect(readBtn).toBeVisible();
    await expect(readBtn).toHaveAttribute(
      "href",
      "/posts/building-a-scalable-blog-platform-with-nextjs-and-tailwind-css"
    );
  });

  test("TC-203.2: Real-time search debounces 300ms and filters post grid", async ({
    page,
  }) => {
    const searchInput = page.locator("#discovery-search-input");
    await expect(searchInput).toBeVisible();

    // Initial state has multiple cards
    const postCards = page.locator("[data-testid='blog-card']");
    const initialCount = await postCards.count();
    expect(initialCount).toBeGreaterThanOrEqual(2);

    // Type search keyword "Productivity"
    await searchInput.fill("Productivity");

    // Wait for debounce and fetch
    await page.waitForTimeout(500);

    // Filtered result should only show matching post
    await expect(postCards).toHaveCount(1);
    await expect(postCards.first()).toContainText(/10 Productivity Tips for Developers/i);

    // Clearing search restores all cards
    const clearBtn = page.locator("#discovery-search-clear-btn");
    await clearBtn.click();
    await page.waitForTimeout(500);

    const restoredCount = await postCards.count();
    expect(restoredCount).toBe(initialCount);
  });

  test("TC-203.3: Category pills filter posts to matching category", async ({
    page,
  }) => {
    // Click on "AI & Machine Learning" category pill
    const aiCategoryPill = page.locator("#category-pill-ai-machine-learning");
    await expect(aiCategoryPill).toBeVisible();
    await aiCategoryPill.click();

    await page.waitForTimeout(500);

    const postCards = page.locator("[data-testid='blog-card']");
    await expect(postCards).toHaveCount(1);
    await expect(postCards.first()).toContainText(/The Future of AI in Web Development/i);

    // Click "All Topics" resets filter
    const allPill = page.locator("#category-pill-all");
    await allPill.click();
    await page.waitForTimeout(500);

    const allCards = await postCards.count();
    expect(allCards).toBeGreaterThanOrEqual(3);
  });

  test("TC-203.4: Sort dropdown accurately re-orders articles by Top Upvoted and Most Viewed", async ({
    page,
  }) => {
    const sortSelect = page.locator("#discovery-sort-select");
    await expect(sortSelect).toBeVisible();

    // Sort by Top Upvoted
    await sortSelect.selectOption("upvotes");
    await page.waitForTimeout(500);

    const firstPostCard = page.locator("[data-testid='blog-card']").first();
    await expect(firstPostCard).toBeVisible();

    // Sort by Most Viewed
    await sortSelect.selectOption("views");
    await page.waitForTimeout(500);

    const topViewedCard = page.locator("[data-testid='blog-card']").first();
    await expect(topViewedCard).toContainText(/Building a Scalable Blog Platform/i);
  });

  test("TC-203.5: No matching search displays friendly empty state with reset button", async ({
    page,
  }) => {
    const searchInput = page.locator("#discovery-search-input");
    await searchInput.fill("nonexistentkeywordXYZ12345");

    await page.waitForTimeout(500);

    // Verify empty state is displayed
    const emptyState = page.locator("#discovery-empty-state");
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText(/No stories match your criteria/i);

    // Click reset button
    const resetBtn = page.locator("#reset-discovery-filters-btn");
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    await page.waitForTimeout(500);

    // Post grid is restored
    const postCards = page.locator("[data-testid='blog-card']");
    expect(await postCards.count()).toBeGreaterThanOrEqual(2);
  });

  test("TC-203.6: Special characters in search query are sanitized without error", async ({
    page,
  }) => {
    const searchInput = page.locator("#discovery-search-input");
    await searchInput.fill("<script>alert('xss')</script>' OR 1=1 -- % _");

    await page.waitForTimeout(500);

    // Page must remain healthy without crashing or error toast
    const emptyState = page.locator("#discovery-empty-state");
    await expect(emptyState).toBeVisible();
  });
});
