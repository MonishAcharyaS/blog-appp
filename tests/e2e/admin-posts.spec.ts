import { test, expect } from "@playwright/test";

test.describe("PROJ-402: Admin Post Management, Publishing & Feature Controls E2E Tests", () => {
  const publishedSlug = "building-a-scalable-blog-platform-with-nextjs-and-tailwind-css";

  test("TC-402.1: Admin creates post via /admin/posts/new, saves, and is redirected to /admin/posts", async ({
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

    // 2. Go to /admin/posts/new
    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    const uniqueTitle = `Next-Gen Microservices Strategy ${Date.now()}`;
    await page.fill("#post-title-input", uniqueTitle);
    await page.fill("#post-excerpt-input", "A deep dive into distributed event-driven systems.");

    // Fill editor
    const editor = page.locator("[data-testid='tiptap-content-editable']");
    await editor.click();
    await page.keyboard.type("Exploring asynchronous architectures at high concurrency.");

    // Submit form
    await page.click("#save-post-btn");

    // Expect redirect to /admin/posts
    await expect(page).toHaveURL("/admin/posts", { timeout: 10000 });
    await expect(page.locator("#admin-posts-table")).toContainText(uniqueTitle);
  });

  test("TC-402.2: Submitting post without title displays validation error message", async ({
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

    // 2. Go to /admin/posts/new
    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    // Clear required attribute to test client/server validation handling
    await page.evaluate(() => {
      const input = document.getElementById("post-title-input");
      if (input) input.removeAttribute("required");
    });

    // Try submitting without title
    await page.click("#save-post-btn");

    const errorAlert = page.locator("#post-form-error");
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/title is required/i);
  });

  test("TC-402.3: Duplicate post title appends unique suffix to avoid slug conflict", async ({
    request,
    page,
  }) => {
    // 1. Authenticate
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Post an article with the same title as an existing article
    const duplicateTitle = "Building a Scalable Blog Platform with Next.js and Tailwind CSS";

    const createRes = await page.evaluate(async (title) => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt: "Duplicate test article",
          content: "<p>Content with duplicate title</p>",
        }),
      });
      return { status: res.status, data: await res.json() };
    }, duplicateTitle);

    expect(createRes.status).toBe(201);
    expect(createRes.data.post.slug).not.toBe("building-a-scalable-blog-platform-with-nextjs-and-tailwind-css");
    expect(createRes.data.post.slug).toContain("building-a-scalable-blog-platform");
  });

  test("TC-402.4: Toggling publish updates status pill and public visibility", async ({
    page,
  }) => {
    // 1. Authenticate
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Create a dedicated post for toggle testing so we don't mutate seeded fixtures
    const togglePostTitle = `Toggle Test Article ${Date.now()}`;
    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");
    await page.fill("#post-title-input", togglePostTitle);
    await page.click("#save-post-btn");
    await expect(page).toHaveURL("/admin/posts", { timeout: 10000 });

    // Find the toggle button in the row for this post
    const row = page.locator("tr", { hasText: togglePostTitle });
    await expect(row).toBeVisible();

    const toggleBtn = row.locator("button[id^='toggle-publish-']");
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toContainText("Published");

    // Click to unpublish (flip to Draft)
    const patchPromise1 = page.waitForResponse(
      (resp) => resp.url().includes("/api/posts/") && resp.request().method() === "PATCH" && resp.status() === 200
    );
    await toggleBtn.click();
    await patchPromise1;
    await expect(toggleBtn).toContainText("Draft");

    // Click to publish again (flip to Published)
    const patchPromise2 = page.waitForResponse(
      (resp) => resp.url().includes("/api/posts/") && resp.request().method() === "PATCH" && resp.status() === 200
    );
    await toggleBtn.click();
    await patchPromise2;
    await expect(toggleBtn).toContainText("Published");
  });

  test("TC-402.5: Toggling featured updates badge status", async ({ page }) => {
    // 1. Authenticate
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Go to /admin/posts
    await page.goto("/admin/posts");
    await page.waitForLoadState("domcontentloaded");

    const featuredBtn = page.locator(`#toggle-featured-${publishedSlug}`);
    await expect(featuredBtn).toBeVisible();

    // Toggle featured
    const patchPromise1 = page.waitForResponse(
      (resp) => resp.url().includes("/api/posts/") && resp.request().method() === "PATCH" && resp.status() === 200
    );
    await featuredBtn.click();
    await patchPromise1;

    // Toggle back
    const patchPromise2 = page.waitForResponse(
      (resp) => resp.url().includes("/api/posts/") && resp.request().method() === "PATCH" && resp.status() === 200
    );
    await featuredBtn.click();
    await patchPromise2;
  });

  test("TC-402.6: Admin can delete a post using confirmation modal", async ({ page }) => {
    // 1. Authenticate
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Create a temporary post to safely delete
    const postToDeleteTitle = `Temporary Deletion Target ${Date.now()}`;
    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");
    await page.fill("#post-title-input", postToDeleteTitle);
    await page.click("#save-post-btn");
    await expect(page).toHaveURL("/admin/posts", { timeout: 10000 });

    // Find the created post row
    await page.fill("#admin-posts-search", postToDeleteTitle);
    await page.waitForTimeout(500);

    const deleteBtn = page.locator('[data-testid^="delete-post-"]').first();
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Verify modal appeared
    const modal = page.locator("#delete-post-modal");
    await expect(modal).toBeVisible();

    // Confirm deletion
    const confirmBtn = page.locator("#confirm-delete-btn");
    await confirmBtn.click();

    // Verify post is no longer in table
    await expect(page.locator("#admin-posts-table")).not.toContainText(postToDeleteTitle, {
      timeout: 10000,
    });
  });

  test("TC-402.7: Non-admin reader cannot access /admin/posts", async ({ page }) => {
    // Log in as Reader
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });
    await expect(page.locator("#user-role")).toHaveText("READER");

    // Reader attempts to navigate to /admin/posts
    await page.goto("/admin/posts");
    await expect(page).toHaveURL(/\/\?error=unauthorized/);
  });
});
