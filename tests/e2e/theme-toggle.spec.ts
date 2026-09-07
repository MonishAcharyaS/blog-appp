import { test, expect } from "@playwright/test";

test.describe("Design System & Dark/Light Mode Switcher E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("TC-201.1: Clicking ThemeToggle switches sun/moon icon and toggles .dark class on html", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const html = page.locator("html");
    const toggleBtn = page.locator("#theme-toggle-btn");

    // Initially light mode default (unless system prefers dark)
    await expect(toggleBtn).toBeVisible();

    // Ensure we start in light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // In light mode: moon icon is visible to prompt switching to dark mode
    await expect(page.locator("#moon-icon")).toBeVisible();
    await expect(html).not.toHaveClass(/dark/);

    // Click toggle to switch to dark mode
    await toggleBtn.click();
    await expect(html).toHaveClass(/dark/);
    await expect(page.locator("#sun-icon")).toBeVisible();

    // Verify localStorage set to "dark"
    const storedTheme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(storedTheme).toBe("dark");

    // Click toggle again to switch back to light mode
    await toggleBtn.click();
    await expect(html).not.toHaveClass(/dark/);
    await expect(page.locator("#moon-icon")).toBeVisible();

    const restoredTheme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(restoredTheme).toBe("light");
  });

  test("TC-201.2: Reloading page preserves chosen theme from localStorage", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const html = page.locator("html");
    const toggleBtn = page.locator("#theme-toggle-btn");

    // Toggle to dark mode
    await toggleBtn.click();
    await expect(html).toHaveClass(/dark/);

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify .dark class persists without FOUC
    await expect(html).toHaveClass(/dark/);
    await expect(page.locator("#sun-icon")).toBeVisible();

    // Verify on another page (/register)
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await expect(html).toHaveClass(/dark/);
  });

  test("TC-201.3: Respects prefers-color-scheme: dark on first visit", async ({
    page,
  }) => {
    // Emulate dark color scheme
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const html = page.locator("html");
    // With no localStorage, OS preference 'dark' should add dark class
    await expect(html).toHaveClass(/dark/);
    await expect(page.locator("#sun-icon")).toBeVisible();
  });

  test("TC-201.4: Disabling JavaScript retains clean default light theme without crash", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    const response = await page.goto("/login");
    expect(response?.status()).toBe(200);

    const html = page.locator("html");
    // Without JS, defaults to light cleanly
    await expect(html).not.toHaveClass(/dark/);
    await expect(page.locator("h1")).toHaveText("Welcome back");

    await context.close();
  });

  test("TC-201.5: Login card adapts styles when dark mode is enabled", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const toggleBtn = page.locator("#theme-toggle-btn");
    await toggleBtn.click();

    // Verify .dark is present on html
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);

    // Verify card has dark classes applied
    const loginCard = page.locator("#login-email").locator("xpath=ancestor::form/..");
    await expect(loginCard).toHaveClass(/dark:bg-gray-900/);
    await expect(loginCard).toHaveClass(/dark:border-gray-800/);
  });
});
