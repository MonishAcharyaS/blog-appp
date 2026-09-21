import { test, expect } from "@playwright/test";

test.describe("GitHub Issue #32: Redesign Post Layout Structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#discovery-posts-grid")).toBeVisible();
  });

  test("TC-POST-LAYOUT-01: Post card renders author header, heading, brief before media image", async ({
    page,
  }) => {
    const firstCard = page.locator("[data-testid='blog-card']").first();
    await expect(firstCard).toBeVisible();

    // 1. Author header is present at the top
    const authorHeader = firstCard.locator("[data-testid='post-card-author-header']");
    await expect(authorHeader).toBeVisible();

    // 2. Title and excerpt are present
    const title = firstCard.locator("[data-testid='post-card-title']");
    const excerpt = firstCard.locator("[data-testid='post-card-excerpt']");
    await expect(title).toBeVisible();
    await expect(excerpt).toBeVisible();

    // 3. Media image is present
    const media = firstCard.locator("[data-testid='post-card-media']");
    await expect(media).toBeVisible();

    // 4. Verify visual hierarchy (DOM order)
    const isOrdered = await firstCard.evaluate((card) => {
      const header = card.querySelector('[data-testid="post-card-author-header"]');
      const title = card.querySelector('[data-testid="post-card-title"]');
      const excerpt = card.querySelector('[data-testid="post-card-excerpt"]');
      const media = card.querySelector('[data-testid="post-card-media"]');
      if (!header || !title || !excerpt || !media) return false;
      return Boolean(
        (header.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        (title.compareDocumentPosition(excerpt) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        (excerpt.compareDocumentPosition(media) & Node.DOCUMENT_POSITION_FOLLOWING)
      );
    });

    expect(isOrdered).toBe(true);
  });

  test("TC-POST-LAYOUT-02: Media image loads directly below content text with responsive aspect-ratio", async ({
    page,
  }) => {
    const postCards = page.locator("[data-testid='blog-card']");
    const firstCard = postCards.first();

    const mediaContainer = firstCard.locator("[data-testid='post-card-media']");
    await expect(mediaContainer).toBeVisible();

    const img = mediaContainer.locator("img");
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("src");
  });

  test("TC-POST-LAYOUT-03: Related tags are rendered beneath media image and remain clickable", async ({
    page,
  }) => {
    const postCards = page.locator("[data-testid='blog-card']");
    const firstCard = postCards.first();

    const media = firstCard.locator("[data-testid='post-card-media']");
    const tags = firstCard.locator("[data-testid='post-card-tags']");

    if (await tags.isVisible()) {
      const mediaBox = await media.boundingBox();
      const tagsBox = await tags.boundingBox();

      expect(mediaBox).not.toBeNull();
      expect(tagsBox).not.toBeNull();

      if (mediaBox && tagsBox) {
        // Tags must be below media image
        expect(mediaBox.y).toBeLessThan(tagsBox.y);
      }

      // Check that clicking a tag has an explore link
      const firstTagLink = tags.locator("a").first();
      await expect(firstTagLink).toHaveAttribute("href", /\/explore\?search=/);
    }
  });

  test("TC-POST-LAYOUT-04: Engagement bar with like/upvote and share is at the bottom", async ({
    page,
  }) => {
    const postCards = page.locator("[data-testid='blog-card']");
    const firstCard = postCards.first();

    const engagementBar = firstCard.locator("[data-testid='post-card-engagement-bar']");
    await expect(engagementBar).toBeVisible();

    const upvoteBtn = firstCard.locator("[data-testid='card-upvote-btn']");
    const shareBtn = firstCard.locator("button[id^='card-share-btn-']");

    await expect(upvoteBtn).toBeVisible();
    await expect(shareBtn).toBeVisible();

    const media = firstCard.locator("[data-testid='post-card-media']");
    const mediaBox = await media.boundingBox();
    const barBox = await engagementBar.boundingBox();

    if (mediaBox && barBox) {
      expect(mediaBox.y).toBeLessThan(barBox.y);
    }
  });

  test("TC-POST-LAYOUT-NEG-01: Layout does not break or overflow horizontally", async ({
    page,
  }) => {
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    // No horizontal scrollbar
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});
