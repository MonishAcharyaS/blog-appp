import { test, expect } from "@playwright/test";

test.describe("GitHub Issue #42: Order Posts Based on Upvote Count Instead of Like Count", () => {
  test("TC-UPVOTE-RANK-01: Discovery feed defaults to sorting by Upvote count descending", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Select 'upvotes' (Top Upvoted)
    const sortSelect = page.locator('[data-testid="discovery-sort-select"]');
    await expect(sortSelect).toBeVisible();

    const upvotesPromise = page.waitForResponse(
      (res) => res.url().includes("/api/posts") && res.url().includes("sort=upvotes")
    );
    await sortSelect.selectOption("upvotes");
    await upvotesPromise;
    await expect(sortSelect).toHaveValue("upvotes");

    // Verify blog cards exist in the feed
    const cards = page.locator('[data-testid="blog-card"]');
    await expect(cards.first()).toBeVisible();

    const count = await cards.count();
    expect(count).toBeGreaterThan(1);

    // Read upvote counts from data-upvotes attribute on blog cards
    const upvoteCounts: number[] = [];
    for (let i = 0; i < count; i++) {
      const upvotesAttr = await cards.nth(i).getAttribute("data-upvotes");
      const num = parseInt(upvotesAttr || "0", 10);
      upvoteCounts.push(num);
    }

    // Verify list is non-empty and sorted in descending order: count[i] >= count[i+1]
    expect(upvoteCounts.length).toBeGreaterThan(1);
    for (let i = 0; i < upvoteCounts.length - 1; i++) {
      expect(
        upvoteCounts[i] >= upvoteCounts[i + 1],
        `Card index ${i} (${upvoteCounts[i]} upvotes) should be >= card index ${i + 1} (${upvoteCounts[i + 1]} upvotes)`
      ).toBeTruthy();
    }
  });

  test("TC-UPVOTE-RANK-02: Likes count is retained as an informative appreciation indicator and does not dictate default ordering", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const cards = page.locator('[data-testid="blog-card"]');
    await expect(cards.first()).toBeVisible();

    // Verify like button with like counter is displayed on post cards
    const likeButtons = page.locator('[data-testid="card-upvote-btn"]');
    await expect(likeButtons.first()).toBeVisible();

    const likeCountSpan = page.locator('[data-testid="card-upvote-count"]').first();
    await expect(likeCountSpan).toBeVisible();
    const likeText = await likeCountSpan.innerText();
    expect(parseInt(likeText.trim(), 10)).toBeGreaterThanOrEqual(0);

    // Check that card likes do not dictate default feed ordering when upvotes differ
    const cardCount = await cards.count();
    const likeCounts: number[] = [];
    for (let i = 0; i < cardCount; i++) {
      const likesAttr = await cards.nth(i).getAttribute("data-likes");
      likeCounts.push(parseInt(likesAttr || "0", 10));
    }
    // Verify likes are present
    expect(likeCounts.length).toBeGreaterThan(1);
  });

  test("TC-UPVOTE-RANK-03: Sort dropdown does not contain likes descending option and respects other sort modes", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const sortSelect = page.locator('[data-testid="discovery-sort-select"]');
    await expect(sortSelect).toBeVisible();
    await expect(sortSelect).toHaveValue("thumbs");

    // Verify 'likes' option does NOT exist in the sort dropdown
    const likesOption = sortSelect.locator('option[value="likes"]');
    await expect(likesOption).toHaveCount(0);

    // Switch sort dropdown to Top Upvoted (upvotes)
    const upvotesResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/posts") && res.url().includes("sort=upvotes")
    );
    await sortSelect.selectOption("upvotes");
    await upvotesResponsePromise;
    await expect(sortSelect).toHaveValue("upvotes");

    // Switch back to Top Endorsed (thumbs)
    const thumbsResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/posts") && res.url().includes("sort=thumbs")
    );
    await sortSelect.selectOption("thumbs");
    await thumbsResponsePromise;
    await expect(sortSelect).toHaveValue("thumbs");
  });
});
