import { test, expect } from "@playwright/test";

test.describe("PROJ-304: Social Sharing & Dynamic Reading Time Indicator E2E Tests", () => {
  const testPostSlug = "building-a-scalable-blog-platform-with-nextjs-and-tailwind-css";

  test("TC-304.1: Clicking 'Copy Link' button writes article URL and renders feedback toast", async ({
    page,
    context,
  }) => {
    // Grant clipboard-read and clipboard-write permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const copyBtn = page.locator("#share-copy-link-btn");
    await expect(copyBtn).toBeVisible();

    await copyBtn.click();

    // Verify toast is visible
    const toast = page.locator('[data-testid="share-copied-toast"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Link copied!");

    // Button text updates to Copied!
    await expect(copyBtn).toContainText("Copied!");

    // Read clipboard content
    const clipboardText = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    expect(clipboardText).toContain(`/blog/${testPostSlug}`);
  });

  test("TC-304.2: Copy link toast notification auto-dismisses after 2.5 seconds", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const copyBtn = page.locator("#share-copy-link-btn");
    await copyBtn.click();

    const toast = page.locator('[data-testid="share-copied-toast"]');
    await expect(toast).toBeVisible();

    // Wait 3 seconds to verify auto-dismissal
    await page.waitForTimeout(3000);
    await expect(toast).not.toBeVisible();
    await expect(copyBtn).toContainText("Copy Link");
  });

  test("TC-304.3: Fallback copy mechanism succeeds when clipboard API is unavailable", async ({
    page,
  }) => {
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    // Mock navigator.clipboard as undefined to exercise document.execCommand fallback
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        configurable: true,
      });
    });

    const copyBtn = page.locator("#share-copy-link-btn");
    await copyBtn.click();

    // Toast still appears
    const toast = page.locator('[data-testid="share-copied-toast"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Link copied!");
  });

  test("TC-304.4: Share on Twitter/X button opens tweet intent with article URL and title", async ({
    page,
  }) => {
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    // Intercept window.open
    let openedUrl = "";
    await page.exposeFunction("notifyWindowOpen", (url: string) => {
      openedUrl = url;
    });
    await page.addInitScript(() => {
      window.open = (url) => {
        (window as any).notifyWindowOpen(url);
        return null;
      };
    });

    // Re-trigger with mocked window.open
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const twitterBtn = page.locator("#share-twitter-btn");
    await expect(twitterBtn).toBeVisible();
    await twitterBtn.click();

    expect(openedUrl).toContain("twitter.com/intent/tweet");
    expect(openedUrl).toContain(encodeURIComponent(`/blog/${testPostSlug}`));
  });

  test("TC-304.5: Share on LinkedIn button opens LinkedIn share offsite popup with URL", async ({
    page,
  }) => {
    let openedUrl = "";
    await page.exposeFunction("notifyLinkedInOpen", (url: string) => {
      openedUrl = url;
    });
    await page.addInitScript(() => {
      window.open = (url) => {
        (window as any).notifyLinkedInOpen(url);
        return null;
      };
    });

    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const linkedInBtn = page.locator("#share-linkedin-btn");
    await expect(linkedInBtn).toBeVisible();
    await linkedInBtn.click();

    expect(openedUrl).toContain("linkedin.com/sharing/share-offsite");
    expect(openedUrl).toContain(encodeURIComponent(`/blog/${testPostSlug}`));
  });

  test("TC-304.6: Dynamic reading time is calculated and rendered accurately", async ({
    page,
  }) => {
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const readingTimeEl = page.locator("#article-reading-time");
    await expect(readingTimeEl).toBeVisible();
    const readingTimeText = await readingTimeEl.innerText();

    // Must match format "X min read" where X >= 1
    expect(readingTimeText).toMatch(/^\d+\s+min\s+read$/i);
    const minutes = parseInt(readingTimeText.replace(/[^0-9]/g, ""), 10);
    expect(minutes).toBeGreaterThanOrEqual(1);
  });
});
