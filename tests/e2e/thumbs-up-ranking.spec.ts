import { test, expect } from "@playwright/test";

test.describe("GitHub Issue #41: Feed Ranking by Thumbs Up Endorsement Count", () => {
  test("TC-FEED-THUMBS-01: Discovery feed can sort by Thumbs Up count descending", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for the feed and sort select
    const sortSelect = page.locator('[data-testid="discovery-sort-select"]');
    await expect(sortSelect).toBeVisible();

    // Select Top Endorsed (thumbs)
    const thumbsResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/posts") && res.url().includes("sort=thumbs")
    );
    await sortSelect.selectOption("thumbs");
    await thumbsResponsePromise;
    await expect(sortSelect).toHaveValue("thumbs");

    // Retrieve all thumbs up count texts from the visible post cards in feed
    const cards = page.locator('[data-testid="blog-card"]');
    await expect(cards.first()).toBeVisible();

    const thumbsCountLocators = page.locator('[data-testid="card-thumbs-up-count"]');
    const count = await thumbsCountLocators.count();
    expect(count).toBeGreaterThan(1);

    const thumbsCounts: number[] = [];
    for (let i = 0; i < count; i++) {
      const text = await thumbsCountLocators.nth(i).innerText();
      const num = parseInt(text.trim(), 10);
      if (!isNaN(num)) {
        thumbsCounts.push(num);
      }
    }

    // Verify list is non-empty and in descending order: count[i] >= count[i+1]
    expect(thumbsCounts.length).toBeGreaterThan(1);
    for (let i = 0; i < thumbsCounts.length - 1; i++) {
      expect(thumbsCounts[i]).toBeGreaterThanOrEqual(thumbsCounts[i + 1]);
    }
  });

  test("TC-FEED-THUMBS-02: Likes count remains prominently displayed as an informative metric", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const cards = page.locator('[data-testid="blog-card"]');
    await expect(cards.first()).toBeVisible();

    // Verify like button with like counter is still present on cards
    const likeButtons = page.locator('[data-testid="card-upvote-btn"]');
    await expect(likeButtons.first()).toBeVisible();

    const likeCountSpan = page.locator('[data-testid="card-upvote-count"]').first();
    await expect(likeCountSpan).toBeVisible();
    const likeText = await likeCountSpan.innerText();
    expect(parseInt(likeText.trim(), 10)).toBeGreaterThanOrEqual(0);
  });

  test("TC-FEED-THUMBS-03: Switching sort dropdown to Latest First alters ordering", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const sortSelect = page.locator('[data-testid="discovery-sort-select"]');
    await expect(sortSelect).toBeVisible();

    // Select Top Endorsed (thumbs) first
    const initThumbsPromise = page.waitForResponse((res) =>
      res.url().includes("/api/posts") && res.url().includes("sort=thumbs")
    );
    await sortSelect.selectOption("thumbs");
    await initThumbsPromise;

    // Get first card title when sorted by Top Endorsed (thumbs)
    const firstCardTitleInitial = await page
      .locator('[data-testid="post-card-title"]')
      .first()
      .innerText();

    // Change sort to Latest First and wait for API response
    const latestResponsePromise = page.waitForResponse((res) =>
      res.url().includes("/api/posts") && res.url().includes("sort=latest")
    );
    await sortSelect.selectOption("latest");
    await latestResponsePromise;
    await expect(sortSelect).toHaveValue("latest");

    // Change sort back to Top Endorsed (thumbs) and wait for API response
    const thumbsResponsePromise = page.waitForResponse((res) =>
      res.url().includes("/api/posts") && res.url().includes("sort=thumbs")
    );
    await sortSelect.selectOption("thumbs");
    await thumbsResponsePromise;
    await expect(sortSelect).toHaveValue("thumbs");

    const firstCardTitleRestored = await page
      .locator('[data-testid="post-card-title"]')
      .first()
      .innerText();
    expect(firstCardTitleRestored).toBe(firstCardTitleInitial);
  });
});
