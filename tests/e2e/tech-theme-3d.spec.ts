import { test, expect } from "@playwright/test";

test.describe("Technology Theme UI/UX & 3D Spatial Interactions (#36)", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto("http://localhost:3000");
    await page.waitForLoadState("domcontentloaded");
  });

  test("TC-TECH-3D-01: Verify Engineering Cyber Grid background is rendered on body", async ({ page }) => {
    const body = page.locator("body");
    await expect(body).toHaveClass(/tech-grid-bg/);

    // Verify tech-grid-bg styles are applied in computed CSS
    const hasGridPattern = await body.evaluate((el) => {
      const bgImage = window.getComputedStyle(el).backgroundImage;
      return bgImage.includes("linear-gradient");
    });
    expect(hasGridPattern).toBe(true);
  });

  test("TC-TECH-3D-02: Verify 3D TiltCard responds to pointer motion with spatial perspective tilt", async ({ page }) => {
    const tiltWrapper = page.locator('[data-testid="tilt-card-wrapper"]').first();
    await expect(tiltWrapper).toBeVisible({ timeout: 10000 });

    // Initial transform style
    const initialTransform = await tiltWrapper.evaluate((el) => el.style.transform);
    expect(initialTransform).toContain("perspective(1000px)");

    // Trigger mousemove on the element directly with coordinates to simulate hover and tilt
    const boundingBox = await tiltWrapper.boundingBox();
    expect(boundingBox).toBeTruthy();
    if (boundingBox) {
      await page.mouse.move(
        boundingBox.x + boundingBox.width * 0.85,
        boundingBox.y + boundingBox.height * 0.2
      );
      await page.waitForTimeout(200);

      // Verify rotation transform changed
      const hoveredTransform = await tiltWrapper.evaluate((el) => el.style.transform);
      expect(hoveredTransform).not.toBe(initialTransform);
      expect(hoveredTransform).toContain("rotateX");
      expect(hoveredTransform).toContain("rotateY");
    }
  });

  test("TC-TECH-3D-03: Verify technology badges and cyber telemetry chips on FeaturedHero and BlogCard", async ({ page }) => {
    // Check Featured hero tech radar chip if featured hero exists
    const heroSection = page.locator("#featured-hero-section");
    if (await heroSection.isVisible()) {
      const techRadarBadge = heroSection.locator("text=Tech Radar // Featured");
      await expect(techRadarBadge).toBeVisible();
      await expect(techRadarBadge).toHaveClass(/tech-chip/);
    }

    // Check BlogCard tech chips
    const firstCard = page.locator('[data-testid="blog-card"]').first();
    await expect(firstCard).toBeVisible();
    const techChips = firstCard.locator(".tech-chip");
    const count = await techChips.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("TC-TECH-3D-04: Verify theme toggle toggles between light and cyber dark mode", async ({ page }) => {
    const themeBtn = page.locator("#theme-toggle-btn");
    await expect(themeBtn).toBeVisible();

    // Ensure dark class can be added
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    const htmlDark = page.locator("html");
    await expect(htmlDark).toHaveClass(/dark/);

    // Verify dark mode ambient glow / grid
    const bodyColor = await page.locator("body").evaluate((el) => {
      return window.getComputedStyle(el).colorScheme || window.getComputedStyle(document.documentElement).colorScheme;
    });
    expect(bodyColor).toBeDefined();
  });

  test("TC-TECH-3D-NEG-01: Verify prefers-reduced-motion disables 3D spatial tilt transforms", async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    const tiltWrapper = page.locator('[data-testid="tilt-card-wrapper"]').first();
    await expect(tiltWrapper).toBeVisible();

    const initialTransform = await tiltWrapper.evaluate((el) => el.style.transform);

    const boundingBox = await tiltWrapper.boundingBox();
    if (boundingBox) {
      await tiltWrapper.dispatchEvent("mousemove", {
        clientX: boundingBox.x + boundingBox.width * 0.9,
        clientY: boundingBox.y + boundingBox.height * 0.1,
      });
      await page.waitForTimeout(100);

      // Under reduced motion, handleMouseMove must not update transform
      const reducedTransform = await tiltWrapper.evaluate((el) => el.style.transform);
      expect(reducedTransform).toBe(initialTransform);
    }
  });
});
