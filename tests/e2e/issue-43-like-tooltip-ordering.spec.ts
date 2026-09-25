import { test, expect } from "@playwright/test";

test.describe("GitHub Issue #43: Remove Like-Count Descending Ordering and Fix Like Button Hover Tooltip", () => {
  const testPostSlug = "building-a-scalable-blog-platform-with-nextjs-and-tailwind-css";

  test("TC-43.1: Hovering on Like button displays 'Like post' (and 'Unlike post' when active), not 'Upvote'", async ({
    page,
  }) => {
    // 1. Visit article page
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const headerLikeBtn = page.locator("#header-like-btn");
    await expect(headerLikeBtn).toBeVisible();

    // Verify initial unliked state title and aria-label
    await expect(headerLikeBtn).toHaveAttribute("title", "Like post");
    await expect(headerLikeBtn).toHaveAttribute("aria-label", "Like post");

    // Ensure title does NOT contain 'Upvote'
    const titleAttr = await headerLikeBtn.getAttribute("title");
    expect(titleAttr).not.toContain("Upvote");
    const ariaLabelAttr = await headerLikeBtn.getAttribute("aria-label");
    expect(ariaLabelAttr).not.toContain("Upvote");

    // Check footer like button as well
    const footerLikeBtn = page.locator("#footer-like-btn");
    await expect(footerLikeBtn).toBeVisible();
    await expect(footerLikeBtn).toHaveAttribute("title", "Like post");
    await expect(footerLikeBtn).toHaveAttribute("aria-label", "Like post");

    // Check card like button on home feed
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const firstCard = page.locator("[data-testid='blog-card']").first();
    await expect(firstCard).toBeVisible();

    const cardLikeBtn = firstCard.locator("[data-testid='card-upvote-btn']");
    await expect(cardLikeBtn).toBeVisible();
    await expect(cardLikeBtn).toHaveAttribute("title", "Like post");
    await expect(cardLikeBtn).toHaveAttribute("aria-label", "Like post");
  });

  test("TC-43.2: Sort dropdown does NOT contain any option to arrange blogs in descending order of likes", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const sortSelect = page.locator('[data-testid="discovery-sort-select"]');
    await expect(sortSelect).toBeVisible();

    // Check that 'likes' option is completely absent from the sort options
    const likesOption = sortSelect.locator('option[value="likes"]');
    await expect(likesOption).toHaveCount(0);

    // Verify allowed options are present: upvotes, thumbs, latest, views
    await expect(sortSelect.locator('option[value="upvotes"]')).toHaveCount(1);
    await expect(sortSelect.locator('option[value="thumbs"]')).toHaveCount(1);
    await expect(sortSelect.locator('option[value="latest"]')).toHaveCount(1);
    await expect(sortSelect.locator('option[value="views"]')).toHaveCount(1);
  });

  test("TC-43.3: API /api/posts?sort=likes does not sort posts descending by likes count", async ({
    request,
  }) => {
    const res = await request.get("/api/posts?sort=likes");
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.posts).toBeDefined();
    expect(data.posts.length).toBeGreaterThan(1);

    // Verify posts are ordered by upvotes or date, and not sorted descending by like count
    // If like counts happen to be arbitrary or identical, verify upvotes ordering holds
    const upvotes = data.posts.map((p: any) => p._count?.upvotes ?? 0);
    for (let i = 0; i < upvotes.length - 1; i++) {
      expect(
        upvotes[i] >= upvotes[i + 1],
        `Upvote order should hold rather than likes: index ${i} (${upvotes[i]}) >= index ${i + 1} (${upvotes[i + 1]})`
      ).toBeTruthy();
    }
  });

  test("TC-43.4: Authenticated user liking and unliking toggles tooltip between 'Like post' and 'Unlike post'", async ({
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

    // 2. Navigate to test post
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("networkidle");

    const likeBtn = page.locator("#header-like-btn");
    await expect(likeBtn).toBeVisible();

    // Check if post is currently liked by this user
    const icon = page.locator("#header-like-icon");
    const isAlreadyLiked = await icon.evaluate((el) => el.classList.contains("fill-rose-500"));

    if (isAlreadyLiked) {
      // It's liked, title should be "Unlike post"
      await expect(likeBtn).toHaveAttribute("title", "Unlike post");

      // Click to unlike, wait for POST API response
      const unlikeResponse = page.waitForResponse(
        (resp) => resp.url().includes("/like") && resp.status() === 200
      );
      await likeBtn.click();
      await unlikeResponse;
      await expect(likeBtn).toHaveAttribute("title", "Like post");

      // Click to like, wait for POST API response
      const likeResponse = page.waitForResponse(
        (resp) => resp.url().includes("/like") && resp.status() === 200
      );
      await likeBtn.click();
      await likeResponse;
      await expect(likeBtn).toHaveAttribute("title", "Unlike post");
    } else {
      // It's unliked, title should be "Like post"
      await expect(likeBtn).toHaveAttribute("title", "Like post");

      // Click to like, wait for POST API response
      const likeResponse = page.waitForResponse(
        (resp) => resp.url().includes("/like") && resp.status() === 200
      );
      await likeBtn.click();
      await likeResponse;
      await expect(likeBtn).toHaveAttribute("title", "Unlike post");

      // Click to unlike, wait for POST API response
      const unlikeResponse = page.waitForResponse(
        (resp) => resp.url().includes("/like") && resp.status() === 200
      );
      await likeBtn.click();
      await unlikeResponse;
      await expect(likeBtn).toHaveAttribute("title", "Like post");
    }
  });
});
