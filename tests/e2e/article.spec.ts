import { test, expect } from "@playwright/test";

test.describe("Single Blog Article Page (PROJ-301) E2E Tests", () => {
  const publishedSlug = "building-a-scalable-blog-platform-with-nextjs-and-tailwind-css";
  const draftSlug = "upcoming-architectural-preview-draft";

  test("TC-301.1: Visiting /blog/[slug] displays full article, metadata, tags, and author bio", async ({
    page,
  }) => {
    await page.goto(`/blog/${publishedSlug}`);
    await page.waitForLoadState("domcontentloaded");

    // Verify Title and excerpt
    const title = page.locator("#article-title");
    await expect(title).toBeVisible();
    await expect(title).toContainText(/Building a Scalable Blog Platform/i);

    // Verify Category badge and reading time
    await expect(page.locator("#article-category-badge")).toHaveText(/Web Development/i);
    await expect(page.locator("#article-reading-time")).toContainText("5 min read");

    // Verify formatted content body
    const contentBody = page.locator("#article-content-body");
    await expect(contentBody).toBeVisible();
    await expect(contentBody.locator("h2").first()).toHaveText("Introduction");
    await expect(contentBody.locator("ul")).toBeVisible();

    // Verify Author bio card
    const authorCard = page.locator("#author-bio-card");
    await expect(authorCard).toBeVisible();
    await expect(page.locator("#author-name-heading")).toHaveText("Jane Cooper");
    await expect(page.locator("#author-bio-text")).toContainText("Frontend Architect & Design Systems Lead");

    // Also verify /posts/[slug] route works as well
    await page.goto(`/posts/${publishedSlug}`);
    await expect(page.locator("#article-title")).toBeVisible();
  });

  test("TC-301.2: Visiting an article increments view counter", async ({ page }) => {
    await page.goto(`/blog/${publishedSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const viewCountEl = page.locator("#article-view-count");
    await expect(viewCountEl).toBeVisible();
    const initialText = await viewCountEl.innerText();
    const initialViews = parseInt(initialText.replace(/[^0-9]/g, ""), 10);

    // Reload or navigate to article again
    await page.goto(`/blog/${publishedSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const newText = await viewCountEl.innerText();
    const newViews = parseInt(newText.replace(/[^0-9]/g, ""), 10);
    expect(newViews).toBeGreaterThanOrEqual(initialViews + 1);
  });

  test("TC-301.3: HTML head contains OpenGraph tags and SEO metadata", async ({ page }) => {
    await page.goto(`/blog/${publishedSlug}`);

    // Verify <title>
    await expect(page).toHaveTitle(/Building a Scalable Blog Platform/i);

    // Verify OpenGraph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /Building a Scalable Blog Platform/i);

    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute("content", "article");

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute("content", /Next\.js 15, TypeScript/i);

    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute("content", "summary_large_image");
  });

  test("TC-301.4: Invalid slug returns 404 page", async ({ page }) => {
    const response = await page.goto("/blog/non-existent-article-slug-xyz123");
    expect(response?.status()).toBe(404);
    await expect(page.locator("body")).toContainText(/404|not found/i);
  });

  test("TC-301.5: Draft post is forbidden/404 for anonymous visitors, but accessible by Admin", async ({
    page,
    browser,
  }) => {
    // 1. Anonymous visitor gets 404
    const anonResponse = await page.goto(`/blog/${draftSlug}`);
    expect(anonResponse?.status()).toBe(404);

    // 2. Admin logs in
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", { timeout: 15000 });

    // 3. Admin visits draft post -> should succeed with HTTP 200
    const adminResponse = await page.goto(`/blog/${draftSlug}`);
    expect(adminResponse?.status()).toBe(200);
    await expect(page.locator("#article-title")).toContainText("Upcoming Architectural Preview");
  });

  test("TC-301.6: Social share buttons copy link and open share intents", async ({
    page,
    context,
  }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto(`/blog/${publishedSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const copyBtn = page.locator("#share-copy-link-btn");
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();

    // Verify toast confirmation
    const toast = page.locator("#share-copied-toast");
    await expect(toast).toBeVisible();

    // Verify Twitter & LinkedIn buttons exist
    await expect(page.locator("#share-twitter-btn")).toBeVisible();
    await expect(page.locator("#share-linkedin-btn")).toBeVisible();
  });
});
