import { test, expect } from "@playwright/test";

test.describe("GitHub Issue #40: Dedicated Thumbs Up Action Button Next to Like and Comment", () => {
  async function loginAsReader(page: any) {
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });
  }

  test("TC-THUMBS-01: Feed blog card displays dedicated Thumbs Up button adjacent to like and comment", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const firstCard = page.locator('[data-testid="blog-card"]').first();
    await expect(firstCard).toBeVisible();

    // 1. Verify Like button is present
    const likeBtn = firstCard.locator('[data-testid="card-upvote-btn"]');
    await expect(likeBtn).toBeVisible();

    // 2. Verify Thumbs Up button is present right next to Like
    const thumbsUpBtn = firstCard.locator('[data-testid="card-thumbs-up-btn"]');
    await expect(thumbsUpBtn).toBeVisible();

    // 3. Verify comments link is present
    const commentsLink = firstCard.locator('a[title*="comments"]');
    await expect(commentsLink).toBeVisible();

    // 4. Verify Thumbs Up count is rendered
    const thumbsCount = firstCard.locator('[data-testid="card-thumbs-up-count"]');
    await expect(thumbsCount).toBeVisible();
    const countText = await thumbsCount.innerText();
    expect(parseInt(countText, 10)).toBeGreaterThanOrEqual(0);
  });

  test("TC-THUMBS-02: Single post view displays Thumbs Up button in header and footer engagement bars", async ({
    page,
  }) => {
    await page.goto("/blog/building-a-scalable-blog-platform-with-nextjs-and-tailwind-css");
    await page.waitForLoadState("domcontentloaded");

    // Header thumbs up button
    const headerThumbsBtn = page.locator('[data-testid="header-thumbs-up-btn"]');
    await expect(headerThumbsBtn).toBeVisible();

    // Footer thumbs up button
    const footerThumbsBtn = page.locator('[data-testid="footer-thumbs-up-btn"]');
    await expect(footerThumbsBtn).toBeVisible();
  });

  test("TC-THUMBS-03: Authenticated reader clicks Thumbs Up to increment and toggle reaction", async ({
    page,
  }) => {
    await loginAsReader(page);

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const firstCard = page.locator('[data-testid="blog-card"]').first();
    const thumbsUpBtn = firstCard.locator('[data-testid="card-thumbs-up-btn"]');
    const thumbsCount = firstCard.locator('[data-testid="card-thumbs-up-count"]');

    const initialCount = parseInt(await thumbsCount.innerText(), 10);

    // Click Thumbs Up
    await thumbsUpBtn.click();
    await page.waitForTimeout(200);

    // Count increments by 1
    const newCount = parseInt(await thumbsCount.innerText(), 10);
    expect(newCount).toBe(initialCount + 1);

    // Click again to toggle off / retract
    await thumbsUpBtn.click();
    await page.waitForTimeout(200);

    const revertedCount = parseInt(await thumbsCount.innerText(), 10);
    expect(revertedCount).toBe(initialCount);
  });

  test("TC-THUMBS-NEG-01: Anonymous visitor clicking Thumbs Up increments count directly without sign-in modal", async ({
    page,
  }) => {
    // Clear cookies & storage to ensure visitor is anonymous
    await page.context().clearCookies();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const firstCard = page.locator('[data-testid="blog-card"]').first();
    const thumbsUpBtn = firstCard.locator('[data-testid="card-thumbs-up-btn"]');
    const thumbsCount = firstCard.locator('[data-testid="card-thumbs-up-count"]');

    const initialCount = parseInt(await thumbsCount.innerText(), 10);

    // Click Thumbs Up without logging in
    const thumbsResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/thumbs") && res.status() === 200
    );
    await thumbsUpBtn.click();
    await thumbsResponsePromise;

    // Verify modal does NOT appear
    const authModal = page.locator('[data-testid="thumbs-auth-modal"]');
    await expect(authModal).not.toBeVisible();

    // Verify count increments
    const newCount = parseInt(await thumbsCount.innerText(), 10);
    expect(newCount).toBe(initialCount + 1);
  });
});
