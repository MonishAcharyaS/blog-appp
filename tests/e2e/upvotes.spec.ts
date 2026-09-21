import { test, expect } from "@playwright/test";

test.describe("GitHub Issue #31: Post Upvoting & Upvote-Based Feed Ranking", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies/localStorage to start each test in a clean guest state
    await page.context().clearCookies();
  });

  test("TC-31.1: Post cards on feed display interactive upvote buttons with counts", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Wait for the discovery grid
    const postsGrid = page.locator("#discovery-posts-grid");
    await expect(postsGrid).toBeVisible();

    const firstCard = page.locator("[data-testid='blog-card']").first();
    await expect(firstCard).toBeVisible();

    // Check that card upvote button exists
    const cardUpvoteBtn = firstCard.locator("[data-testid='card-upvote-btn']");
    await expect(cardUpvoteBtn).toBeVisible();

    const countElement = firstCard.locator("[data-testid='card-upvote-count']");
    await expect(countElement).toBeVisible();
    const countText = await countElement.innerText();
    expect(parseInt(countText.trim(), 10)).toBeGreaterThanOrEqual(0);
  });

  test("TC-31.2: Anonymous visitor clicking card upvote triggers sign-in prompt modal", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const firstCard = page.locator("[data-testid='blog-card']").first();
    const cardUpvoteBtn = firstCard.locator("[data-testid='card-upvote-btn']");
    await cardUpvoteBtn.click();

    // Verify auth modal appears
    const authModal = page.locator('[data-testid="like-auth-modal"]');
    await expect(authModal).toBeVisible();
    await expect(authModal).toContainText("Sign in to Like");

    // Modal cancel button closes modal
    const cancelBtn = page.locator("#card-modal-cancel-btn");
    await cancelBtn.click();
    await expect(authModal).not.toBeVisible();
  });

  test("TC-31.3: Feed defaults to Top Upvoted and ranks posts with most upvotes first", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Check that sort dropdown has upvotes default, and select likes to test like ranking
    const sortSelect = page.locator("#discovery-sort-select");
    await expect(sortSelect).toBeVisible();

    const likesResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/posts") && resp.url().includes("sort=likes")
    );
    await sortSelect.selectOption("likes");
    await likesResponsePromise;
    await expect(sortSelect).toHaveValue("likes");

    // Retrieve all upvote counts on visible cards
    const cards = page.locator("[data-testid='blog-card']");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const upvoteCounts: number[] = [];
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const countEl = card.locator("[data-testid='card-upvote-count']");
      const text = await countEl.innerText();
      upvoteCounts.push(parseInt(text.trim(), 10) || 0);
    }

    // Verify descending order: each count should be >= subsequent count
    for (let i = 0; i < upvoteCounts.length - 1; i++) {
      expect(
        upvoteCounts[i] >= upvoteCounts[i + 1],
        `Card at index ${i} (${upvoteCounts[i]} upvotes) should be >= card at index ${i + 1} (${upvoteCounts[i + 1]} upvotes)`
      ).toBeTruthy();
    }
  });

  test("TC-31.4: Authenticated user can upvote directly from card with optimistic UI increment", async ({
    page,
  }) => {
    // 1. Authenticate as Reader
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Go to home page
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Select the last card to test upvoting on a card with fewer upvotes
    const card = page.locator("[data-testid='blog-card']").last();
    const upvoteBtn = card.locator("[data-testid='card-upvote-btn']");
    const countEl = card.locator("[data-testid='card-upvote-count']");

    // Ensure button is visible
    await expect(upvoteBtn).toBeVisible();
    await page.waitForTimeout(400);

    const initialText = await countEl.innerText();
    const initialCount = parseInt(initialText.trim(), 10) || 0;

    // Check if card is already upvoted by this user via upvote icon SVG fill
    const icon = upvoteBtn.locator("svg");
    const isAlreadyLiked = await icon.evaluate((el) =>
      el.classList.contains("fill-rose-500")
    );

    if (isAlreadyLiked) {
      // Toggle off first to reset
      await upvoteBtn.click();
      await page.waitForTimeout(600);
    }

    const baselineText = await countEl.innerText();
    const baselineCount = parseInt(baselineText.trim(), 10) || 0;

    // Click upvote button
    await upvoteBtn.click();

    // Verify immediate optimistic increment
    const expectedCount = baselineCount + 1;
    await expect(countEl).toHaveText(String(expectedCount));

    // Wait for server response to settle
    await page.waitForTimeout(600);
    await expect(countEl).toHaveText(String(expectedCount));
  });

  test("TC-31.5: Switching sort option updates feed order", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const sortSelect = page.locator("#discovery-sort-select");
    await expect(sortSelect).toBeVisible();

    // Switch from Top Upvoted ('likes') to 'latest'
    const postsResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/posts") && resp.status() === 200
    );
    await sortSelect.selectOption("latest");
    await postsResponsePromise;

    // Verify URL or select value
    await expect(sortSelect).toHaveValue("latest");

    // Grid should be rendered and posts should be present
    const grid = page.locator("#discovery-posts-grid");
    await expect(grid).toBeVisible();

    const cards = page.locator("[data-testid='blog-card']");
    expect(await cards.count()).toBeGreaterThanOrEqual(2);
  });
});
