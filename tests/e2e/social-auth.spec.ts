import { test, expect } from "@playwright/test";

test.describe("Social OAuth Authentication Workflows (Issue #28)", () => {
  test("TC-28.1: Google, GitHub, and LinkedIn social buttons are visible and properly branded on /login", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // Check divider text in main form
    const dividerText = page.locator("#social-auth-divider-text").first();
    await expect(dividerText).toBeVisible();
    await expect(dividerText).toHaveText("Or continue with");

    // Check Google button
    const googleBtn = page.locator("#social-login-google").first();
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText("Google");

    // Check GitHub button
    const githubBtn = page.locator("#social-login-github").first();
    await expect(githubBtn).toBeVisible();
    await expect(githubBtn).toContainText("GitHub");

    // Check LinkedIn button
    const linkedinBtn = page.locator("#social-login-linkedin").first();
    await expect(linkedinBtn).toBeVisible();
    await expect(linkedinBtn).toContainText("LinkedIn");
  });

  test("TC-28.2: Google, GitHub, and LinkedIn social buttons are visible and properly branded on /register", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("domcontentloaded");

    // Check divider text in main form
    const dividerText = page.locator("#social-auth-divider-text").first();
    await expect(dividerText).toBeVisible();
    await expect(dividerText).toHaveText("Or continue with");

    // Check Google button
    const googleBtn = page.locator("#social-login-google").first();
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText("Google");

    // Check GitHub button
    const githubBtn = page.locator("#social-login-github").first();
    await expect(githubBtn).toBeVisible();
    await expect(githubBtn).toContainText("GitHub");

    // Check LinkedIn button
    const linkedinBtn = page.locator("#social-login-linkedin").first();
    await expect(linkedinBtn).toBeVisible();
    await expect(linkedinBtn).toContainText("LinkedIn");
  });

  test("TC-28.3: Social sign-in via Google provisions user and establishes authenticated session", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const googleBtn = page.locator("#social-login-google").first();
    await expect(googleBtn).toBeVisible();

    await Promise.all([
      page.waitForURL((url) => url.pathname === "/", { timeout: 25000 }),
      googleBtn.click(),
    ]);

    // Verify session authentication on test-auth portal
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#session-status")).toHaveText("authenticated", { timeout: 15000 });
    await expect(page.locator("#user-email")).toHaveText("alex.google@demo.blogify.io");
    await expect(page.locator("#user-name")).toContainText("Google");
    await expect(page.locator("#user-role")).toHaveText("READER");
  });

  test("TC-28.4: Social sign-in via GitHub establishes authenticated session", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const githubBtn = page.locator("#social-login-github").first();
    await expect(githubBtn).toBeVisible();

    await Promise.all([
      page.waitForURL((url) => url.pathname === "/", { timeout: 25000 }),
      githubBtn.click(),
    ]);

    // Verify session authentication on test-auth portal
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#session-status")).toHaveText("authenticated", { timeout: 15000 });
    await expect(page.locator("#user-email")).toHaveText("octocat.github@demo.blogify.io");
    await expect(page.locator("#user-name")).toContainText("GitHub");
    await expect(page.locator("#user-role")).toHaveText("READER");
  });

  test("TC-28.5: Social sign-in via LinkedIn establishes authenticated session", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const linkedinBtn = page.locator("#social-login-linkedin").first();
    await expect(linkedinBtn).toBeVisible();

    await Promise.all([
      page.waitForURL((url) => url.pathname === "/", { timeout: 25000 }),
      linkedinBtn.click(),
    ]);

    // Verify session authentication on test-auth portal
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#session-status")).toHaveText("authenticated", { timeout: 15000 });
    await expect(page.locator("#user-email")).toHaveText("sarah.linkedin@demo.blogify.io");
    await expect(page.locator("#user-name")).toContainText("LinkedIn");
    await expect(page.locator("#user-role")).toHaveText("READER");
  });

  test("TC-28.6: OAuth AccessDenied or error query param renders account suspension / friendly alert on /login", async ({
    page,
  }) => {
    await page.goto("/login?error=AccessDenied");
    await page.waitForLoadState("domcontentloaded");

    const accessDeniedBanner = page.locator("#login-error-banner").first();
    await expect(accessDeniedBanner).toBeVisible({ timeout: 10000 });
    await expect(accessDeniedBanner).toContainText("Your account has been suspended");

    // Test OAuthSignin error
    await page.goto("/login?error=OAuthSignin");
    await page.waitForLoadState("domcontentloaded");
    const oauthSigninBanner = page.locator("#login-error-banner").first();
    await expect(oauthSigninBanner).toBeVisible({ timeout: 10000 });
    await expect(oauthSigninBanner).toContainText("Could not initialize social sign-in");

    // Test OAuthCallback error
    await page.goto("/login?error=OAuthCallback");
    await page.waitForLoadState("domcontentloaded");
    const oauthCallbackBanner = page.locator("#login-error-banner").first();
    await expect(oauthCallbackBanner).toBeVisible({ timeout: 10000 });
    await expect(oauthCallbackBanner).toContainText("Social authorization was cancelled or encountered an error");
  });
});
