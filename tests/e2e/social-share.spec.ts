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

  /* =========================================================================
   * ISSUE #29: Multi-Platform Share Dialog & Interactive Share Tests
   * ========================================================================= */
  test("TC-29.1: Clicking 'Share' button opens the multi-platform share dialog with all social platforms", async ({
    page,
  }) => {
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const shareBtn = page.locator("#article-share-btn");
    await expect(shareBtn).toBeVisible();
    await shareBtn.click();

    // Verify modal is open
    const modal = page.locator("#social-share-modal");
    await expect(modal).toBeVisible();
    await expect(page.locator("#share-modal-title")).toHaveText("Share this article");

    // Verify all major platforms are rendered in modal
    await expect(modal.locator("#share-whatsapp-btn")).toBeVisible();
    await expect(modal.locator("#share-twitter-btn")).toBeVisible();
    await expect(modal.locator("#share-linkedin-btn")).toBeVisible();
    await expect(modal.locator("#share-facebook-btn")).toBeVisible();
    await expect(modal.locator("#share-reddit-btn")).toBeVisible();
    await expect(modal.locator("#share-telegram-btn")).toBeVisible();

    // Verify copy link bar and input inside modal
    await expect(modal.locator("#share-copy-url-input")).toBeVisible();
    await expect(modal.locator("#share-copy-link-btn")).toBeVisible();

    // Verify QR code toggle
    await expect(modal.locator("#share-qr-toggle-btn")).toBeVisible();
  });

  test("TC-29.2: Clicking WhatsApp, Facebook, Reddit, and Telegram launches the proper destination share URL", async ({
    page,
  }) => {
    let openedUrl = "";
    await page.exposeFunction("notifyPlatformOpen", (url: string) => {
      openedUrl = url;
    });
    await page.addInitScript(() => {
      window.open = (url) => {
        (window as any).notifyPlatformOpen(url);
        return null;
      };
    });

    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    // Open share modal
    await page.click("#article-share-btn");
    await expect(page.locator("#social-share-modal")).toBeVisible();

    // 1. WhatsApp
    await page.click("#share-whatsapp-btn");
    expect(openedUrl).toContain("api.whatsapp.com/send?text=");
    expect(openedUrl).toContain(encodeURIComponent(`/blog/${testPostSlug}`));

    // 2. Facebook
    await page.click("#share-facebook-btn");
    expect(openedUrl).toContain("facebook.com/sharer/sharer.php?u=");
    expect(openedUrl).toContain(encodeURIComponent(`/blog/${testPostSlug}`));

    // 3. Reddit
    await page.click("#share-reddit-btn");
    expect(openedUrl).toContain("reddit.com/submit?url=");
    expect(openedUrl).toContain(encodeURIComponent(`/blog/${testPostSlug}`));

    // 4. Telegram
    await page.click("#share-telegram-btn");
    expect(openedUrl).toContain("t.me/share/url?url=");
    expect(openedUrl).toContain(encodeURIComponent(`/blog/${testPostSlug}`));
  });

  test("TC-29.3: Copy Link inside modal copies URL to clipboard and triggers confirmation toast", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    await page.click("#article-share-btn");
    await expect(page.locator("#social-share-modal")).toBeVisible();

    // Click copy link inside modal
    const modalCopyBtn = page.locator("#social-share-modal #share-copy-link-btn");
    await modalCopyBtn.click();

    // Verify confirmation toast in modal
    const toast = page.locator("#social-share-modal #share-copied-toast");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Link copied to clipboard!");

    const clipboardText = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    expect(clipboardText).toContain(`/blog/${testPostSlug}`);
  });

  test("TC-29.4: QR code toggle displays and hides scannable mobile QR code", async ({
    page,
  }) => {
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    await page.click("#article-share-btn");
    await expect(page.locator("#social-share-modal")).toBeVisible();

    // Initially QR container is hidden
    await expect(page.locator("#share-qr-container")).not.toBeVisible();

    // Click toggle to show QR
    await page.click("#share-qr-toggle-btn");
    await expect(page.locator("#share-qr-container")).toBeVisible();
    await expect(page.locator("#share-qr-container img")).toBeVisible();

    // Click again to hide QR
    await page.click("#share-qr-toggle-btn");
    await expect(page.locator("#share-qr-container")).not.toBeVisible();
  });

  test("TC-29.5: Modal cleanly dismisses on Escape key or close button", async ({
    page,
  }) => {
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    // 1. Open and dismiss with Close Button
    await page.click("#article-share-btn");
    await expect(page.locator("#social-share-modal")).toBeVisible();
    await page.click("#close-share-modal-btn");
    await expect(page.locator("#social-share-modal")).not.toBeVisible();

    // 2. Open and dismiss with Escape Key
    await page.click("#article-share-btn");
    await expect(page.locator("#social-share-modal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#social-share-modal")).not.toBeVisible();
  });

  test("TC-29.6: Blog cards on homepage include quick share button triggering the modal", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const firstCardShareBtn = page.locator("button[id^='card-share-btn-']").first();
    await expect(firstCardShareBtn).toBeVisible();
    await firstCardShareBtn.click();

    // Modal opens for card post
    const modal = page.locator("#social-share-modal");
    await expect(modal).toBeVisible();
    await expect(page.locator("#share-modal-title")).toHaveText("Share this article");

    // Dismiss with Escape
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
  });
});
