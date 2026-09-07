import { test, expect } from "@playwright/test";

test.describe("Multipart File & Cover Image Upload API Pipeline (PROJ-205)", () => {
  // 1x1 Transparent PNG valid fixture (68 bytes)
  const validPngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );

  test("TC-205.5: Unauthenticated upload request returns 401 Unauthorized", async ({
    request,
  }) => {
    const response = await request.post("/api/upload", {
      multipart: {
        file: {
          name: "test.png",
          mimeType: "image/png",
          buffer: validPngBuffer,
        },
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain("Authentication required");
  });

  test("TC-205.1 & TC-205.2: Authenticated user uploading valid image returns 200 and image is publicly servable", async ({
    page,
    request,
  }) => {
    // Authenticate by visiting /test-auth and logging in as Admin
    await page.goto("/test-auth");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#email-input")).toBeVisible();
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", { timeout: 15000 });

    // Perform upload inside browser context where auth cookies are present
    const uploadResult = await page.evaluate(async (pngBase64) => {
      const byteCharacters = atob(pngBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      const formData = new FormData();
      formData.append("file", blob, "featured-banner.png");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      return {
        status: res.status,
        data: await res.json(),
      };
    }, validPngBuffer.toString("base64"));

    expect(uploadResult.status).toBe(200);
    expect(uploadResult.data.url).toMatch(/^\/uploads\/\d+-[a-f0-9]+\.png$/);
    expect(uploadResult.data.mimeType).toBe("image/png");

    // TC-205.2: Verify that fetching the uploaded image URL serves 200 and image/png
    const imageResponse = await request.get(uploadResult.data.url);
    expect(imageResponse.status()).toBe(200);
    expect(imageResponse.headers()["content-type"]).toContain("image/png");
  });

  test("TC-205.3: File exceeding 5MB size limit returns 400 Bad Request", async ({
    page,
  }) => {
    // Ensure session
    await page.goto("/test-auth");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", { timeout: 15000 });

    // Upload an oversized file (5.5 MB)
    const result = await page.evaluate(async () => {
      // 5.5MB dummy array with PNG magic bytes
      const size = 5.5 * 1024 * 1024;
      const buffer = new Uint8Array(size);
      buffer[0] = 0x89;
      buffer[1] = 0x50;
      buffer[2] = 0x4e;
      buffer[3] = 0x47;

      const blob = new Blob([buffer], { type: "image/png" });
      const formData = new FormData();
      formData.append("file", blob, "huge-file.png");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      return {
        status: res.status,
        data: await res.json(),
      };
    });

    expect(result.status).toBe(400);
    expect(result.data.error).toContain("File size exceeds 5MB limit");
  });

  test("TC-205.4: Non-image or spoofed file returns 400 Invalid file type", async ({
    page,
  }) => {
    // Ensure session
    await page.goto("/test-auth");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", { timeout: 15000 });

    // Attempt uploading a text/javascript file
    const result = await page.evaluate(async () => {
      const blob = new Blob(["console.log('malicious script');"], {
        type: "application/javascript",
      });
      const formData = new FormData();
      formData.append("file", blob, "exploit.js");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      return {
        status: res.status,
        data: await res.json(),
      };
    });

    expect(result.status).toBe(400);
    expect(result.data.error).toContain("Invalid file type");
  });

  test("TC-205.6: Missing file field returns 400 Bad Request", async ({
    page,
  }) => {
    // Ensure session
    await page.goto("/test-auth");
    await page.fill("#email-input", "admin@example.com");
    await page.fill("#password-input", "Admin123!");
    await page.click("#login-btn");
    await expect(page.locator("#session-status")).toHaveText("authenticated", { timeout: 15000 });

    // Send empty FormData
    const result = await page.evaluate(async () => {
      const formData = new FormData();
      formData.append("other_field", "value");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      return {
        status: res.status,
        data: await res.json(),
      };
    });

    expect(result.status).toBe(400);
    expect(result.data.error).toContain("Missing required 'file' parameter");
  });
});
