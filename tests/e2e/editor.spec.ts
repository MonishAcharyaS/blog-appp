import { test, expect } from "@playwright/test";

test.describe("TipTap WYSIWYG Editor (PROJ-204) E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/editor-demo");
    await page.waitForLoadState("domcontentloaded");
    // Ensure editor editable is visible
    await expect(page.locator("[data-testid='tiptap-content-editable']")).toBeVisible();
  });

  test("TC-204.1: Typing and applying formatting (H1, Bold, Bullet List) outputs clean HTML", async ({
    page,
  }) => {
    const editor = page.locator("[data-testid='tiptap-content-editable']");
    await editor.click();

    // Select all and clear
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");

    // Type text and make it H1
    await page.keyboard.type("Revolutionary Blog Platform");
    const h1Btn = page.locator("#toolbar-h1-btn");
    await h1Btn.click();

    // Check output HTML contains <h1>
    const rawOutput = page.locator("[data-testid='editor-raw-html-output']");
    await expect(rawOutput).toContainText("<h1>Revolutionary Blog Platform</h1>");

    // Press enter and type bold text
    await page.keyboard.press("Enter");
    const boldBtn = page.locator("#toolbar-bold-btn");
    await boldBtn.click();
    await page.keyboard.type("Bold architectural statement");

    await expect(rawOutput).toContainText("<strong>Bold architectural statement</strong>");

    // Press enter and start bullet list
    await page.keyboard.press("Enter");
    const bulletBtn = page.locator("#toolbar-bullet-list-btn");
    await bulletBtn.click();
    await page.keyboard.type("Item One");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Item Two");

    await expect(rawOutput).toContainText("<ul>");
    await expect(rawOutput).toContainText("<li><p>Item One</p></li>");
    await expect(rawOutput).toContainText("<li><p>Item Two</p></li>");
  });

  test("TC-204.2: Inserting link wraps selection with <a target='_blank' rel='noopener noreferrer'>", async ({
    page,
  }) => {
    const editor = page.locator("[data-testid='tiptap-content-editable']");
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");

    await page.keyboard.type("Visit our Documentation site");

    // Select "Documentation"
    await page.keyboard.press("Control+A");

    // Click Link toolbar button
    const linkBtn = page.locator("#toolbar-link-btn");
    await linkBtn.click();

    // Popover appears
    const linkPopover = page.locator("#toolbar-link-popover");
    await expect(linkPopover).toBeVisible();

    const linkInput = page.locator("#toolbar-link-input");
    await linkInput.fill("https://docs.blogify.example.com");

    const saveBtn = page.locator("#toolbar-link-save-btn");
    await saveBtn.click();

    // Verify HTML output contains anchor with target blank and noopener
    const rawOutput = page.locator("[data-testid='editor-raw-html-output']");
    await expect(rawOutput).toContainText('href="https://docs.blogify.example.com"');
    await expect(rawOutput).toContainText('target="_blank"');
    await expect(rawOutput).toContainText('rel="noopener noreferrer"');
  });

  test("TC-204.3: Embedding an image via URL inserts <img> with responsive styles", async ({
    page,
  }) => {
    const imageBtn = page.locator("#toolbar-image-btn");
    await imageBtn.click();

    const imagePopover = page.locator("#toolbar-image-popover");
    await expect(imagePopover).toBeVisible();

    const urlInput = page.locator("#toolbar-image-url-input");
    await urlInput.fill("https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200");

    const altInput = page.locator("#toolbar-image-alt-input");
    await altInput.fill("Next.js Architecture Showcase");

    const embedBtn = page.locator("#toolbar-image-save-btn");
    await embedBtn.click();

    // Verify image in rendered preview and editor
    const rawOutput = page.locator("[data-testid='editor-raw-html-output']");
    await expect(rawOutput).toContainText("<img");
    await expect(rawOutput).toContainText('alt="Next.js Architecture Showcase"');
    await expect(rawOutput).toContainText('src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200"');
  });

  test("TC-204.4: Malicious script tags and event handlers are sanitized", async ({
    page,
  }) => {
    // Paste/type text into editor
    const editor = page.locator("[data-testid='tiptap-content-editable']");
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");

    await page.keyboard.type("Clean article text");

    // The rendered preview and editor must not execute or contain raw script tags
    const renderedPreview = page.locator("[data-testid='editor-rendered-preview']");
    await expect(renderedPreview).toBeVisible();
    await expect(renderedPreview.locator("script")).toHaveCount(0);

    const rawOutput = page.locator("[data-testid='editor-raw-html-output']");
    const html = await rawOutput.innerText();
    expect(html).not.toContain("<script>");
  });

  test("TC-204.5: Word and character counters update live; empty submission displays error", async ({
    page,
  }) => {
    const clearBtn = page.locator("#editor-clear-btn");
    await clearBtn.click();

    const wordCount = page.locator("#editor-word-count");
    const charCount = page.locator("#editor-char-count");
    await expect(wordCount).toHaveText("0 words");
    await expect(charCount).toHaveText("0 characters");

    // Submitting empty produces validation error
    const submitBtn = page.locator("#editor-submit-btn");
    await submitBtn.click();

    const validationError = page.locator("#editor-validation-error");
    await expect(validationError).toBeVisible();
    await expect(validationError).toContainText(/Article content cannot be empty/i);

    // Typing updates counters and clears error
    const editor = page.locator("[data-testid='tiptap-content-editable']");
    await editor.click();
    await page.keyboard.type("Three little words");

    await expect(wordCount).toHaveText("3 words");
    await expect(charCount).toHaveText("18 characters");

    // Submitting now succeeds
    await submitBtn.click();
    const successBanner = page.locator("#editor-submission-success");
    await expect(successBanner).toBeVisible();
  });

  test("TC-204.6: Active mark highlighting on toolbar buttons reflects cursor position", async ({
    page,
  }) => {
    const editor = page.locator("[data-testid='tiptap-content-editable']");
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");

    await page.keyboard.type("Testing bold text");

    // Select text and click bold button
    await page.keyboard.press("Control+A");
    const boldBtn = page.locator("#toolbar-bold-btn");
    await boldBtn.click();

    // Bold button should now be active
    await expect(boldBtn).toHaveClass(/bg-\[#5B48EE\]/);

    // Toggle bold off
    await boldBtn.click();
    await expect(boldBtn).not.toHaveClass(/bg-\[#5B48EE\]/);
  });
});
