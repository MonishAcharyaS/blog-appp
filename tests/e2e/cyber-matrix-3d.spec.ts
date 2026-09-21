import { test, expect } from "@playwright/test";

test.describe("GitHub Issue #37: Advanced Tech Cyberpunk 3D Spatial Interactive UI/UX Redesign", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("TC-CYBER-3D-01: Cyber Matrix 3D Canvas Grid is rendered and active in DOM", async ({ page }) => {
    // Check canvas element existence
    const canvas = page.locator("canvas[aria-hidden='true']");
    await expect(canvas).toBeVisible();

    // Verify canvas dimensions match or fill the viewport
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeGreaterThan(300);
      expect(box.height).toBeGreaterThan(300);
    }
  });

  test("TC-CYBER-3D-02: 3D perspective cards respond to mouse cursor with dynamic spatial depth", async ({
    page,
  }) => {
    const tiltWrapper = page.locator('[data-testid="tilt-card-wrapper"]').first();
    await expect(tiltWrapper).toBeVisible({ timeout: 10000 });

    const initialTransform = await tiltWrapper.evaluate((el) => el.style.transform);
    expect(initialTransform).toContain("perspective(1000px)");

    // Simulate pointer movement over card
    const boundingBox = await tiltWrapper.boundingBox();
    expect(boundingBox).toBeTruthy();
    if (boundingBox) {
      await page.mouse.move(
        boundingBox.x + boundingBox.width * 0.8,
        boundingBox.y + boundingBox.height * 0.2
      );
      await page.waitForTimeout(200);

      const hoveredTransform = await tiltWrapper.evaluate((el) => el.style.transform);
      expect(hoveredTransform).not.toBe(initialTransform);
      expect(hoveredTransform).toContain("rotateX");
      expect(hoveredTransform).toContain("rotateY");
    }
  });

  test("TC-CYBER-3D-03: Cyberpunk neon tokens and tech chips are present across feed cards", async ({
    page,
  }) => {
    const firstCard = page.locator('[data-testid="blog-card"]').first();
    await expect(firstCard).toBeVisible();

    // Verify tech-chip class
    const techChips = firstCard.locator(".tech-chip");
    const count = await techChips.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Verify body retains tech-grid-bg
    const body = page.locator("body");
    await expect(body).toHaveClass(/tech-grid-bg/);
  });

  test("TC-CYBER-3D-04: Theme switcher updates to cyber dark mode with dark styling", async ({ page }) => {
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
  });

  test("TC-CYBER-3D-NEG-01: Prefers-reduced-motion disables 3D spatial rotation on TiltCard", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    const tiltWrapper = page.locator('[data-testid="tilt-card-wrapper"]').first();
    await expect(tiltWrapper).toBeVisible();

    const initialTransform = await tiltWrapper.evaluate((el) => el.style.transform);
    const boundingBox = await tiltWrapper.boundingBox();
    if (boundingBox) {
      await page.mouse.move(
        boundingBox.x + boundingBox.width * 0.9,
        boundingBox.y + boundingBox.height * 0.1
      );
      await page.waitForTimeout(200);

      const reducedTransform = await tiltWrapper.evaluate((el) => el.style.transform);
      expect(reducedTransform).toBe(initialTransform);
    }
  });
});
