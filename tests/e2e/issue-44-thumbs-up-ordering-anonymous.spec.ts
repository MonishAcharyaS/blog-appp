import { test, expect } from "@playwright/test";

test.describe("GitHub Issue #44: Thumbs Up Descending Ordering and Anonymous Thumbs Up", () => {
  const testPostSlug = "building-a-scalable-blog-platform-with-nextjs-and-tailwind-css";

  test.beforeEach(async ({ page }) => {
    // Clear cookies/storage to guarantee anonymous visitor context
    await page.context().clearCookies();
  });

  test("TC-44.1: Discovery feed defaults to sorting by Thumbs Up count descending", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify sort dropdown is visible and defaults to 'thumbs' (Top Endorsed)
    const sortSelect = page.locator('[data-testid="discovery-sort-select"]');
    await expect(sortSelect).toBeVisible();
    await expect(sortSelect).toHaveValue("thumbs");

    // Blog cards must be visible
    const cards = page.locator('[data-testid="blog-card"]');
    await expect(cards.first()).toBeVisible();

    const thumbsCountsLocators = page.locator('[data-testid="card-thumbs-up-count"]');
    const count = await thumbsCountsLocators.count();
    expect(count).toBeGreaterThan(1);

    const counts: number[] = [];
    for (let i = 0; i < count; i++) {
      const text = await thumbsCountsLocators.nth(i).innerText();
      const num = parseInt(text.trim(), 10);
      if (!isNaN(num)) {
        counts.push(num);
      }
    }

    // Verify ordering is strictly descending: counts[i] >= counts[i+1]
    expect(counts.length).toBeGreaterThan(1);
    for (let i = 0; i < counts.length - 1; i++) {
      expect(
        counts[i] >= counts[i + 1],
        `Card index ${i} (${counts[i]} thumbs) should be >= card index ${i + 1} (${counts[i + 1]} thumbs)`
      ).toBeTruthy();
    }
  });

  test("TC-44.2: Anonymous visitor can thumbs up directly from a card without sign-in modal", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const firstCard = page.locator('[data-testid="blog-card"]').first();
    const thumbsBtn = firstCard.locator('[data-testid="card-thumbs-up-btn"]');
    const thumbsCount = firstCard.locator('[data-testid="card-thumbs-up-count"]');

    await expect(thumbsBtn).toBeVisible();
    const initialText = await thumbsCount.innerText();
    const initialCount = parseInt(initialText.trim(), 10) || 0;

    // Click Thumbs Up as anonymous user
    const thumbsPromise = page.waitForResponse(
      (res) => res.url().includes("/thumbs") && res.status() === 200
    );
    await thumbsBtn.click();
    await thumbsPromise;

    // Verify auth modal does NOT appear
    const authModal = page.locator('[data-testid="thumbs-auth-modal"]');
    await expect(authModal).not.toBeVisible();

    // Verify count incremented
    await expect(thumbsCount).toHaveText(String(initialCount + 1));
  });

  test("TC-44.3: Anonymous visitor can thumbs up from article page engagement bars without sign-in modal", async ({
    page,
  }) => {
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("networkidle");

    const headerThumbsBtn = page.locator('[data-testid="header-thumbs-up-btn"]');
    const headerThumbsCount = page.locator('[data-testid="header-thumbs-up-count"]');

    await expect(headerThumbsBtn).toBeVisible();
    const initialCount = parseInt((await headerThumbsCount.innerText()).trim(), 10) || 0;

    // Click Thumbs Up without logging in
    const thumbsPromise = page.waitForResponse(
      (res) => res.url().includes("/thumbs") && res.status() === 200
    );
    await headerThumbsBtn.click();
    await thumbsPromise;

    // No modal should appear
    const authModal = page.locator('[data-testid="thumbs-auth-modal"]');
    await expect(authModal).not.toBeVisible();

    // Check count incremented
    await expect(headerThumbsCount).toHaveText(String(initialCount + 1));
  });

  test("TC-44.4: Default API /api/posts returns posts ordered descending by thumbsUp count", async ({
    request,
  }) => {
    const res = await request.get("/api/posts");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.posts).toBeDefined();
    expect(data.posts.length).toBeGreaterThan(1);

    const thumbsCounts = data.posts.map((p: any) => p._count?.thumbsUp ?? 0);
    for (let i = 0; i < thumbsCounts.length - 1; i++) {
      expect(
        thumbsCounts[i] >= thumbsCounts[i + 1],
        `Post ${i} (${thumbsCounts[i]} thumbs) must be >= Post ${i + 1} (${thumbsCounts[i + 1]} thumbs)`
      ).toBeTruthy();
    }
  });
});
