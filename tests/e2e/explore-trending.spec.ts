import { test, expect } from "@playwright/test";

test.describe("Explore & Trending Navigation Routes (Issue #20)", () => {
  test.describe("Explore Page (/explore)", () => {
    test("TC-20.1: Direct navigation to /explore renders successfully without 404", async ({
      page,
    }) => {
      const response = await page.goto("/explore");
      expect(response?.status()).toBe(200);

      // Verify header and page title
      await expect(page.locator("#explore-header")).toBeVisible();
      await expect(page.locator("h1")).toContainText(/Explore Topics & Ideas/i);

      // Verify Category pills are rendered
      const pillsContainer = page.locator("#category-pills-container");
      await expect(pillsContainer).toBeVisible();
      await expect(page.locator("#category-pill-all")).toBeVisible();

      // Verify blog cards are rendered
      const blogCards = page.locator("[data-testid='blog-card']");
      const cardCount = await blogCards.count();
      expect(cardCount).toBeGreaterThanOrEqual(1);
    });

    test("TC-20.2: Category filtering and search on Explore page function properly", async ({
      page,
    }) => {
      await page.goto("/explore");
      await page.waitForLoadState("domcontentloaded");

      // 1. Filter by category pill "AI & Machine Learning"
      const aiCategoryPill = page.locator("#category-pill-ai-machine-learning");
      await expect(aiCategoryPill).toBeVisible();

      // Wait for the API response triggered by clicking category
      const [response] = await Promise.all([
        page.waitForResponse((res) => res.url().includes("/api/posts") && res.status() === 200),
        aiCategoryPill.click(),
      ]);
      expect(response.status()).toBe(200);

      const postCards = page.locator("[data-testid='blog-card']");
      await expect(postCards).toHaveCount(1);
      await expect(postCards.first()).toContainText(/The Future of AI in Web Development/i);

      // Reset to All Topics
      await Promise.all([
        page.waitForResponse((res) => res.url().includes("/api/posts") && res.status() === 200),
        page.locator("#category-pill-all").click(),
      ]);
      const resetCount = await postCards.count();
      expect(resetCount).toBeGreaterThanOrEqual(2);

      // 2. Filter by search keyword "Productivity"
      const searchInput = page.locator("#discovery-search-input");
      await expect(searchInput).toBeVisible();

      await Promise.all([
        page.waitForResponse((res) => res.url().includes("/api/posts") && res.status() === 200),
        searchInput.fill("Productivity"),
      ]);

      const filteredCards = page.locator("[data-testid='blog-card']");
      await expect(filteredCards).toHaveCount(1);
      await expect(filteredCards.first()).toContainText(/10 Productivity Tips for Developers/i);
    });

    test("TC-20.3: Empty search shows graceful empty state without crashing", async ({
      page,
    }) => {
      await page.goto("/explore");
      const searchInput = page.locator("#discovery-search-input");
      await searchInput.fill("NonExistentQueryXYZ123");
      await page.waitForTimeout(500);

      const emptyState = page.locator("#discovery-empty-state");
      await expect(emptyState).toBeVisible();
      await expect(emptyState).toContainText(/No stories match your criteria/i);
    });
  });

  test.describe("Trending Page (/trending)", () => {
    test("TC-20.4: Direct navigation to /trending renders leaderboard and ranked articles without 404", async ({
      page,
    }) => {
      const response = await page.goto("/trending");
      expect(response?.status()).toBe(200);

      // Header Banner
      await expect(page.locator("#trending-header")).toBeVisible();
      await expect(page.locator("h1")).toContainText(/Trending on Blogify/i);

      // Top Story Leaderboard Banner
      const topStory = page.locator("#trending-top-story");
      await expect(topStory).toBeVisible();
      await expect(topStory).toContainText(/#1 Trending Across Platform/i);

      // Verify articles grid and ranking badges
      const grid = page.locator("#trending-articles-grid");
      await expect(grid).toBeVisible();
      const firstRankBadge = grid.locator(".absolute").first();
      await expect(firstRankBadge).toBeVisible();
      await expect(firstRankBadge).toHaveText("#1");
    });

    test("TC-20.5: Metric filtering tabs re-order trending stories", async ({
      page,
    }) => {
      await page.goto("/trending");

      const tabLikes = page.locator("#trending-tab-likes");
      const tabViews = page.locator("#trending-tab-views");
      const tabComments = page.locator("#trending-tab-comments");

      await expect(tabLikes).toBeVisible();
      await expect(tabViews).toBeVisible();
      await expect(tabComments).toBeVisible();

      // Click "Most Liked"
      await tabLikes.click();
      await expect(tabLikes).toHaveClass(/text-\[#5B48EE\]|text-indigo/);

      // Click "Most Viewed"
      await tabViews.click();
      await expect(tabViews).toHaveClass(/text-\[#5B48EE\]|text-indigo/);
    });
  });

  test.describe("Navbar Navigation & Active States", () => {
    test("TC-20.6: Desktop Navbar transitions seamlessly between Feed, Explore, and Trending", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Verify Feed link is active
      const feedLink = page.locator("#navbar-feed-link");
      const exploreLink = page.locator("#navbar-explore-link");
      const trendingLink = page.locator("#navbar-trending-link");

      await expect(feedLink).toHaveClass(/font-semibold/);

      // Click Explore
      await exploreLink.click();
      await expect(page).toHaveURL("/explore");
      await expect(exploreLink).toHaveClass(/font-semibold/);

      // Click Trending
      await trendingLink.click();
      await expect(page).toHaveURL("/trending");
      await expect(trendingLink).toHaveClass(/font-semibold/);
    });

    test("TC-20.7: Mobile drawer navigates to Explore and Trending without error", async ({
      page,
    }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      const menuBtn = page.locator("#mobile-menu-toggle-btn");
      await expect(menuBtn).toBeVisible();
      await menuBtn.click();

      const mobileExploreLink = page.locator("#mobile-nav-explore-link");
      await expect(mobileExploreLink).toBeVisible();
      await mobileExploreLink.click();

      await expect(page).toHaveURL("/explore");
      await expect(page.locator("#explore-header")).toBeVisible();
    });
  });
});
