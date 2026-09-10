import { test, expect } from "@playwright/test";

test.describe("Social OAuth Authentication Workflows (Issue #25)", () => {
  test("TC-25.1: Google, GitHub, and LinkedIn social buttons are visible and properly branded on /login", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // Check divider text
    await expect(page.locator("text=Or continue with")).toBeVisible();

    // Check Google button
    const googleBtn = page.locator("#social-login-google");
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText("Google");

    // Check GitHub button
    const githubBtn = page.locator("#social-login-github");
    await expect(githubBtn).toBeVisible();
    await expect(githubBtn).toContainText("GitHub");

    // Check LinkedIn button
    const linkedinBtn = page.locator("#social-login-linkedin");
    await expect(linkedinBtn).toBeVisible();
    await expect(linkedinBtn).toContainText("LinkedIn");
  });

  test("TC-25.2: Google, GitHub, and LinkedIn social buttons are visible and properly branded on /register", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("domcontentloaded");

    // Check divider text
    await expect(page.locator("text=Or continue with")).toBeVisible();

    // Check Google button
    const googleBtn = page.locator("#social-login-google");
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText("Google");

    // Check GitHub button
    const githubBtn = page.locator("#social-login-github");
    await expect(githubBtn).toBeVisible();
    await expect(githubBtn).toContainText("GitHub");

    // Check LinkedIn button
    const linkedinBtn = page.locator("#social-login-linkedin");
    await expect(linkedinBtn).toBeVisible();
    await expect(linkedinBtn).toContainText("LinkedIn");
  });

  test("TC-25.3: Clicking on Google social login button triggers NextAuth provider signin flow", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const googleBtn = page.locator("#social-login-google");
    await expect(googleBtn).toBeVisible();

    // Intercept or track NextAuth signin request
    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes("/api/auth/signin/google") ||
        request.url().includes("accounts.google.com"),
      { timeout: 10000 }
    );

    await googleBtn.click();
    const request = await requestPromise;
    expect(request).toBeTruthy();
  });

  test("TC-25.4: Clicking on GitHub social login button triggers NextAuth provider signin flow", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const githubBtn = page.locator("#social-login-github");
    await expect(githubBtn).toBeVisible();

    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes("/api/auth/signin/github") ||
        request.url().includes("github.com/login/oauth"),
      { timeout: 10000 }
    );

    await githubBtn.click();
    const request = await requestPromise;
    expect(request).toBeTruthy();
  });

  test("TC-25.5: Clicking on LinkedIn social login button triggers NextAuth provider signin flow", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const linkedinBtn = page.locator("#social-login-linkedin");
    await expect(linkedinBtn).toBeVisible();

    const requestPromise = page.waitForRequest(
      (request) =>
        request.url().includes("/api/auth/signin/linkedin") ||
        request.url().includes("linkedin.com/oauth"),
      { timeout: 10000 }
    );

    await linkedinBtn.click();
    const request = await requestPromise;
    expect(request).toBeTruthy();
  });

  test("TC-25.6: OAuth AccessDenied or error query param renders account suspension / friendly alert on /login", async ({
    page,
  }) => {
    await page.goto("/login?error=AccessDenied");
    await page.waitForLoadState("domcontentloaded");

    const accessDeniedBanner = page.locator("#login-error-banner").first();
    await expect(accessDeniedBanner).toBeVisible({ timeout: 10000 });
    await expect(accessDeniedBanner).toContainText("Your account has been suspended");

    // Test generic OAuth error
    await page.goto("/login?error=OAuthSignin");
    await page.waitForLoadState("domcontentloaded");
    const oauthErrorBanner = page.locator("#login-error-banner").first();
    await expect(oauthErrorBanner).toBeVisible({ timeout: 10000 });
    await expect(oauthErrorBanner).toContainText("Could not authenticate with social provider");
  });
});
