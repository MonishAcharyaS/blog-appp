import { test, expect } from "@playwright/test";

test.describe("Issue #32: Post Presentation & Card Layout Redesign", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    // Wait for the discovery grid and cards
    await expect(page.locator("#discovery-posts-grid")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("[data-testid='blog-card']").first()).toBeVisible({ timeout: 15000 });
  });

  test("TC-POST-LAYOUT-01: Post card renders author header, heading, subheading, and brief preceding the media image", async ({
    page,
  }) => {
    // Wait for the feed to be stable
    await page.waitForTimeout(500);
    const firstCard = page.locator("[data-testid='blog-card']").first();
    await expect(firstCard).toBeVisible();

    // Verify presence of structural elements
    const authorHeader = firstCard.locator("[data-testid='card-author-header']");
    const cardTitle = firstCard.locator("[data-testid='card-title']");
    const cardBrief = firstCard.locator("[data-testid='card-brief']");
    const mediaWrapper = firstCard.locator("[data-testid='card-media-wrapper']");

    await expect(authorHeader).toBeVisible();
    await expect(cardTitle).toBeVisible();
    await expect(cardBrief).toBeVisible();

    // Verify visual order within this specific card: authorHeader < title < brief
    const positions = await firstCard.evaluate((card) => {
      const header = card.querySelector("[data-testid='card-author-header']");
      const title = card.querySelector("[data-testid='card-title']");
      const brief = card.querySelector("[data-testid='card-brief']");
      const media = card.querySelector("[data-testid='card-media-wrapper']");

      return {
        headerY: header ? header.getBoundingClientRect().top : null,
        titleY: title ? title.getBoundingClientRect().top : null,
        briefY: brief ? brief.getBoundingClientRect().top : null,
        mediaY: media ? media.getBoundingClientRect().top : null,
      };
    });

    expect(positions.headerY).not.toBeNull();
    expect(positions.titleY).not.toBeNull();
    expect(positions.briefY).not.toBeNull();

    if (positions.headerY && positions.titleY && positions.briefY) {
      expect(positions.headerY).toBeLessThan(positions.titleY);
      expect(positions.titleY).toBeLessThan(positions.briefY);
    }

    // If card has media, verify brief appears above media within this card
    if (positions.mediaY && positions.briefY) {
      expect(positions.briefY).toBeLessThan(positions.mediaY);
    }
  });

  test("TC-POST-LAYOUT-02: Media image is situated directly beneath content text and renders responsive frame", async ({
    page,
  }) => {
    await page.waitForTimeout(500);
    // Locate cards that contain media
    const cardWithMedia = page.locator("[data-testid='blog-card']:has([data-testid='card-media-wrapper'])").first();
    await expect(cardWithMedia).toBeVisible();

    const coverImg = cardWithMedia.locator("[data-testid='card-cover-image']");
    await expect(coverImg).toBeVisible();
    await expect(coverImg).toHaveAttribute("src", /.+/);

    const checkResult = await cardWithMedia.evaluate((card) => {
      const brief = card.querySelector("[data-testid='card-brief']");
      const media = card.querySelector("[data-testid='card-media-wrapper']");
      if (!brief || !media) return null;
      const briefRect = brief.getBoundingClientRect();
      const mediaRect = media.getBoundingClientRect();
      return {
        briefBottom: briefRect.bottom,
        mediaTop: mediaRect.top,
        mediaWidth: mediaRect.width,
      };
    });

    expect(checkResult).not.toBeNull();
    if (checkResult) {
      expect(checkResult.mediaTop).toBeGreaterThanOrEqual(checkResult.briefBottom - 5);
      expect(checkResult.mediaWidth).toBeGreaterThan(200);
    }
  });

  test("TC-POST-LAYOUT-03: Related tags and engagement action bar appear beneath the media image", async ({
    page,
  }) => {
    await page.waitForTimeout(500);
    const cardWithMedia = page.locator("[data-testid='blog-card']:has([data-testid='card-media-wrapper'])").first();
    await expect(cardWithMedia).toBeVisible();

    const media = cardWithMedia.locator("[data-testid='card-media-wrapper']");
    const engagementBar = cardWithMedia.locator("[data-testid='card-engagement-bar']");

    await expect(media).toBeVisible();
    await expect(engagementBar).toBeVisible();

    // Verify relative positioning using evaluate
    const positions = await cardWithMedia.evaluate((card) => {
      const mediaEl = card.querySelector("[data-testid='card-media-wrapper']");
      const engagementEl = card.querySelector("[data-testid='card-engagement-bar']");
      const tagsEl = card.querySelector("[data-testid='card-tags-list']");

      return {
        mediaTop: mediaEl ? mediaEl.getBoundingClientRect().top : null,
        engagementTop: engagementEl ? engagementEl.getBoundingClientRect().top : null,
        tagsTop: tagsEl ? tagsEl.getBoundingClientRect().top : null,
      };
    });

    expect(positions.mediaTop).not.toBeNull();
    expect(positions.engagementTop).not.toBeNull();

    if (positions.mediaTop && positions.engagementTop) {
      // Engagement bar must be anchored below media
      expect(positions.engagementTop).toBeGreaterThan(positions.mediaTop);
    }

    if (positions.tagsTop && positions.mediaTop && positions.engagementTop) {
      expect(positions.tagsTop).toBeGreaterThan(positions.mediaTop);
      expect(positions.tagsTop).toBeLessThan(positions.engagementTop);
    }

    // Verify engagement bar contains upvote button, comments indicator, and share button
    const upvoteBtn = engagementBar.locator("[data-testid='card-upvote-btn']");
    const commentsCount = engagementBar.locator("[data-testid='card-comments-count']");
    const shareBtn = engagementBar.locator("button[id^='card-share-btn-']");

    await expect(upvoteBtn).toBeVisible();
    await expect(commentsCount).toBeVisible();
    await expect(shareBtn).toBeVisible();
  });

  test("TC-POST-LAYOUT-NEG-01: Posts without a cover image collapse image container cleanly without blank voids", async ({
    page,
  }) => {
    await page.waitForTimeout(500);
    const allCards = page.locator("[data-testid='blog-card']");
    await expect(allCards.first()).toBeVisible({ timeout: 10000 });
    const cardCount = await allCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Verify that every card either has a visible image or has NO media wrapper (collapses completely)
    for (let i = 0; i < Math.min(cardCount, 6); i++) {
      const card = allCards.nth(i);
      const mediaWrapper = card.locator("[data-testid='card-media-wrapper']");
      if ((await mediaWrapper.count()) === 0) {
        // Collapsed gracefully: no media wrapper in DOM
        const brokenImg = card.locator("img[src='']");
        await expect(brokenImg).toHaveCount(0);
      } else {
        // Image present: must have non-empty src
        const img = card.locator("[data-testid='card-cover-image']");
        await expect(img).toBeVisible();
        const src = await img.getAttribute("src");
        expect(src).toBeTruthy();
      }
    }
  });

  test("TC-POST-LAYOUT-NEG-02: Long title and brief wrap cleanly without breaking container boundaries or causing horizontal scroll", async ({
    page,
  }) => {
    await page.waitForTimeout(500);
    // Check viewport scroll width vs client width to ensure no horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Cards should have line clamping or clean wrapping
    const titles = page.locator("[data-testid='card-title']");
    const count = await titles.count();
    for (let i = 0; i < Math.min(count, 4); i++) {
      const title = titles.nth(i);
      await expect(title).toBeVisible();
      const box = await title.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBeGreaterThan(150);
      }
    }
  });

  test("TC-POST-LAYOUT-04: Card interactions (Upvote, Share modal) work smoothly from the engagement bar", async ({
    page,
  }) => {
    await page.waitForTimeout(500);
    const firstCard = page.locator("[data-testid='blog-card']").first();
    await expect(firstCard).toBeVisible();

    const shareBtn = firstCard.locator("button[id^='card-share-btn-']");
    await expect(shareBtn).toBeVisible();

    // Clicking share opens share modal (#social-share-modal)
    await shareBtn.click();
    const shareModal = page.locator("#social-share-modal");
    await expect(shareModal).toBeVisible({ timeout: 5000 });

    // Verify social destinations are rendered
    await expect(shareModal.locator("#share-whatsapp-btn")).toBeVisible();
    await expect(shareModal.locator("#share-twitter-btn")).toBeVisible();

    // Close share modal
    const closeBtn = page.locator("#close-share-modal-btn");
    await closeBtn.click();
    await expect(shareModal).not.toBeVisible();

    // Verify upvote button is interactable
    const upvoteBtn = firstCard.locator("[data-testid='card-upvote-btn']");
    await expect(upvoteBtn).toBeVisible();
  });
});
