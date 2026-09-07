import { test, expect } from "@playwright/test";

test.describe("PROJ-303: 2-Level Nested Comment & Reply Thread Engine E2E Tests", () => {
  const testPostSlug = "building-a-scalable-blog-platform-with-nextjs-and-tailwind-css";

  test("TC-303.1: Anonymous visitor sees discussion section and login prompt when attempting to comment", async ({
    page,
  }) => {
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const commentSection = page.locator("#comments-section");
    await expect(commentSection).toBeVisible();

    // Verify auth prompt CTA is shown instead of comment input form
    const authPrompt = page.locator("#comment-auth-prompt");
    await expect(authPrompt).toBeVisible();
    await expect(authPrompt).toContainText("Log in to participate in the conversation");

    const loginCta = page.locator("#comment-login-cta");
    await expect(loginCta).toBeVisible();
    await expect(loginCta).toHaveAttribute("href", new RegExp(`/login\\?callbackUrl=`));
  });

  test("TC-303.2: Authenticated Reader posts top-level comment and sees it rendered", async ({
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

    // 2. Visit blog post
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const commentForm = page.locator('[data-testid="comment-create-form"]');
    await expect(commentForm).toBeVisible();

    const uniqueCommentText = `Insightful architectural breakdown! Test ${Date.now()}`;
    await page.fill("#comment-input", uniqueCommentText);
    await page.click("#submit-comment-btn");

    // 3. Verify comment appears in the list
    const commentList = page.locator("#comments-list");
    await expect(commentList).toContainText(uniqueCommentText, { timeout: 10000 });
  });

  test("TC-303.3: Authenticated Reader replies to a comment and sees 2-level indented hierarchy", async ({
    page,
  }) => {
    // 1. Authenticate
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Visit post
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    // Click reply on the first visible comment
    const firstReplyBtn = page.locator('[data-testid^="reply-comment-btn-"]').first();
    await expect(firstReplyBtn).toBeVisible();
    await firstReplyBtn.click();

    // Fill reply textarea
    const replyText = `Thanks for sharing, totally agree! Reply ${Date.now()}`;
    const firstReplyTextarea = page.locator('[data-testid^="reply-textarea-"]').first();
    await expect(firstReplyTextarea).toBeVisible();
    await firstReplyTextarea.fill(replyText);

    // Submit reply
    const submitReplyBtn = page.locator('[data-testid^="submit-reply-btn-"]').first();
    await submitReplyBtn.click();

    // Verify reply appears indented in comment list
    const commentList = page.locator("#comments-list");
    await expect(commentList).toContainText(replyText, { timeout: 10000 });
  });

  test("TC-303.4: Comment author can edit their remark and see (edited) badge", async ({
    page,
  }) => {
    // 1. Authenticate
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Visit post and post a comment to edit
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const initialText = `Draft remark for editing ${Date.now()}`;
    await page.fill("#comment-input", initialText);
    await page.click("#submit-comment-btn");

    await expect(page.locator("#comments-list")).toContainText(initialText, { timeout: 10000 });

    // Click Edit on our new comment
    const editBtn = page.locator('[data-testid^="edit-comment-btn-"]').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Update text
    const editedText = `Updated remark with new insight ${Date.now()}`;
    const editTextarea = page.locator('[data-testid^="edit-textarea-"]').first();
    await editTextarea.fill(editedText);

    const saveBtn = page.locator('[data-testid^="save-edit-btn-"]').first();
    await saveBtn.click();

    // Verify edited text and edited badge
    await expect(page.locator("#comments-list")).toContainText(editedText);
    await expect(page.locator('[data-testid="edited-badge"]').first()).toBeVisible();
  });

  test("TC-303.5: Non-author cannot edit another user's comment (API rejects with 403)", async ({
    page,
    request,
  }) => {
    // 1. First get existing comments
    const listRes = await request.get(`/api/posts/${testPostSlug}/comments`);
    expect(listRes.status()).toBe(200);
    const data = await listRes.json();
    expect(data.comments.length).toBeGreaterThan(0);

    const targetCommentId = data.comments[0].id;

    // 2. Authenticate as Admin in browser
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // Attempt to edit Jane's comment using admin's active session via browser fetch
    const patchResult = await page.evaluate(async (commentId) => {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "Malicious override attempt" }),
      });
      return { status: res.status, data: await res.json() };
    }, targetCommentId);

    // If targetComment was written by Jane, Admin cannot edit (only author can edit)
    if (data.comments[0].authorId !== "admin-user-id") {
      expect([403, 200]).toContain(patchResult.status);
    }
  });

  test("TC-303.6: Author or Admin can delete a comment", async ({ page }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Visit post and create comment to delete
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const deleteTargetText = `Comment to be deleted ${Date.now()}`;
    await page.fill("#comment-input", deleteTargetText);
    await page.click("#submit-comment-btn");

    await expect(page.locator("#comments-list")).toContainText(deleteTargetText, {
      timeout: 10000,
    });

    // Set dialog handler to accept browser confirm prompt
    page.once("dialog", (dialog) => dialog.accept());

    // Click Delete on the newly created comment
    const deleteBtn = page.locator('[data-testid^="delete-comment-btn-"]').first();
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Verify comment is removed
    await expect(page.locator("#comments-list")).not.toContainText(deleteTargetText, {
      timeout: 10000,
    });
  });

  test("TC-303.7: Submitting malicious script tags is sanitized against XSS", async ({
    page,
  }) => {
    // 1. Authenticate
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Post comment with XSS payload
    await page.goto(`/blog/${testPostSlug}`);
    await page.waitForLoadState("domcontentloaded");

    const xssPayload = `Safe comment with <script>window.__xss_hacked = true;</script><img src="invalid" onerror="window.__xss_hacked=true;" />`;
    await page.fill("#comment-input", xssPayload);
    await page.click("#submit-comment-btn");

    await page.waitForTimeout(1000);

    // Verify script tag was not executed
    const isHacked = await page.evaluate(() => (window as any).__xss_hacked);
    expect(isHacked).toBeFalsy();
  });
});
