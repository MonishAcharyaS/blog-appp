import { test, expect } from "@playwright/test";

test.describe("Keyboard Shortcut Symbol in Search Bar (Issue #27)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("TC-27.1: Clicking the keyboard shortcut button in the search bar focuses and selects the search input", async ({
    page,
  }) => {
    const searchInput = page.locator("#navbar-search-input");
    const shortcutBtn = page.locator("#navbar-search-shortcut-btn");

    await expect(searchInput).toBeVisible();
    await expect(shortcutBtn).toBeVisible();

    // Verify initially not focused
    await expect(searchInput).not.toBeFocused();

    // Click the shortcut button
    await shortcutBtn.click();

    // Verify search input is now focused
    await expect(searchInput).toBeFocused();
  });

  test("TC-27.2: Typing immediately after clicking the keyboard shortcut button inputs query properly", async ({
    page,
  }) => {
    const searchInput = page.locator("#navbar-search-input");
    const shortcutBtn = page.locator("#navbar-search-shortcut-btn");

    await shortcutBtn.click();
    await expect(searchInput).toBeFocused();

    // Directly type query
    await page.keyboard.type("Architecture");
    await expect(searchInput).toHaveValue("Architecture");

    // Shortcut button should now be replaced by clear button
    await expect(shortcutBtn).not.toBeVisible();
    const clearBtn = page.locator("#navbar-search-clear-btn");
    await expect(clearBtn).toBeVisible();
  });

  test("TC-27.3: Global keyboard trigger (Ctrl+K / Cmd+K) still focuses the search input", async ({
    page,
  }) => {
    const searchInput = page.locator("#navbar-search-input");
    await expect(searchInput).not.toBeFocused();

    // Trigger keyboard shortcut
    await page.keyboard.press("Control+k");
    await expect(searchInput).toBeFocused();
  });

  test("TC-27.4: Clearing query restores the interactive shortcut button", async ({
    page,
  }) => {
    const searchInput = page.locator("#navbar-search-input");
    const shortcutBtn = page.locator("#navbar-search-shortcut-btn");
    const clearBtn = page.locator("#navbar-search-clear-btn");

    // Focus and type text
    await shortcutBtn.click();
    await page.keyboard.type("React");
    await expect(searchInput).toHaveValue("React");
    await expect(clearBtn).toBeVisible();
    await expect(shortcutBtn).not.toBeVisible();

    // Click clear button
    await clearBtn.click();
    await expect(searchInput).toHaveValue("");
    await expect(shortcutBtn).toBeVisible();
    await expect(searchInput).toBeFocused();
  });

  test("TC-27.5: Shortcut button has proper accessibility aria-label and platform-appropriate text", async ({
    page,
  }) => {
    const shortcutBtn = page.locator("#navbar-search-shortcut-btn");
    await expect(shortcutBtn).toBeVisible();

    // Check aria-label
    const ariaLabel = await shortcutBtn.getAttribute("aria-label");
    expect(ariaLabel).toContain("Focus search input");

    // Check inner text is either Ctrl K or ⌘K
    const badge = page.locator("#navbar-search-shortcut-badge");
    const text = await badge.innerText();
    expect(["Ctrl K", "⌘K"]).toContain(text.trim());
  });
});
