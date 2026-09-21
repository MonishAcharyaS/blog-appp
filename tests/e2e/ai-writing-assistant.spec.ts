import { test, expect } from "@playwright/test";

test.describe("Issue #33: AI Writing Assistant for Blog Generation and Content Improvement", () => {
  // Helper to authenticate as admin before navigating to admin editor
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

  test("TC-AI-WRITE-01: Author enters topic prompt, generates draft, and applies it to editor", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    // Open AI writing modal
    const openBtn = page.locator("#open-ai-generator-btn");
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // Verify modal appears
    const modal = page.locator("#ai-writing-modal");
    await expect(modal).toBeVisible();

    // Prompt input
    const promptInput = page.locator("#ai-prompt-input");
    await expect(promptInput).toBeVisible();
    await promptInput.fill("Build modern reactive state machines in TypeScript");

    // Select conversational tone
    await page.locator("#tone-option-conversational").click();

    // Click generate draft
    const generateBtn = page.locator("#ai-generate-btn");
    await generateBtn.click();

    // Verify draft preview card appears
    const previewCard = page.locator("#ai-draft-preview");
    await expect(previewCard).toBeVisible({ timeout: 10000 });

    const previewTitle = page.locator("#ai-preview-title");
    await expect(previewTitle).toContainText("Build Modern Reactive State Machines In Typescript", {
      ignoreCase: true,
    });

    const previewExcerpt = page.locator("#ai-preview-excerpt");
    await expect(previewExcerpt).toBeVisible();

    // Click Apply to Editor
    const applyBtn = page.locator("#ai-apply-draft-btn");
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();

    // Verify modal closes
    await expect(modal).not.toBeVisible();

    // Verify editor inputs are populated with generated draft
    const titleInput = page.locator("#post-title-input");
    await expect(titleInput).not.toHaveValue("");

    const excerptInput = page.locator("#post-excerpt-input");
    await expect(excerptInput).not.toHaveValue("");

    const editorContent = page.locator("[data-testid='tiptap-content-editable']");
    await expect(editorContent).toContainText("State Machines", { ignoreCase: true });
  });

  test("TC-AI-WRITE-02: Author improves existing content and applies polished text to editor", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    // Enter draft content into editor
    const editor = page.locator("[data-testid='tiptap-content-editable']");
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await page.keyboard.type("their is good ways to write scalable serverless functions.");

    // Trigger AI improvement via the editor toolbar quick button
    const toolbarPolishBtn = page.locator("#toolbar-ai-improve-btn");
    await expect(toolbarPolishBtn).toBeVisible();
    await toolbarPolishBtn.click();

    // Modal opens in improve mode
    const modal = page.locator("#ai-writing-modal");
    await expect(modal).toBeVisible();
    await expect(page.locator("#ai-tab-improve")).toHaveClass(/border-\[#5B48EE\]/);

    // Select "Make Engaging" improvement option
    await page.locator("#improve-option-engaging").click();

    // Click improve button
    const improveBtn = page.locator("#ai-improve-btn");
    await improveBtn.click();

    // Verify improved content preview
    const previewArea = page.locator("#ai-improved-content");
    await expect(previewArea).toBeVisible({ timeout: 10000 });
    await expect(previewArea).toContainText("Discover the Impact");

    // Click Apply Changes
    const applyBtn = page.locator("#ai-apply-improvement-btn");
    await applyBtn.click();

    // Modal closes
    await expect(modal).not.toBeVisible();

    // Check editor contains updated text
    await expect(editor).toContainText("Discover the Impact");
  });

  test("TC-AI-WRITE-03: Switching tone options influences the generated style", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#open-ai-generator-btn").click();
    await expect(page.locator("#ai-writing-modal")).toBeVisible();

    const promptInput = page.locator("#ai-prompt-input");
    await promptInput.fill("Distributed caching with Redis clusters");

    // Select Technical tone
    await page.locator("#tone-option-technical").click();
    await page.locator("#ai-generate-btn").click();

    // Technical tone includes rigorous architectural vocabulary
    const previewContent = page.locator("#ai-preview-content");
    await expect(previewContent).toBeVisible({ timeout: 10000 });
    await expect(previewContent).toContainText("bottlenecks", { ignoreCase: true });
  });

  test("TC-AI-WRITE-NEG-01: Empty prompt displays validation error without calling generator", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#open-ai-generator-btn").click();
    await expect(page.locator("#ai-writing-modal")).toBeVisible();

    // Ensure prompt is empty and click generate
    const promptInput = page.locator("#ai-prompt-input");
    await promptInput.fill("");

    await page.locator("#ai-generate-btn").click();

    // Expect validation message
    const errorBanner = page.locator("#ai-validation-error");
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText("Please enter a topic or context description");

    // Draft preview should not be rendered
    await expect(page.locator("#ai-draft-preview")).not.toBeVisible();
  });

  test("TC-AI-WRITE-NEG-02: Author clicks Discard, leaving existing editor content completely intact", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    const originalTitle = "My Original Precious Article";
    await page.fill("#post-title-input", originalTitle);

    const editor = page.locator("[data-testid='tiptap-content-editable']");
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await page.keyboard.type("Original uncorrupted paragraphs.");

    // Open AI modal and generate draft
    await page.locator("#open-ai-generator-btn").click();
    await page.locator("#ai-prompt-input").fill("Write something completely different");
    await page.locator("#ai-generate-btn").click();

    await expect(page.locator("#ai-draft-preview")).toBeVisible({ timeout: 10000 });

    // Click Discard
    const discardBtn = page.locator("#ai-discard-btn");
    await discardBtn.click();

    // Verify modal is closed
    await expect(page.locator("#ai-writing-modal")).not.toBeVisible();

    // Verify original title and content remain completely intact
    await expect(page.locator("#post-title-input")).toHaveValue(originalTitle);
    await expect(editor).toContainText("Original uncorrupted paragraphs.");
    await expect(editor).not.toContainText("completely different");
  });

  test("TC-AI-WRITE-NEG-03: Attempting to improve empty editor content triggers clear validation warning", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/admin/posts/new");
    await page.waitForLoadState("domcontentloaded");

    // Open AI modal and switch to Improve tab while editor has default / empty text
    await page.locator("#open-ai-generator-btn").click();
    await page.locator("#ai-tab-improve").click();

    // Click improve without writing anything
    await page.locator("#ai-improve-btn").click();

    // Expect validation banner informing user to write or paste content first
    const errorBanner = page.locator("#ai-validation-error");
    await expect(errorBanner).toBeVisible();
    await expect(errorBanner).toContainText("Please write or paste content into the editor");
  });
});
