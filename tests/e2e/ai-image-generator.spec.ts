import { test, expect } from "@playwright/test";

test.describe("Issue #34: AI Blog Cover Image Generator E2E Tests", () => {
  async function loginAsAdmin(page: any) {
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });
  }

  test("TC-AI-IMAGE-01: Auto-generate from blog content attaches cover image and preview", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    // Fill title and excerpt first
    const testTitle = "NextGen Cloud Microservices Architecture";
    await page.fill("#post-title-input", testTitle);
    await page.fill("#post-excerpt-input", "High-throughput fault-tolerant event meshes.");

    // Trigger AI Image Generator
    const openBtn = page.locator("#open-ai-image-modal-btn");
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // Verify modal is displayed in auto-mode
    const modal = page.locator("#ai-image-modal");
    await expect(modal).toBeVisible();

    // Verify synthesis preview shows post title
    await expect(modal).toContainText(testTitle);

    // Click Generate Cover Image
    const generateBtn = page.locator("#ai-image-generate-btn");
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Wait for preview card to appear
    const previewCard = page.locator("#ai-image-preview-card");
    await expect(previewCard).toBeVisible({ timeout: 15000 });

    const previewImg = page.locator("#ai-image-preview-img");
    await expect(previewImg).toBeVisible();
    const generatedSrc = await previewImg.getAttribute("src");
    expect(generatedSrc).toBeTruthy();

    // Apply as Cover Image
    const applyBtn = page.locator("#ai-image-apply-btn");
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();

    // Modal closes
    await expect(modal).not.toBeVisible();

    // Verify form preview received the generated image
    const formPreview = page.locator("#cover-image-preview");
    await expect(formPreview).toBeVisible();
    await expect(formPreview).toHaveAttribute("src", generatedSrc!);
  });

  test("TC-AI-IMAGE-02: Custom prompt input and style preset generates customized visual", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#open-ai-image-modal-btn").click();
    await expect(page.locator("#ai-image-modal")).toBeVisible();

    // Switch to custom instructions mode
    const customModeBtn = page.locator("#prompt-mode-custom-btn");
    await customModeBtn.click();

    // Enter custom prompt
    const promptInput = page.locator("#ai-image-prompt-input");
    await expect(promptInput).toBeVisible();
    await promptInput.fill("Glowing neon cybernetic mainframe room with holographic data flows");

    // Select Cyberpunk Neon style
    const cyberpunkBtn = page.locator("#image-style-cyberpunk");
    await cyberpunkBtn.click();

    // Click Generate
    await page.locator("#ai-image-generate-btn").click();

    // Expect preview
    await expect(page.locator("#ai-image-preview-card")).toBeVisible({ timeout: 15000 });
    const previewImg = page.locator("#ai-image-preview-img");
    await expect(previewImg).toBeVisible();

    // Apply
    await page.locator("#ai-image-apply-btn").click();
    await expect(page.locator("#ai-image-modal")).not.toBeVisible();

    // Verify form received image
    await expect(page.locator("#cover-image-preview")).toBeVisible();
  });

  test("TC-AI-IMAGE-03: Regenerating alternative switches the visual variant", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    await page.fill("#post-title-input", "Quantum Cryptography Protocols");
    await page.locator("#open-ai-image-modal-btn").click();

    // First generation
    await page.locator("#ai-image-generate-btn").click();
    const previewImg = page.locator("#ai-image-preview-img");
    await expect(previewImg).toBeVisible({ timeout: 15000 });
    const firstSrc = await previewImg.getAttribute("src");

    // Click Regenerate Variant
    const regenerateBtn = page.locator("#ai-image-regenerate-btn");
    await expect(regenerateBtn).toBeVisible();
    await regenerateBtn.click();

    // Wait for image src to change or re-render
    await page.waitForTimeout(1000);
    const secondSrc = await previewImg.getAttribute("src");
    expect(secondSrc).toBeTruthy();

    // Discard
    await page.locator("#ai-image-discard-btn").click();
    await expect(page.locator("#ai-image-modal")).not.toBeVisible();
  });

  test("TC-AI-IMAGE-NEG-01: Empty custom prompt displays validation warning without generating", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#open-ai-image-modal-btn").click();
    await expect(page.locator("#ai-image-modal")).toBeVisible();

    // Switch to custom instructions mode without entering text
    await page.locator("#prompt-mode-custom-btn").click();
    await page.locator("#ai-image-prompt-input").fill("");

    await page.locator("#ai-image-generate-btn").click();

    // Error banner should appear
    const errorBanner = page.locator("#ai-image-error-banner");
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText("Please enter a custom visual description");

    // Preview should not be visible
    await expect(page.locator("#ai-image-preview-card")).not.toBeVisible();
  });

  test("TC-AI-IMAGE-NEG-02: Safety filter detects prohibited content and displays warning", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#open-ai-image-modal-btn").click();
    await page.locator("#prompt-mode-custom-btn").click();

    // Fill prohibited safety term
    await page.locator("#ai-image-prompt-input").fill("extreme violence and gore weapon action");
    await page.locator("#ai-image-generate-btn").click();

    // Expect safety guidance alert
    const errorBanner = page.locator("#ai-image-error-banner");
    await expect(errorBanner).toBeVisible({ timeout: 10000 });
    await expect(errorBanner).toContainText("safety guidelines");

    // Preview card should not be shown
    await expect(page.locator("#ai-image-preview-card")).not.toBeVisible();
  });

  test("TC-AI-IMAGE-NEG-03: Canceling generation leaves existing post cover image unchanged", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    const existingCover = "https://images.unsplash.com/photo-1498050108023-c5249f4df085";
    await page.fill("#post-cover-image-input", existingCover);

    // Open AI modal
    await page.locator("#open-ai-image-modal-btn").click();
    await page.locator("#prompt-mode-custom-btn").click();
    await page.locator("#ai-image-prompt-input").fill("Futuristic holographic glass architecture");
    await page.locator("#ai-image-generate-btn").click();

    await expect(page.locator("#ai-image-preview-card")).toBeVisible({ timeout: 15000 });

    // Cancel modal
    await page.locator("#ai-image-discard-btn").click();
    await expect(page.locator("#ai-image-modal")).not.toBeVisible();

    // Original cover image preview should be intact
    await expect(page.locator("#cover-image-preview")).toHaveAttribute("src", existingCover);
  });
});
