import { test, expect } from "@playwright/test";

test.describe("PROJ-404: User Management, Ban/Unban & Role Control E2E Tests", () => {
  test("TC-404.1: Admin navigates to /admin/users and views registered users list with correct role and status badges", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Navigate to /admin/users
    await page.goto("/admin/users");
    await page.waitForLoadState("domcontentloaded");

    // Check heading and counter chips
    await expect(page.locator("h1")).toContainText("User Management");
    await expect(page.locator("#total-users-badge")).toBeVisible();
    await expect(page.locator("#metric-total-users")).toBeVisible();
    await expect(page.locator("#metric-admin-users")).toBeVisible();
    await expect(page.locator("#metric-reader-users")).toBeVisible();

    // Verify user table renders and loading finishes
    const table = page.locator("#admin-users-table");
    await expect(table).toBeVisible();
    await expect(page.locator("#loading-users-row")).not.toBeVisible({ timeout: 10000 });

    const rows = table.locator("tbody tr[id^='user-row-']");
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Verify admin row exists and displays "Current Account" indicator
    const adminRow = page.locator("tr", { hasText: "admin@example.com" });
    await expect(adminRow).toBeVisible();
    await expect(adminRow.locator("span[id^='self-lockout-indicator-']")).toBeVisible();
  });

  test("TC-404.2: Real-time search filters users by name and email", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Navigate to /admin/users
    await page.goto("/admin/users");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#loading-users-row")).not.toBeVisible({ timeout: 10000 });

    // Search for "Jane"
    const searchInput = page.locator("#admin-users-search");
    await searchInput.fill("Jane");

    // Wait for filtered results
    await expect(page.locator("tr", { hasText: "jane@example.com" })).toBeVisible();
    await expect(page.locator("tr", { hasText: "alex@example.com" })).not.toBeVisible();

    // Clear search
    await page.click("#reset-users-filters-btn");
    await expect(page.locator("tr", { hasText: "alex@example.com" })).toBeVisible();
  });

  test("TC-404.3: Filter tabs filter by Role (Admin/Reader) and Status (Active/Banned)", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Navigate to /admin/users
    await page.goto("/admin/users");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#loading-users-row")).not.toBeVisible({ timeout: 10000 });

    // Filter by ADMIN
    await page.click("#filter-role-ADMIN");
    await expect(page.locator("tr", { hasText: "admin@example.com" })).toBeVisible();
    await expect(page.locator("tr", { hasText: "jane@example.com" })).not.toBeVisible();

    // Filter by READER
    await page.click("#filter-role-READER");
    await expect(page.locator("tr", { hasText: "jane@example.com" })).toBeVisible();
    await expect(page.locator("tr", { hasText: "alex@example.com" })).toBeVisible();
    await expect(page.locator("tr", { hasText: "admin@example.com" })).not.toBeVisible();

    // Reset filters
    await page.click("#filter-role-all");
    await expect(page.locator("tr", { hasText: "admin@example.com" })).toBeVisible();
  });

  test("TC-404.4: Admin promotes a READER to ADMIN, and user gains access to /admin", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Navigate to /admin/users
    await page.goto("/admin/users");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#loading-users-row")).not.toBeVisible({ timeout: 10000 });

    // Find Jane's row
    const janeRow = page.locator("tr", { hasText: "jane@example.com" });
    await expect(janeRow).toBeVisible();

    // Click Promote
    const promoteBtn = janeRow.locator("button[id^='toggle-role-']");
    await promoteBtn.click();

    // Role change confirmation modal opens
    const modal = page.locator("#role-change-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Promote to Administrator?");

    // Confirm Promote
    await page.click("#confirm-role-change-btn");
    await expect(modal).not.toBeVisible();

    // Verify Jane's badge updates to ADMIN
    await expect(janeRow.locator("span[id^='user-role-badge-']")).toHaveText("ADMIN");

    // 3. Log out and log in as Jane Cooper to verify /admin access
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.click("#logout-btn");
    await expect(page.locator("#session-status")).toHaveText("unauthenticated", {
      timeout: 15000,
    });

    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });
    await expect(page.locator("#user-role")).toHaveText("ADMIN");

    // Navigate to /admin
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Admin Control Center");
  });

  test("TC-404.5: Admin demotes an ADMIN back to READER", async ({
    page,
  }) => {
    // 1. Authenticate as Platform Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Navigate to /admin/users
    await page.goto("/admin/users");
    await page.waitForLoadState("domcontentloaded");

    // Find Jane's row (currently ADMIN)
    const janeRow = page.locator("tr", { hasText: "jane@example.com" });
    await expect(janeRow).toBeVisible();

    // Click Demote
    const demoteBtn = janeRow.locator("button[id^='toggle-role-']");
    await demoteBtn.click();

    // Modal
    const modal = page.locator("#role-change-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Demote to Reader?");

    // Confirm Demote
    await page.click("#confirm-role-change-btn");
    await expect(modal).not.toBeVisible();

    // Verify Jane's badge updates to READER
    await expect(janeRow.locator("span[id^='user-role-badge-']")).toHaveText("READER");
  });

  test("TC-404.6: Admin bans a user; user status becomes Banned, and user login fails with Account suspended", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Navigate to /admin/users
    await page.goto("/admin/users");
    await page.waitForLoadState("domcontentloaded");

    // Find Alex Rivera
    const alexRow = page.locator("tr", { hasText: "alex@example.com" });
    await expect(alexRow).toBeVisible();

    // Click Ban User
    const banBtn = alexRow.locator("button[id^='toggle-ban-']");
    await expect(banBtn).toHaveText("Ban User");
    await banBtn.click();

    // Modal opens
    const modal = page.locator("#ban-user-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Suspend & Ban User?");

    // Confirm ban
    await page.click("#confirm-ban-btn");
    await expect(modal).not.toBeVisible();

    // Status updates to Banned
    await expect(alexRow.locator("span[id^='user-status-badge-']")).toContainText("Banned");
    await expect(alexRow.locator("button[id^='toggle-ban-']")).toHaveText("Unban User");

    // 3. Verify Alex login attempt on /login fails with Account suspended
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await page.fill("#login-email", "alex@example.com");
    await page.fill("#login-password", "Reader123!");
    await page.click("#login-submit-btn");

    const errorBanner = page.locator("#login-error-banner");
    await expect(errorBanner).toBeVisible({ timeout: 10000 });
    await expect(errorBanner).toContainText("suspended");
  });

  test("TC-404.7: Admin unbans user; user status becomes Active, and user can log in again", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Navigate to /admin/users
    await page.goto("/admin/users");
    await page.waitForLoadState("domcontentloaded");

    // Find Alex Rivera
    const alexRow = page.locator("tr", { hasText: "alex@example.com" });
    await expect(alexRow).toBeVisible();

    // Click Unban User
    const unbanBtn = alexRow.locator("button[id^='toggle-ban-']");
    await expect(unbanBtn).toHaveText("Unban User");
    await unbanBtn.click();

    // Modal opens
    const modal = page.locator("#ban-user-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Unban User Account?");

    // Confirm unban
    await page.click("#confirm-ban-btn");
    await expect(modal).not.toBeVisible();

    // Status updates to Active
    await expect(alexRow.locator("span[id^='user-status-badge-']")).toContainText("Active");

    // 3. Verify Alex can log in successfully now
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.click("#logout-btn");
    await expect(page.locator("#session-status")).toHaveText("unauthenticated", {
      timeout: 15000,
    });

    await page.fill("#email-input", "alex@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });
  });

  test("TC-404.8: Self-lockout prevention: Admin cannot ban or demote their own account via API or UI", async ({
    page,
  }) => {
    // 1. Authenticate as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    const adminUserId = await page.locator("#user-id").innerText();

    // 2. Go to /admin/users
    await page.goto("/admin/users");
    await page.waitForLoadState("domcontentloaded");

    const adminRow = page.locator("tr", { hasText: "admin@example.com" });
    // In UI, ban button and promote/demote button do not exist for self
    await expect(adminRow.locator("span[id^='self-lockout-indicator-']")).toBeVisible();
    await expect(adminRow.locator("button[id^='toggle-ban-']")).not.toBeVisible();
    await expect(adminRow.locator("button[id^='toggle-role-']")).not.toBeVisible();

    // 3. Direct API call to ban self should return 400 with self-lockout error
    const banResponse = await page.request.patch(`/api/admin/users/${adminUserId}`, {
      data: { isBanned: true },
    });
    expect(banResponse.status()).toBe(400);
    const banData = await banResponse.json();
    expect(banData.error).toContain("Self-lockout prevented");

    // 4. Direct API call to demote self should also return 400
    const demoteResponse = await page.request.patch(`/api/admin/users/${adminUserId}`, {
      data: { role: "READER" },
    });
    expect(demoteResponse.status()).toBe(400);
    const demoteData = await demoteResponse.json();
    expect(demoteData.error).toContain("Self-lockout prevented");
  });

  test("TC-404.9: Non-admin reader cannot access /admin/users (redirects with unauthorized error)", async ({
    page,
  }) => {
    // 1. Authenticate as Reader Jane
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    // 2. Attempt to navigate directly to /admin/users
    await page.goto("/admin/users");
    await page.waitForLoadState("domcontentloaded");

    // Middleware redirects unauthorized readers away to / with error=unauthorized
    await expect(page).toHaveURL(/\/\?error=unauthorized/);
  });

  test("TC-404.10: Non-admin reader calling PATCH /api/admin/users/[id] returns 403 Forbidden", async ({
    page,
  }) => {
    // 1. Authenticate as Reader Jane
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await page.fill("#email-input", "jane@example.com");
    await page.fill("#password-input", "Reader123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", {
      timeout: 15000,
    });

    const janeId = await page.locator("#user-id").innerText();

    // 2. Send direct PATCH request to /api/admin/users/[id]
    const patchResponse = await page.request.patch(`/api/admin/users/${janeId}`, {
      data: { role: "ADMIN" },
    });

    // 3. Must return 403 Forbidden
    expect(patchResponse.status()).toBe(403);
    const data = await patchResponse.json();
    expect(data.error).toMatch(/Administrator access required|Admin access required|Forbidden/);
  });
});
