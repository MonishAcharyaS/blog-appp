import { test, expect } from "@playwright/test";

test.describe("Issue #35: Dedicated Independent Action Buttons for AI Cover Image and Article Content Generation", () => {
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

  test("TC-AI-SEPARATE-01: Dedicated Cover Image AI button specifically updates cover image without modifying editor content", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    // Pre-populate article content in editor
    const editor = page.locator("[data-testid='tiptap-content-editable']");
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await page.keyboard.type("Pre-existing manual article content that must remain untouched.");

    // Verify dedicated Cover Image AI button exists in Cover Image section
    const coverAiBtn = page.locator("#open-ai-image-modal-btn");
    await expect(coverAiBtn).toBeVisible();
    await expect(coverAiBtn).toContainText("Generate Cover with AI");

    // Click Cover Image AI button
    await coverAiBtn.click();

    // Verify AI Image Studio opens
    const imageModal = page.locator("#ai-image-modal");
    await expect(imageModal).toBeVisible();

    // Generate custom image
    await page.locator("#prompt-mode-custom-btn").click();
    await page.locator("#ai-image-prompt-input").fill("Minimalist cloud infrastructure diagrams");
    await page.locator("#ai-image-generate-btn").click();

    await expect(page.locator("#ai-image-preview-card")).toBeVisible({ timeout: 15000 });

    // Apply Cover Image
    await page.locator("#ai-image-apply-btn").click();
    await expect(imageModal).not.toBeVisible();

    // Verify cover image preview is populated
    await expect(page.locator("#cover-image-preview")).toBeVisible();

    // Crucial isolation check: editor content MUST NOT be affected or replaced
    await expect(editor).toContainText("Pre-existing manual article content that must remain untouched.");
  });

  test("TC-AI-SEPARATE-02: Dedicated Article Content AI button specifically generates body text into editor without modifying cover image", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    // Pre-populate cover image
    const existingCoverUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475";
    await page.fill("#post-cover-image-input", existingCoverUrl);
    await expect(page.locator("#cover-image-preview")).toBeVisible();

    // Verify dedicated Content AI button exists in Article Content section
    const contentAiBtn = page.locator("#open-ai-content-btn");
    await expect(contentAiBtn).toBeVisible();
    await expect(contentAiBtn).toContainText("Generate Content with AI");

    // Click Content AI button
    await contentAiBtn.click();

    // Verify AI Writing Modal opens
    const writingModal = page.locator("#ai-writing-modal");
    await expect(writingModal).toBeVisible();

    // Generate content draft
    await page.locator("#ai-prompt-input").fill("Scalable event-driven pipelines in Go");
    await page.locator("#ai-generate-btn").click();
    await expect(page.locator("#ai-draft-preview")).toBeVisible({ timeout: 15000 });

    // Apply draft to editor
    await page.locator("#ai-apply-draft-btn").click();
    await expect(writingModal).not.toBeVisible();

    // Verify editor received generated content
    const editor = page.locator("[data-testid='tiptap-content-editable']");
    await expect(editor).toContainText("Pipelines", { ignoreCase: true });

    // Crucial isolation check: cover image MUST NOT be cleared or overwritten
    await expect(page.locator("#cover-image-preview")).toHaveAttribute("src", existingCoverUrl);
  });

  test("TC-AI-SEPARATE-03: Combined independent workflow utilizing both separate AI buttons", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    // Step 1: Use Cover Image AI button
    await page.locator("#open-ai-image-modal-btn").click();
    await page.locator("#prompt-mode-custom-btn").click();
    await page.locator("#ai-image-prompt-input").fill("Cyberpunk glowing neon server rack");
    await page.locator("#ai-image-generate-btn").click();
    await expect(page.locator("#ai-image-preview-card")).toBeVisible({ timeout: 15000 });
    await page.locator("#ai-image-apply-btn").click();
    await expect(page.locator("#ai-image-modal")).not.toBeVisible();
    await expect(page.locator("#cover-image-preview")).toBeVisible();

    // Step 2: Independently use Content AI button
    await page.locator("#open-ai-content-btn").click();
    await page.locator("#ai-prompt-input").fill("High-availability Kubernetes ingress security");
    await page.locator("#ai-generate-btn").click();
    await expect(page.locator("#ai-draft-preview")).toBeVisible({ timeout: 15000 });
    await page.locator("#ai-apply-draft-btn").click();
    await expect(page.locator("#ai-writing-modal")).not.toBeVisible();

    // Step 3: Verify both separate assets coexist correctly
    await expect(page.locator("#cover-image-preview")).toBeVisible();
    const editor = page.locator("[data-testid='tiptap-content-editable']");
    await expect(editor).toContainText("Kubernetes", { ignoreCase: true });
  });

  test("TC-AI-SEPARATE-NEG-01: Cancelling one AI modal preserves state in other sections", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    const manualContent = "Crucial author manuscript paragraph.";
    const editor = page.locator("[data-testid='tiptap-content-editable']");
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await page.keyboard.type(manualContent);

    // Open and discard Cover AI modal
    await page.locator("#open-ai-image-modal-btn").click();
    await page.locator("#ai-image-discard-btn").click();
    await expect(page.locator("#ai-image-modal")).not.toBeVisible();
    await expect(editor).toContainText(manualContent);

    // Open and discard Content AI modal
    await page.locator("#open-ai-content-btn").click();
    await page.locator("#ai-discard-btn").click();
    await expect(page.locator("#ai-writing-modal")).not.toBeVisible();
    await expect(editor).toContainText(manualContent);
  });
});
