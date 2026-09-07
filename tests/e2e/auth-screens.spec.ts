import { test, expect } from "@playwright/test";

test.describe("Authentication Screens (Login & Register) E2E Tests", () => {
  const uniqueId = Date.now();
  const newUserName = `E2E Tester ${uniqueId}`;
  const newUserEmail = `e2e_user_${uniqueId}@example.com`;
  const newUserPassword = "StrongPassword123!";

  test("TC-105.3: Register - Submitting invalid email displays inline validation error", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    // Enter invalid email format and trigger blur or submit
    await page.fill("#register-name", "Test User");
    await page.fill("#register-email", "invalid-email-format");
    await page.fill("#register-password", "ValidPass123!");
    await page.fill("#register-confirm-password", "ValidPass123!");
    await page.click("#register-submit-btn");

    const emailError = page.locator("#email-validation-error");
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveText("Please enter a valid email address");
  });

  test("TC-105.4: Register - Password shorter than 6 characters displays validation warning", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    await page.fill("#register-name", "Test User");
    await page.fill("#register-email", "valid@example.com");
    await page.fill("#register-password", "123");
    await page.fill("#register-confirm-password", "123");
    await page.click("#register-submit-btn");

    const passwordError = page.locator("#password-validation-error");
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toHaveText("Password must be at least 6 characters long");
  });

  test("TC-105.5: Register - Submitting an already-registered email displays error banner", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    // Try registering with existing seeded reader email
    await page.fill("#register-name", "Duplicate Jane");
    await page.fill("#register-email", "jane@example.com");
    await page.fill("#register-password", "Reader123!");
    await page.fill("#register-confirm-password", "Reader123!");
    await page.click("#register-submit-btn");

    const serverError = page.locator("#register-server-error-text");
    await expect(serverError).toBeVisible({ timeout: 10000 });
    await expect(serverError).toHaveText("Email already registered");
  });

  test("TC-105.1: Register - Successfully registers new account and redirects to login", async ({
    page,
  }) => {
    await page.goto("/register");
    await page.waitForLoadState("networkidle");

    // Test show/hide password toggle
    const passwordInput = page.locator("#register-password");
    await expect(passwordInput).toHaveAttribute("type", "password");
    await page.click("#register-toggle-password-btn");
    await expect(passwordInput).toHaveAttribute("type", "text");
    await page.click("#register-toggle-password-btn");
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Fill valid registration fields
    await page.fill("#register-name", newUserName);
    await page.fill("#register-email", newUserEmail);
    await page.fill("#register-password", newUserPassword);
    await page.fill("#register-confirm-password", newUserPassword);

    await page.click("#register-submit-btn");

    // Expect redirection to /login with registered=true parameter
    await expect(page).toHaveURL(/\/login\?registered=true/, { timeout: 15000 });
    await expect(page.locator("#registered-banner")).toBeVisible();
    await expect(page.locator("#registered-banner")).toContainText(
      "Account created successfully"
    );
  });

  test("TC-105.2: Login - Logs in with newly created credentials and establishes session", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Fill newly created user credentials
    await page.fill("#login-email", newUserEmail);
    await page.fill("#login-password", newUserPassword);
    await page.click("#login-submit-btn");

    // Redirects to home page ("/") upon successful login
    await expect(page).toHaveURL("/", { timeout: 15000 });

    // Verify session state on test portal or session endpoint
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 10000,
    });
    await expect(page.locator("#user-name")).toHaveText(newUserName);
    await expect(page.locator("#user-email")).toHaveText(newUserEmail);
    await expect(page.locator("#user-role")).toHaveText("READER");
  });

  test("TC-105.6: Login - Invalid credentials displays clear error banner", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.fill("#login-email", "nonexistent@example.com");
    await page.fill("#login-password", "WrongPassword123!");
    await page.click("#login-submit-btn");

    const errorBanner = page.locator("#login-error-text");
    await expect(errorBanner).toBeVisible({ timeout: 10000 });
    await expect(errorBanner).toContainText("Invalid email or password");
  });

  test("TC-105.7: Navigation links between Login and Register work seamlessly", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.click("#link-to-register");
    await expect(page).toHaveURL("/register");
    await expect(page.locator("h1")).toHaveText("Create an account");

    await page.click("#link-to-login");
    await expect(page).toHaveURL("/login");
    await expect(page.locator("h1")).toHaveText("Welcome back");
  });
});
