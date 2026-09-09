import { test, expect } from "@playwright/test";

test.describe("Custom Category Inline Creation in Add/Edit Article Forms (Issue #24)", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", { timeout: 15000 });
  });

  test("TC-24.1: Selecting '+ Add Other / New Category...' reveals the custom category input field", async ({
    page,
  }) => {
    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    const categorySelect = page.locator("#post-category-select");
    await expect(categorySelect).toBeVisible();

    const customInput = page.locator("#post-custom-category-input");
    await expect(customInput).not.toBeVisible();

    // Select OTHER
    await categorySelect.selectOption("OTHER");
    await expect(customInput).toBeVisible();
    await expect(customInput).toHaveAttribute("placeholder", "e.g., DevOps & Cloud Architecture");
  });

  test("TC-24.2: Submitting an article with a custom category creates both category and article successfully", async ({
    page,
  }) => {
    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    const uniqueTimestamp = Date.now().toString(36);
    const postTitle = `Mastering Cloud Infrastructure ${uniqueTimestamp}`;
    const customCategory = `DevOps ${uniqueTimestamp}`;

    // Fill title
    await page.fill("#post-title-input", postTitle);

    // Select OTHER category
    await page.selectOption("#post-category-select", "OTHER");
    const customInput = page.locator("#post-custom-category-input");
    await expect(customInput).toBeVisible();
    await customInput.fill(customCategory);

    // Submit form
    await page.click("#save-post-btn");

    // Verify redirection to /admin/posts
    await page.waitForURL(/\/admin\/posts/, { timeout: 15000 });
    expect(page.url()).toContain("/admin/posts");

    // Verify post is present in the admin table
    const tableBody = page.locator("tbody");
    await expect(tableBody).toContainText(postTitle, { timeout: 10000 });
    await expect(tableBody).toContainText(customCategory);
  });

  test("TC-24.3: Submitting with 'OTHER' selected but custom category empty shows inline validation error", async ({
    page,
  }) => {
    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    await page.fill("#post-title-input", "Article With Blank Custom Category");
    await page.selectOption("#post-category-select", "OTHER");

    // Clear or leave custom category empty
    const customInput = page.locator("#post-custom-category-input");
    await expect(customInput).toBeVisible();
    await customInput.fill("");

    // Submit form
    await page.click("#save-post-btn");

    // Expect validation error
    const errorBox = page.locator("#post-form-error");
    await expect(errorBox).toBeVisible({ timeout: 5000 });
    await expect(errorBox).toContainText("Please enter a name for the new custom category");
  });

  test("TC-24.4: Specifying an existing category name under 'OTHER' maps safely without duplicate key collision", async ({
    page,
  }) => {
    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    const postTitle = `AI Insights with Existing Category ${Date.now().toString(36)}`;
    await page.fill("#post-title-input", postTitle);

    // Select OTHER and type an existing category name
    await page.selectOption("#post-category-select", "OTHER");
    await page.fill("#post-custom-category-input", "AI & Machine Learning");

    // Submit form
    await page.click("#save-post-btn");

    await page.waitForURL(/\/admin\/posts/, { timeout: 15000 });
    const tableBody = page.locator("tbody");
    await expect(tableBody).toContainText(postTitle, { timeout: 10000 });
    await expect(tableBody).toContainText("AI & Machine Learning");
  });

  test("TC-24.5: Editing an existing article allows changing to a new custom category", async ({
    page,
  }) => {
    await page.goto("/admin/posts");
    await page.waitForLoadState("domcontentloaded");

    // Click Edit button on the first post
    const editLink = page.locator("tbody tr a[href*='/edit']").first();
    await expect(editLink).toBeVisible({ timeout: 10000 });
    await editLink.click();

    await page.waitForURL(/\/admin\/posts\/.*\/edit/, { timeout: 10000 });

    const newCustomCategory = `Quantum Computing ${Date.now().toString(36)}`;

    // Select OTHER category
    await page.selectOption("#post-category-select", "OTHER");
    const customInput = page.locator("#post-custom-category-input");
    await expect(customInput).toBeVisible();
    await customInput.fill(newCustomCategory);

    // Save changes
    await page.click("#save-post-btn");

    await page.waitForURL(/\/admin\/posts/, { timeout: 15000 });
    const tableBody = page.locator("tbody");
    await expect(tableBody).toContainText(newCustomCategory, { timeout: 10000 });
  });
});
