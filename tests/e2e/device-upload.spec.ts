import { test, expect } from "@playwright/test";

test.describe("Direct Device File Upload for Images (Cover & Editor) (Issue #21)", () => {
  // 1x1 Transparent PNG valid fixture (68 bytes)
  const validPngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );

  test.beforeEach(async ({ page }) => {
    // Authenticate as Admin user
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#email-input")).toBeVisible();
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });
  });

  test("TC-21.1: Direct Device File Upload in TipTap Editor inserts <img> with local URL and alt text", async ({
    page,
  }) => {
    await page.goto("/editor-demo");
    await expect(page.locator("[data-testid='tiptap-content-editable']")).toBeVisible();

    // Click Image toolbar button
    const imageBtn = page.locator("#toolbar-image-btn");
    await imageBtn.click();

    // Popover is displayed
    const popover = page.locator("#toolbar-image-popover");
    await expect(popover).toBeVisible();

    // Check that 'Upload from Device' tab is active by default
    const deviceTab = page.locator("#image-tab-device");
    await expect(deviceTab).toBeVisible();

    // Upload file via hidden file input
    const fileInput = page.locator("#editor-image-dropzone-file-input");
    await fileInput.setInputFiles({
      name: "diagram.png",
      mimeType: "image/png",
      buffer: validPngBuffer,
    });

    // Verify upload success indicator displays returned /uploads/... URL
    const uploadIndicator = page.locator("#editor-upload-success-indicator");
    await expect(uploadIndicator).toBeVisible({ timeout: 10000 });
    await expect(uploadIndicator).toContainText("/uploads/");

    // Fill alt description
    const altInput = page.locator("#toolbar-image-alt-input");
    await altInput.fill("Architecture System Topology");

    // Click Embed Image
    const embedBtn = page.locator("#toolbar-image-save-btn");
    await expect(embedBtn).toBeEnabled();
    await embedBtn.click();

    // Popover should close
    await expect(popover).not.toBeVisible();

    // Verify output HTML contains <img> with /uploads/ and alt text
    const rawOutput = page.locator("[data-testid='editor-raw-html-output']");
    await expect(rawOutput).toContainText("<img");
    await expect(rawOutput).toContainText('src="/uploads/');
    await expect(rawOutput).toContainText('alt="Architecture System Topology"');
  });

  test("TC-21.2: Direct Device Cover Image Upload in New Article page renders preview and creates post", async ({
    page,
  }) => {
    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    // Fill Title
    const titleInput = page.locator("#post-title-input");
    await titleInput.fill(`Playwright Device Upload Post - ${Date.now()}`);

    // Upload Cover Image via dropzone
    const coverFileInput = page.locator("#cover-image-file-input");
    await coverFileInput.setInputFiles({
      name: "cover-banner.png",
      mimeType: "image/png",
      buffer: validPngBuffer,
    });

    // Verify cover image preview thumbnail renders
    const coverPreview = page.locator("#cover-image-preview");
    await expect(coverPreview).toBeVisible({ timeout: 10000 });
    const previewSrc = await coverPreview.getAttribute("src");
    expect(previewSrc).toMatch(/^\/uploads\//);

    // Verify remove button is present and works
    const removeBtn = page.locator("#cover-image-remove-btn");
    await expect(removeBtn).toBeVisible();

    // Re-upload to keep cover
    await removeBtn.click();
    await expect(coverPreview).not.toBeVisible();

    await coverFileInput.setInputFiles({
      name: "cover-banner-2.png",
      mimeType: "image/png",
      buffer: validPngBuffer,
    });
    await expect(coverPreview).toBeVisible({ timeout: 10000 });

    // Select category if available
    const categorySelect = page.locator("#post-category-select");
    const options = await categorySelect.locator("option").all();
    if (options.length > 1) {
      await categorySelect.selectOption({ index: 1 });
    }

    // Submit article
    const submitBtn = page.locator("#save-post-btn");
    await submitBtn.click();

    // Should redirect to /admin/posts on success
    await page.waitForURL(/\/admin\/posts/, { timeout: 15000 });
    expect(page.url()).toContain("/admin/posts");
  });

  test("TC-21.3: Client-side validation blocks non-image files with clear error message", async ({
    page,
  }) => {
    await page.goto("/editor-demo");
    await page.locator("#toolbar-image-btn").click();

    // Try uploading a plain text / pdf file
    const fileInput = page.locator("#editor-image-dropzone-file-input");
    await fileInput.setInputFiles({
      name: "malicious.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 dummy file content"),
    });

    // Error banner should appear immediately
    const errorBanner = page.locator("#editor-image-dropzone-error");
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText("Only image files (JPEG, PNG, WebP, GIF) are allowed");

    // Embed button remains disabled
    const embedBtn = page.locator("#toolbar-image-save-btn");
    await expect(embedBtn).toBeDisabled();
  });

  test("TC-21.4: Client-side validation blocks files larger than 5MB", async ({
    page,
  }) => {
    await page.goto("/editor-demo");
    await page.locator("#toolbar-image-btn").click();

    // Create 5.5MB dummy buffer
    const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024);
    const fileInput = page.locator("#editor-image-dropzone-file-input");
    await fileInput.setInputFiles({
      name: "massive-image.png",
      mimeType: "image/png",
      buffer: largeBuffer,
    });

    // Error banner should appear
    const errorBanner = page.locator("#editor-image-dropzone-error");
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText("File size exceeds maximum limit of 5MB");

    // Embed button remains disabled
    const embedBtn = page.locator("#toolbar-image-save-btn");
    await expect(embedBtn).toBeDisabled();
  });

  test("TC-21.5: External Image Web URL tab works seamlessly as fallback", async ({
    page,
  }) => {
    await page.goto("/editor-demo");
    await page.locator("#toolbar-image-btn").click();

    // Switch to Web URL tab
    const urlTab = page.locator("#image-tab-url");
    await urlTab.click();

    const urlInput = page.locator("#toolbar-image-url-input");
    await urlInput.fill("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800");

    const altInput = page.locator("#toolbar-image-alt-input");
    await altInput.fill("Unsplash Fallback Image");

    const embedBtn = page.locator("#toolbar-image-save-btn");
    await expect(embedBtn).toBeEnabled();
    await embedBtn.click();

    const rawOutput = page.locator("[data-testid='editor-raw-html-output']");
    await expect(rawOutput).toContainText('src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800"');
    await expect(rawOutput).toContainText('alt="Unsplash Fallback Image"');
  });
});
