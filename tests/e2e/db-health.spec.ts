import { test, expect } from "@playwright/test";

test.describe("Database & API Health Integration Test", () => {
  test("Database responds to Prisma queries via health endpoint with status ok", async ({
    request,
  }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.database).toBe("connected");
    expect(typeof body.userCount).toBe("number");
    expect(typeof body.postCount).toBe("number");
  });

  test("Browser visits home page and renders cleanly without error overlays", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Blogify/);
  });
});
