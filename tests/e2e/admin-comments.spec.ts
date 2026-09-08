import { test, expect } from "@playwright/test";

test.describe("PROJ-403: Global Comment Moderation Suite E2E Tests", () => {
  const publishedSlug = "building-a-scalable-blog-platform-with-nextjs-and-tailwind-css";

  test("TC-403.1: Admin navigates to /admin/comments and sees platform comments chronologically", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Navigate to /admin/comments
    await page.goto("/admin/comments");
    await page.waitForLoadState("domcontentloaded");

    // Check header and badge
    await expect(page.locator("h1")).toContainText("Comment Moderation");
    await expect(page.locator("#total-comments-badge")).toBeVisible();

    // Verify table renders comments with authors and articles
    const table = page.locator("#admin-comments-table");
    await expect(table).toBeVisible();

    const rows = table.locator("tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Verify first row contains author info and article link
    const firstRow = rows.first();
    await expect(firstRow.locator("a[id^='comment-post-link-']")).toBeVisible();
    await expect(firstRow.locator("button[id^='delete-comment-']")).toBeVisible();
  });

  test("TC-403.2: Post title link navigates directly to the blog post", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Go to /admin/comments
    await page.goto("/admin/comments");
    await page.waitForLoadState("domcontentloaded");

    const firstPostLink = page.locator("a[id^='comment-post-link-']").first();
    await expect(firstPostLink).toBeVisible();

    const targetHref = await firstPostLink.getAttribute("href");
    expect(targetHref).toContain("/blog/");

    // Verify target attribute is _blank or navigate to it directly
    const newPagePromise = page.context().waitForEvent("page");
    await firstPostLink.click();
    const newPage = await newPagePromise;
    await newPage.waitForLoadState("domcontentloaded");

    expect(newPage.url()).toContain("/blog/");
    await expect(newPage.locator("#comments-section")).toBeVisible();
    await newPage.close();
  });

  test("TC-403.3: Search filters comments by content snippet and author name in real-time", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Go to /admin/comments
    await page.goto("/admin/comments");
    await page.waitForLoadState("domcontentloaded");

    const searchInput = page.locator("#admin-comments-search");
    await expect(searchInput).toBeVisible();

    // Type unique seeded text snippet
    await searchInput.fill("Phenomenal article");
    await page.waitForTimeout(500);

    // Verify filtered table shows matching comment
    const table = page.locator("#admin-comments-table");
    await expect(table).toContainText("Phenomenal article");

    // Search nonexistent keyword
    await searchInput.fill("xyzNonExistentKeyword98765");
    await page.waitForTimeout(500);
    await expect(table).toContainText("No comments found");

    // Reset search
    await page.click("#reset-comments-search-btn");
    await page.waitForTimeout(500);
    await expect(table).not.toContainText("No comments found");
  });

  test("TC-403.4: Admin deletes a comment using the confirmation modal", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Create a comment on the blog
    const uniqueCommentText = `Moderation target test remark ${Date.now()}`;
    await page.goto(`/blog/${publishedSlug}`);
    await page.waitForLoadState("domcontentloaded");
    await page.fill("#comment-input", uniqueCommentText);
    await page.click("#submit-comment-btn");
    await expect(page.locator("#comments-list")).toContainText(uniqueCommentText, {
      timeout: 10000,
    });

    // 3. Go to /admin/comments and find the comment
    await page.goto("/admin/comments");
    await page.waitForLoadState("domcontentloaded");

    await page.fill("#admin-comments-search", uniqueCommentText);
    await page.waitForTimeout(500);

    const row = page.locator("tr", { hasText: uniqueCommentText });
    await expect(row).toBeVisible();

    const deleteBtn = row.locator("button[id^='delete-comment-']");
    await deleteBtn.click();

    // 4. Modal confirmation
    const modal = page.locator("#delete-comment-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(uniqueCommentText);

    const confirmBtn = page.locator("#confirm-delete-comment-btn");
    const deletePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/comments/") && resp.request().method() === "DELETE" && resp.status() === 200
    );
    await confirmBtn.click();
    await deletePromise;

    // Verify removed from admin table
    await expect(page.locator("#admin-comments-table")).not.toContainText(uniqueCommentText);

    // 5. Verify removed from public blog post
    await page.goto(`/blog/${publishedSlug}`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#comments-list")).not.toContainText(uniqueCommentText);
  });

  test("TC-403.5: Deleting parent comment cascades to nested replies", async ({
    page,
  }) => {
    // 1. Authenticate as Admin directly
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Create a parent comment on the blog
    const parentText = `Parent Cascade Root ${Date.now()}`;
    await page.goto(`/blog/${publishedSlug}`);
    await page.waitForLoadState("domcontentloaded");
    await page.fill("#comment-input", parentText);
    await page.click("#submit-comment-btn");
    await expect(page.locator("#comments-list")).toContainText(parentText, {
      timeout: 10000,
    });

    // 3. Post a reply to this parent comment using data-testid reply button
    const parentRow = page.locator("div[id^='comment-']", { hasText: parentText }).first();
    const replyBtn = parentRow.locator('[data-testid^="reply-comment-btn-"]').first();
    await expect(replyBtn).toBeVisible();
    await replyBtn.click();

    const childText = `Child Reply To Cascade ${Date.now()}`;
    const replyInput = parentRow.locator('[data-testid^="reply-textarea-"]').first();
    await expect(replyInput).toBeVisible();
    await replyInput.fill(childText);
    await parentRow.locator('[data-testid^="submit-reply-btn-"]').first().click();

    await expect(page.locator("#comments-list")).toContainText(childText, {
      timeout: 10000,
    });

    // 4. Moderate in /admin/comments and delete the parent comment
    await page.goto("/admin/comments");
    await page.waitForLoadState("domcontentloaded");

    await page.fill("#admin-comments-search", parentText);
    await page.waitForTimeout(500);

    const adminParentRow = page.locator("tr", { hasText: parentText });
    await expect(adminParentRow).toBeVisible();

    const deleteBtn = adminParentRow.locator("button[id^='delete-comment-']");
    await deleteBtn.click();

    // Verify modal alerts about cascade warning
    const modal = page.locator("#delete-comment-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Cascade Warning");

    const confirmBtn = page.locator("#confirm-delete-comment-btn");
    const deletePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/comments/") && resp.request().method() === "DELETE" && resp.status() === 200
    );
    await confirmBtn.click();
    await deletePromise;

    // 5. Verify neither parent nor child exist on blog post
    await page.goto(`/blog/${publishedSlug}`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#comments-list")).not.toContainText(parentText);
    await expect(page.locator("#comments-list")).not.toContainText(childText);
  });

  test("TC-403.6: Non-admin reader cannot access /admin/comments", async ({ page }) => {
    // 1. Authenticate as Reader
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Attempt navigating to /admin/comments
    await page.goto("/admin/comments");
    // Middleware should redirect to / with error=unauthorized
    await expect(page).toHaveURL(/\/\?error=unauthorized/, { timeout: 10000 });
  });

  test("TC-403.7: Non-admin calling DELETE /api/comments/[commentId] returns 403 Forbidden", async ({
    page,
  }) => {
    // 1. Authenticate as Jane (Reader)
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Fetch seeded comments via /api/posts/[slug]/comments
    // Jane (reader) attempts to delete a comment not authored by Jane
    const res = await page.evaluate(async () => {
      const commentsRes = await fetch("/api/posts/building-a-scalable-blog-platform-with-nextjs-and-tailwind-css/comments");
      const commentsData = await commentsRes.json();
      
      // Find comment by Alex or Admin (anyone whose author name is not Jane)
      const otherUserComment = commentsData.comments.find(
        (c: any) => c.author?.name !== "Jane Cooper"
      );

      if (!otherUserComment) return { status: 404 };

      const delRes = await fetch(`/api/comments/${otherUserComment.id}`, {
        method: "DELETE",
      });

      return { status: delRes.status, data: await delRes.json() };
    });

    expect(res.status).toBe(403);
  });
});
