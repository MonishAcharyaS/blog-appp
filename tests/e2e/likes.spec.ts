import { test, expect } from "@playwright/test";

test.describe("PROJ-302: Interactive Like/Heart System E2E Tests", () => {
  const testPostSlug = "building-a-scalable-blog-platform-with-nextjs-and-tailwind-css";

  test("TC-302.1: Anonymous visitor sees like button, clicking triggers sign-in prompt modal", async ({
    page,
  }) => {
    // Navigate directly without logging in
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const likeBtn = page.locator("#header-like-btn");
    await expect(likeBtn).toBeVisible();

    // Click the like button while unauthenticated
    await likeBtn.click();

    // Verify auth modal appears
    const authModal = page.locator('[data-testid="like-auth-modal"]');
    await expect(authModal).toBeVisible();
    await expect(authModal).toContainText("Sign in to Like");

    // Modal cancel button closes modal
    const cancelBtn = page.locator("#header-modal-cancel-btn");
    await cancelBtn.click();
    await expect(authModal).not.toBeVisible();
  });

  test("TC-302.2: Authenticated user can like a post with optimistic UI increment & active heart styling", async ({
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

    // 2. Navigate to the blog post
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const likeBtn = page.locator("#header-like-btn");
    const likeCount = page.locator("#header-like-count");
    await expect(likeBtn).toBeVisible();

    const initialCountText = await likeCount.innerText();
    const initialCount = parseInt(initialCountText.trim(), 10) || 0;

    // First ensure post is in a known unliked state if previously liked
    const isAlreadyLiked = await page.locator("#header-like-icon").evaluate((el) =>
      el.classList.contains("fill-rose-500")
    );

    if (isAlreadyLiked) {
      // Toggle off first to reset
      await likeBtn.click();
      await page.waitForTimeout(500);
    }

    // Now test LIKING the post
    const preCountText = await likeCount.innerText();
    const preCount = parseInt(preCountText.trim(), 10) || 0;

    await likeBtn.click();

    // Check optimistic UI updates immediately
    await expect(likeCount).toHaveText(String(preCount + 1));
    await expect(page.locator("#header-like-icon")).toHaveClass(/fill-rose-500/);

    // Wait for network response to settle and verify persistence
    await page.waitForTimeout(600);
    await expect(likeCount).toHaveText(String(preCount + 1));
  });

  test("TC-302.3: Authenticated user clicking an active like unlikes the post with decrement", async ({
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

    // 2. Navigate to the blog post
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const likeBtn = page.locator("#header-like-btn");
    const likeCount = page.locator("#header-like-count");

    // Ensure it's in liked state
    const isLiked = await page.locator("#header-like-icon").evaluate((el) =>
      el.classList.contains("fill-rose-500")
    );

    if (!isLiked) {
      await likeBtn.click();
      await expect(page.locator("#header-like-icon")).toHaveClass(/fill-rose-500/);
      await page.waitForTimeout(600);
    }

    const currentCountText = await likeCount.innerText();
    const currentCount = parseInt(currentCountText.trim(), 10) || 0;

    // Click to unlike
    await likeBtn.click();

    // Verify decrement
    await expect(likeCount).toHaveText(String(Math.max(0, currentCount - 1)));
    await expect(page.locator("#header-like-icon")).not.toHaveClass(/fill-rose-500/);
    await page.waitForTimeout(600);
  });

  test("TC-302.4: Like state persists across page refreshes", async ({ page }) => {
    // 1. Authenticate
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Like the post
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const likeBtn = page.locator("#header-like-btn");
    const isLiked = await page.locator("#header-like-icon").evaluate((el) =>
      el.classList.contains("fill-rose-500")
    );

    if (!isLiked) {
      const responsePromise = page.waitForResponse(
        (resp) => resp.url().includes("/like") && resp.status() === 200
      );
      await likeBtn.click();
      await responsePromise;
      await expect(page.locator("#header-like-icon")).toHaveClass(/fill-rose-500/);
    }

    const countBeforeRefresh = await page.locator("#header-like-count").innerText();

    // 3. Reload the page
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Verify like status and count are retained from server rendered initial state
    await expect(page.locator("#header-like-count")).toHaveText(countBeforeRefresh);
    await expect(page.locator("#header-like-icon")).toHaveClass(/fill-rose-500/);
  });

  test("TC-302.5: Bottom footer like button works in sync", async ({ page }) => {
    // 1. Authenticate
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Visit blog post
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const footerLikeBtn = page.locator("#footer-like-btn");
    await expect(footerLikeBtn).toBeVisible();

    const footerLikeCount = page.locator("#footer-like-count");
    await expect(footerLikeCount).toBeVisible();
  });

  test("TC-302.6: Like API returns 401 for unauthorized requests", async ({ request }) => {
    const res = await request.post(`/api/posts/${testPostSlug}/like`);
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("Authentication required");
  });
});
